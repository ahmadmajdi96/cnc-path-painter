import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download, Play, Pause, RotateCcw, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

type CNCMachine = Tables<'cnc_machines'>;
type Toolpath = Tables<'toolpaths'>;

interface Point {
  x: number;
  y: number;
}

interface MachineParams {
  spindleSpeed: number;
  feedRate: number;
  plungeRate: number;
  safeHeight: number;
  workHeight: number;
}

interface CNCVisualizationProps {
  selectedMachineId?: string;
}

export const CNCVisualization = ({ selectedMachineId }: CNCVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [machineParams, setMachineParams] = useState<MachineParams>({
    spindleSpeed: 10000,
    feedRate: 1000,
    plungeRate: 200,
    safeHeight: 5,
    workHeight: -2
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [toolpathName, setToolpathName] = useState('');
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [gcodeEndpoint, setGcodeEndpoint] = useState('');

  const { toast } = useToast();

  // Scale factor: 1 pixel = 0.1 mm (can be adjusted)
  const MM_PER_PIXEL = 0.1;

  const queryClient = useQueryClient();

  // Fetch selected machine data
  const { data: selectedMachine } = useQuery({
    queryKey: ['cnc-machine', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      console.log('Fetching machine:', selectedMachineId);
      const { data, error } = await supabase
        .from('cnc_machines')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      if (error) {
        console.error('Error fetching machine:', error);
        throw error;
      }
      console.log('Fetched machine:', data);
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Fetch toolpaths for selected machine
  const { data: toolpaths = [] } = useQuery({
    queryKey: ['toolpaths', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return [];
      console.log('Fetching toolpaths for machine:', selectedMachineId);
      const { data, error } = await supabase
        .from('toolpaths')
        .select('*')
        .eq('cnc_machine_id', selectedMachineId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching toolpaths:', error);
        throw error;
      }
      console.log('Fetched toolpaths:', data);
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Save toolpath mutation with toast
  const saveToolpathMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMachineId || points.length === 0) return;
      
      console.log('Saving toolpath:', { selectedMachineId, points, machineParams });
      const { error } = await supabase
        .from('toolpaths')
        .insert({
          cnc_machine_id: selectedMachineId,
          name: toolpathName || `Toolpath ${Date.now()}`,
          points: points as any,
          machine_params: machineParams as any
        });
      
      if (error) {
        console.error('Error saving toolpath:', error);
        throw error;
      }
      console.log('Toolpath saved successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolpaths', selectedMachineId] });
      setToolpathName('');
      toast({
        title: "Toolpath Saved",
        description: "Your toolpath has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save toolpath. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update machine endpoint mutation with toast
  const updateEndpointMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      if (!selectedMachineId) return;
      
      const { error } = await supabase
        .from('cnc_machines')
        .update({ endpoint_url: endpoint })
        .eq('id', selectedMachineId);
      
      if (error) {
        console.error('Error updating endpoint:', error);
        throw error;
      }
      console.log('Endpoint updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cnc-machine', selectedMachineId] });
      toast({
        title: "Endpoint Updated",
        description: "Machine endpoint has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update endpoint. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (selectedMachine) {
      console.log('Updating machine params from selected machine:', selectedMachine);
      setMachineParams({
        spindleSpeed: selectedMachine.max_spindle_speed || 10000,
        feedRate: selectedMachine.max_feed_rate || 1000,
        plungeRate: selectedMachine.plunge_rate || 200,
        safeHeight: Number(selectedMachine.safe_height) || 5,
        workHeight: Number(selectedMachine.work_height) || -2
      });
      setGcodeEndpoint(selectedMachine.endpoint_url || '');
    }
  }, [selectedMachine]);

  useEffect(() => {
    if (toolpaths.length > 0 && selectedMachineId) {
      const latestToolpath = toolpaths[0];
      console.log('Auto-loading latest toolpath:', latestToolpath);
      loadToolpath(latestToolpath);
    }
  }, [toolpaths, selectedMachineId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up coordinate system with origin at center
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x / zoom, panOffset.y / zoom);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw axes
    drawAxes(ctx, canvas.width, canvas.height);

    // Draw toolpath
    if (points.length > 0) {
      drawToolpath(ctx, points, currentPoint);
    }

    ctx.restore();

    // Draw machine info (not affected by transformations)
    if (selectedMachine) {
      drawMachineInfo(ctx, selectedMachine);
    }

    // Draw cursor distance (not affected by transformations)
    if (points.length > 0 && !isDragging) {
      drawCursorDistance(ctx);
    }

    // Draw zoom level (not affected by transformations)
    drawZoomLevel(ctx);
  }, [points, currentPoint, selectedMachine, mousePos, isDragging, zoom, panOffset]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    const gridSize = 20; // 20 pixels = 2mm at current scale
    const extent = Math.max(width, height) / zoom;

    // Vertical lines
    for (let x = -extent; x <= extent; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -extent);
      ctx.lineTo(x, extent);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = -extent; y <= extent; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-extent, y);
      ctx.lineTo(extent, y);
      ctx.stroke();
    }
  };

  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    const extent = Math.max(width, height) / zoom;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(-extent, 0);
    ctx.lineTo(extent, 0);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(0, -extent);
    ctx.lineTo(0, extent);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText('X', extent - 20, -10);
    ctx.fillText('Y', 10, -extent + 20);
  };

  const drawToolpath = (ctx: CanvasRenderingContext2D, pathPoints: Point[], current: number) => {
    if (pathPoints.length < 2) return;

    // Draw path lines
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const point1 = pathPoints[i];
      const point2 = pathPoints[i + 1];

      // Color finished steps in red during simulation
      if (isSimulating && i < current) {
        ctx.strokeStyle = '#ef4444';
      } else {
        ctx.strokeStyle = '#3b82f6';
      }
      
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(point1.x, point1.y);
      ctx.lineTo(point2.x, point2.y);
      ctx.stroke();
    }

    // Draw points
    pathPoints.forEach((point, index) => {
      // Current point during simulation
      if (isSimulating && index === current) {
        ctx.fillStyle = '#22c55e'; // Green for current
      } else if (isSimulating && index < current) {
        ctx.fillStyle = '#ef4444'; // Red for finished
      } else {
        ctx.fillStyle = '#3b82f6'; // Blue for unprocessed
      }
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw point coordinates in mm
      const mmX = (point.x * MM_PER_PIXEL).toFixed(1);
      const mmY = (point.y * MM_PER_PIXEL).toFixed(1);
      ctx.fillStyle = '#374151';
      ctx.font = '10px sans-serif';
      ctx.fillText(`(${mmX}, ${mmY})mm`, point.x + 8, point.y - 8);
    });
  };

  const drawMachineInfo = (ctx: CanvasRenderingContext2D, machine: CNCMachine) => {
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Machine: ${machine.name} - ${machine.model}`, 10, 30);
  };

  const drawCursorDistance = (ctx: CanvasRenderingContext2D) => {
    if (points.length === 0) return;

    const canvas = canvasRef.current!;
    const lastPoint = points[points.length - 1];
    
    // Convert last point to screen coordinates
    const screenCoords = worldToScreenCoords(lastPoint.x, lastPoint.y);
    
    const cursorX = mousePos.x;
    const cursorY = mousePos.y;
    
    const pixelDistance = Math.sqrt(
      Math.pow(cursorX - screenCoords.x, 2) + Math.pow(cursorY - screenCoords.y, 2)
    );
    const mmDistance = (pixelDistance * MM_PER_PIXEL / zoom).toFixed(1);

    // Draw line from last point to cursor
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(screenCoords.x, screenCoords.y);
    ctx.lineTo(cursorX, cursorY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw distance text
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${mmDistance}mm`, cursorX + 10, cursorY - 10);
  };

  const drawZoomLevel = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Zoom: ${(zoom * 100).toFixed(0)}%`, 10, canvasRef.current!.height - 10);
  };

  // Convert world coordinates to screen coordinates
  const worldToScreenCoords = (worldX: number, worldY: number) => {
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const screenX = centerX + (worldX * zoom) + panOffset.x;
    const screenY = centerY + (worldY * zoom) + panOffset.y;
    
    return { x: screenX, y: screenY };
  };

  // Convert screen coordinates to world coordinates
  const screenToWorldCoords = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const worldX = (screenX - centerX - panOffset.x) / zoom;
    const worldY = (screenY - centerY - panOffset.y) / zoom;
    
    return { x: Math.round(worldX), y: Math.round(worldY) };
  };

  const getPointAtPosition = (x: number, y: number): number | null => {
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const screenCoords = worldToScreenCoords(point.x, point.y);
      
      const distance = Math.sqrt(Math.pow(x - screenCoords.x, 2) + Math.pow(y - screenCoords.y, 2));
      if (distance <= 8) { // 8px radius for click detection
        return i;
      }
    }
    return null;
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const pointIndex = getPointAtPosition(x, y);
    if (pointIndex !== null) {
      setDraggedPointIndex(pointIndex);
      setIsDragging(true);
      canvas.style.cursor = 'grabbing';
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePos({ x, y });

    if (isDragging && draggedPointIndex !== null) {
      const worldCoords = screenToWorldCoords(x, y);
      setPoints(prev => {
        const newPoints = [...prev];
        newPoints[draggedPointIndex] = worldCoords;
        return newPoints;
      });
    } else {
      // Check if hovering over a point
      const pointIndex = getPointAtPosition(x, y);
      canvas.style.cursor = pointIndex !== null ? 'grab' : 'crosshair';
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedPointIndex(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'crosshair';
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Don't add new point if clicking on existing point
    if (getPointAtPosition(x, y) !== null) return;

    const worldCoords = screenToWorldCoords(x, y);
    console.log('Adding point at cursor:', { x, y }, 'world coords:', worldCoords);
    setPoints(prev => [...prev, worldCoords]);
  };

  const handleCanvasWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const newZoom = event.deltaY > 0 
      ? Math.max(0.1, zoom - zoomSpeed)
      : Math.min(5, zoom + zoomSpeed);
    setZoom(newZoom);
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(5, prev + 0.2));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(0.1, prev - 0.2));
  };

  const resetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const startSimulation = () => {
    if (points.length === 0) return;
    
    setIsSimulating(true);
    setCurrentPoint(0);

    const interval = setInterval(() => {
      setCurrentPoint(prev => {
        if (prev >= points.length - 1) {
          setIsSimulating(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentPoint(0);
  };

  const clearPoints = () => {
    setPoints([]);
    setCurrentPoint(0);
  };

  const loadToolpath = (toolpath: Toolpath) => {
    console.log('Loading toolpath:', toolpath);
    const pathPoints = Array.isArray(toolpath.points) 
      ? (toolpath.points as unknown as Point[])
      : [];
    setPoints(pathPoints);
    setCurrentPoint(0);
    
    if (toolpath.machine_params) {
      const params = toolpath.machine_params as any;
      setMachineParams({
        spindleSpeed: params.spindleSpeed || machineParams.spindleSpeed,
        feedRate: params.feedRate || machineParams.feedRate,
        plungeRate: params.plungeRate || machineParams.plungeRate,
        safeHeight: params.safeHeight || machineParams.safeHeight,
        workHeight: params.workHeight || machineParams.workHeight
      });
    }
  };

  const generateGCode = () => {
    if (points.length === 0) return '';

    let gcode = '; Generated G-Code\n';
    gcode += `; Machine: ${selectedMachine?.name || 'Unknown'}\n`;
    gcode += `; Date: ${new Date().toISOString()}\n\n`;
    
    gcode += 'G21 ; Set units to millimeters\n';
    gcode += 'G90 ; Absolute positioning\n';
    gcode += `M3 S${machineParams.spindleSpeed} ; Start spindle\n`;
    gcode += `G0 Z${machineParams.safeHeight} ; Move to safe height\n\n`;

    points.forEach((point, index) => {
      const mmX = (point.x * MM_PER_PIXEL).toFixed(3);
      const mmY = (point.y * MM_PER_PIXEL).toFixed(3);
      
      if (index === 0) {
        gcode += `G0 X${mmX} Y${mmY} ; Rapid to start position\n`;
        gcode += `G1 Z${machineParams.workHeight} F${machineParams.plungeRate} ; Plunge\n`;
      } else {
        gcode += `G1 X${mmX} Y${mmY} F${machineParams.feedRate}\n`;
      }
    });

    gcode += `G0 Z${machineParams.safeHeight} ; Retract to safe height\n`;
    gcode += 'M5 ; Stop spindle\n';
    gcode += 'G0 X0 Y0 ; Return to origin\n';

    return gcode;
  };

  const downloadGCode = () => {
    const gcode = generateGCode();
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolpathName || 'toolpath'}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendGCodeToMachine = async () => {
    if (!gcodeEndpoint || points.length === 0) return;
    
    const gcode = generateGCode();
    try {
      const response = await fetch(gcodeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: gcode,
      });
      
      if (response.ok) {
        console.log('G-code sent successfully');
        toast({
          title: "G-Code Sent",
          description: "G-code has been sent to the machine successfully.",
        });
      } else {
        console.error('Failed to send G-code');
        toast({
          title: "Send Failed",
          description: "Failed to send G-code to machine. Please check the endpoint.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending G-code:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the machine. Please check the endpoint.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsedPoints = parseGCode(content);
      if (parsedPoints.length > 0) {
        setPoints(parsedPoints);
        console.log('Loaded G-code with', parsedPoints.length, 'points');
      }
    };
    reader.readAsText(file);
  };

  const parseGCode = (gcode: string): Point[] => {
    const lines = gcode.split('\n');
    const points: Point[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('G1') || trimmedLine.startsWith('G0')) {
        const xMatch = trimmedLine.match(/X([-\d.]+)/);
        const yMatch = trimmedLine.match(/Y([-\d.]+)/);
        
        if (xMatch && yMatch) {
          // Convert from mm to pixels
          const mmX = parseFloat(xMatch[1]);
          const mmY = parseFloat(yMatch[1]);
          points.push({
            x: Math.round(mmX / MM_PER_PIXEL),
            y: Math.round(mmY / MM_PER_PIXEL)
          });
        }
      }
    }
    
    return points;
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2D CNC Visualization (X/Y View)</h3>
        {!selectedMachineId && (
          <p className="text-gray-600 text-sm">Select a machine to start creating toolpaths</p>
        )}
      </div>

      {selectedMachineId && (
        <>
          {/* Machine Parameters */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spindleSpeed">Spindle Speed (RPM)</Label>
              <Input
                id="spindleSpeed"
                type="number"
                value={machineParams.spindleSpeed}
                onChange={(e) => setMachineParams(p => ({ ...p, spindleSpeed: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="feedRate">Feed Rate (mm/min)</Label>
              <Input
                id="feedRate"
                type="number"
                value={machineParams.feedRate}
                onChange={(e) => setMachineParams(p => ({ ...p, feedRate: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Canvas with zoom controls */}
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <Button onClick={zoomIn} size="sm" variant="outline">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button onClick={zoomOut} size="sm" variant="outline">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button onClick={resetZoom} size="sm" variant="outline">
                Reset View
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="border border-gray-300 cursor-crosshair w-full"
              style={{ maxWidth: '100%', height: 'auto', touchAction: 'none' }}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onWheel={handleCanvasWheel}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={startSimulation}
              disabled={isSimulating || points.length === 0}
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Simulate
            </Button>
            <Button
              onClick={resetSimulation}
              disabled={!isSimulating && currentPoint === 0}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={clearPoints}
              size="sm"
              variant="outline"
            >
              Clear
            </Button>
            <Button
              onClick={downloadGCode}
              disabled={points.length === 0}
              size="sm"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              G-Code
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload G-Code
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".gcode,.nc,.cnc"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {/* Save Toolpath */}
          {points.length > 0 && (
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Toolpath name"
                value={toolpathName}
                onChange={(e) => setToolpathName(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => saveToolpathMutation.mutate()}
                disabled={saveToolpathMutation.isPending}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}

          {/* Saved Toolpaths */}
          {toolpaths.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Saved Toolpaths</h4>
              <ScrollArea className="h-40 border border-gray-200 rounded p-2">
                <div className="space-y-2">
                  {toolpaths.map((toolpath) => (
                    <div
                      key={toolpath.id}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded"
                    >
                      <span className="text-sm">{toolpath.name} ({Array.isArray(toolpath.points) ? (toolpath.points as unknown as Point[]).length : 0} points)</span>
                      <Button
                        onClick={() => loadToolpath(toolpath)}
                        size="sm"
                        variant="outline"
                      >
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* G-Code Endpoint Configuration */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">G-Code Endpoint</h4>
            {selectedMachine?.endpoint_url && (
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Current Endpoint:</span>
                  <span className="text-sm text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded">
                    {selectedMachine.endpoint_url}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="http://machine-ip:port/gcode"
                value={gcodeEndpoint}
                onChange={(e) => setGcodeEndpoint(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => updateEndpointMutation.mutate(gcodeEndpoint)}
                disabled={updateEndpointMutation.isPending}
                size="sm"
                variant="outline"
              >
                Save
              </Button>
              <Button
                onClick={sendGCodeToMachine}
                disabled={!gcodeEndpoint || points.length === 0}
                size="sm"
              >
                Send G-Code
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
