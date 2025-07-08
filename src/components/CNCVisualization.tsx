import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download, Play, Pause, RotateCcw, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type CNCMachine = Tables<'cnc_machines'>;
type Toolpath = Tables<'toolpaths'>;

interface Point {
  x: number;
  y: number;
  z?: number;
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

  // Save toolpath mutation
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
    }
  });

  // Update machine parameters when selected machine changes
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
    }
  }, [selectedMachine]);

  // Canvas setup and drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context and apply zoom/pan
    ctx.save();
    ctx.translate(canvas.width / 2 + panOffset.x, canvas.height / 2 + panOffset.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw axes
    drawAxes(ctx, canvas.width, canvas.height);

    // Draw toolpath
    if (points.length > 0) {
      drawToolpath(ctx, points, currentPoint);
    }

    // Restore context
    ctx.restore();

    // Draw machine info (not affected by zoom)
    if (selectedMachine) {
      drawMachineInfo(ctx, selectedMachine);
    }

    // Draw cursor distance (not affected by zoom)
    if (points.length > 0 && !isDragging) {
      drawCursorDistance(ctx);
    }

    // Draw zoom level
    drawZoomLevel(ctx);
  }, [points, currentPoint, selectedMachine, mousePos, isDragging, zoom, panOffset]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    const gridSize = 20; // 20 pixels = 2mm

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText('X', width - 20, centerY - 10);
    ctx.fillText('Y', centerX + 10, 20);
  };

  const drawToolpath = (ctx: CanvasRenderingContext2D, pathPoints: Point[], current: number) => {
    if (pathPoints.length < 2) return;

    const centerX = canvasRef.current!.width / 2;
    const centerY = canvasRef.current!.height / 2;

    // Draw path lines
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const point1 = pathPoints[i];
      const point2 = pathPoints[i + 1];
      
      const canvasX1 = centerX + point1.x;
      const canvasY1 = centerY - point1.y;
      const canvasX2 = centerX + point2.x;
      const canvasY2 = centerY - point2.y;

      // Color finished steps in red during simulation
      if (isSimulating && i < current) {
        ctx.strokeStyle = '#ef4444';
      } else {
        ctx.strokeStyle = '#3b82f6';
      }
      
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvasX1, canvasY1);
      ctx.lineTo(canvasX2, canvasY2);
      ctx.stroke();
    }

    // Draw points
    pathPoints.forEach((point, index) => {
      const canvasX = centerX + point.x;
      const canvasY = centerY - point.y;

      // Current point during simulation
      if (isSimulating && index === current) {
        ctx.fillStyle = '#22c55e'; // Green for current
      } else if (isSimulating && index < current) {
        ctx.fillStyle = '#ef4444'; // Red for finished
      } else {
        ctx.fillStyle = '#3b82f6'; // Blue for unprocessed
      }
      
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw point coordinates in mm
      const mmX = (point.x * MM_PER_PIXEL).toFixed(1);
      const mmY = (point.y * MM_PER_PIXEL).toFixed(1);
      ctx.fillStyle = '#374151';
      ctx.font = '10px sans-serif';
      ctx.fillText(`(${mmX}, ${mmY})mm`, canvasX + 8, canvasY - 8);
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
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const lastPoint = points[points.length - 1];
    const lastCanvasX = centerX + lastPoint.x * zoom + panOffset.x;
    const lastCanvasY = centerY - lastPoint.y * zoom + panOffset.y;
    
    const cursorX = mousePos.x;
    const cursorY = mousePos.y;
    
    const pixelDistance = Math.sqrt(
      Math.pow(cursorX - lastCanvasX, 2) + Math.pow(cursorY - lastCanvasY, 2)
    );
    const mmDistance = (pixelDistance * MM_PER_PIXEL / zoom).toFixed(1);

    // Draw line from last point to cursor
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(lastCanvasX, lastCanvasY);
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

  const getPointAtPosition = (x: number, y: number): number | null => {
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const canvasX = centerX + point.x * zoom + panOffset.x;
      const canvasY = centerY - point.y * zoom + panOffset.y;
      
      const distance = Math.sqrt(Math.pow(x - canvasX, 2) + Math.pow(y - canvasY, 2));
      if (distance <= 8) { // 8px radius for click detection
        return i;
      }
    }
    return null;
  };

  const canvasToWorldCoords = (canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const worldX = Math.round((canvasX - centerX - panOffset.x) / zoom);
    const worldY = Math.round((centerY - canvasY + panOffset.y) / zoom);
    
    return { x: worldX, y: worldY };
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
      const worldCoords = canvasToWorldCoords(x, y);
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

    const worldCoords = canvasToWorldCoords(x, y);
    console.log('Adding point:', worldCoords);
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

  // Start simulation
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

  // Reset simulation
  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentPoint(0);
  };

  // Clear points
  const clearPoints = () => {
    setPoints([]);
    setCurrentPoint(0);
  };

  // Load toolpath
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2D CNC Visualization</h3>
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
              width={600}
              height={400}
              className="border border-gray-300 cursor-crosshair"
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
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Saved Toolpaths</h4>
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
            </div>
          )}
        </>
      )}
    </Card>
  );
};
