import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Download, Play, Pause, RotateCcw, Upload, ZoomIn, ZoomOut, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EndpointManager } from './EndpointManager';
import { useToast } from '@/hooks/use-toast';

type LaserMachine = Tables<'laser_machines'>;
type LaserToolpath = Tables<'laser_toolpaths'>;

interface Point {
  x: number;
  y: number;
}

interface LaserParams {
  power: number;
  frequency: number;
  speed: number;
  passes: number;
}

interface LaserVisualizationProps {
  selectedMachineId?: string;
}

export const LaserVisualization = ({ selectedMachineId }: LaserVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [laserParams, setLaserParams] = useState<LaserParams>({
    power: 50,
    frequency: 2000,
    speed: 100,
    passes: 1
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [toolpathName, setToolpathName] = useState('');
  const [loadedToolpathId, setLoadedToolpathId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const { toast } = useToast();

  // Scale factor: 1 pixel = 0.1 mm (can be adjusted)
  const MM_PER_PIXEL = 0.1;

  const queryClient = useQueryClient();

  // Fetch selected machine data
  const { data: selectedMachine } = useQuery({
    queryKey: ['laser-machine', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      const { data, error } = await supabase
        .from('laser_machines')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Fetch toolpaths for selected machine
  const { data: toolpaths = [] } = useQuery({
    queryKey: ['laser-toolpaths', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return [];
      const { data, error } = await supabase
        .from('laser_toolpaths')
        .select('*')
        .eq('laser_machine_id', selectedMachineId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Save toolpath mutation
  const saveToolpathMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMachineId || points.length === 0) return;
      
      const { error } = await supabase
        .from('laser_toolpaths')
        .insert({
          laser_machine_id: selectedMachineId,
          name: toolpathName || `Toolpath ${Date.now()}`,
          points: points as any,
          laser_params: laserParams as any
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laser-toolpaths', selectedMachineId] });
      setToolpathName('');
      toast({
        title: "Success",
        description: "Toolpath saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save toolpath",
        variant: "destructive"
      });
    }
  });

  // Send G-code mutation
  const sendGcodeMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      if (!endpoint) {
        throw new Error('No endpoint selected');
      }
      
      const gcode = generateGCode();
      console.log('Sending G-code to endpoint:', endpoint);
      console.log('G-code content:', gcode);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json',
        },
        body: gcode,
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "G-code sent successfully to the machine",
      });
    },
    onError: (error) => {
      console.error('Send G-code error:', error);
      toast({
        title: "Error",
        description: `Failed to send G-code: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (selectedMachine) {
      setLaserParams({
        power: selectedMachine.max_power || 50,
        frequency: selectedMachine.max_frequency || 2000,
        speed: selectedMachine.max_speed || 100,
        passes: 1
      });
      setSelectedEndpoint(selectedMachine.endpoint_url || '');
    }
  }, [selectedMachine]);

  useEffect(() => {
    if (toolpaths.length > 0 && selectedMachineId) {
      const latestToolpath = toolpaths[0];
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

    // Draw cursor distance (not affected by zoom)
    if (points.length > 0 && !isDragging) {
      drawCursorDistance(ctx);
    }
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
        ctx.strokeStyle = '#8b5cf6'; // Purple for laser
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
        ctx.fillStyle = '#8b5cf6'; // Purple for unprocessed
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

  const generateGCode = () => {
    if (points.length === 0) return '';

    let gcode = '; Generated Laser G-Code\n';
    gcode += `; Machine: ${selectedMachine?.name || 'Unknown'}\n`;
    gcode += `; Power: ${laserParams.power}%\n`;
    gcode += `; Frequency: ${laserParams.frequency}Hz\n`;
    gcode += `; Speed: ${laserParams.speed}mm/min\n`;
    gcode += `; Passes: ${laserParams.passes}\n`;
    gcode += `; Date: ${new Date().toISOString()}\n\n`;
    
    gcode += 'G21 ; Set units to millimeters\n';
    gcode += 'G90 ; Absolute positioning\n';
    gcode += 'G0 Z5 ; Move to safe height\n\n';

    for (let pass = 0; pass < laserParams.passes; pass++) {
      gcode += `; Pass ${pass + 1}\n`;
      
      points.forEach((point, index) => {
        const mmX = (point.x * MM_PER_PIXEL).toFixed(3);
        const mmY = (point.y * MM_PER_PIXEL).toFixed(3);
        
        if (index === 0) {
          gcode += `G0 X${mmX} Y${mmY} ; Rapid to start position\n`;
          gcode += `G1 Z0 F${laserParams.speed} ; Lower to work height\n`;
          gcode += `M3 S${Math.round(laserParams.power * 2.55)} ; Laser on (0-255 scale)\n`;
        } else {
          gcode += `G1 X${mmX} Y${mmY} F${laserParams.speed}\n`;
        }
      });
      
      gcode += 'M5 ; Laser off\n';
      if (pass < laserParams.passes - 1) {
        gcode += '\n';
      }
    }

    gcode += 'G0 Z5 ; Retract to safe height\n';
    gcode += 'G0 X0 Y0 ; Return to origin\n';

    return gcode;
  };

  const loadToolpath = (toolpath: LaserToolpath) => {
    console.log('Loading toolpath:', toolpath);
    const pathPoints = Array.isArray(toolpath.points) 
      ? (toolpath.points as unknown as Point[])
      : [];
    setPoints(pathPoints);
    setCurrentPoint(0);
    setLoadedToolpathId(toolpath.id);
    
    if (toolpath.laser_params) {
      const params = toolpath.laser_params as any;
      setLaserParams({
        power: params.power || laserParams.power,
        frequency: params.frequency || laserParams.frequency,
        speed: params.speed || laserParams.speed,
        passes: params.passes || laserParams.passes
      });
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX;
    const screenY = event.clientY;
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const worldX = (canvasX - centerX - panOffset.x) / zoom;
    const worldY = (centerY - canvasY + panOffset.y) / zoom;
    
    setPoints(prev => [...prev, { x: Math.round(worldX), y: Math.round(worldY) }]);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const handleCanvasWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const newZoom = event.deltaY > 0 
      ? Math.max(0.1, zoom - zoomSpeed)
      : Math.min(5, zoom + zoomSpeed);
    setZoom(newZoom);
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX;
    const screenY = event.clientY;
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;

    const pointIndex = getPointAtPosition(canvasX, canvasY);
    if (pointIndex !== null) {
      setDraggedPointIndex(pointIndex);
      setIsDragging(true);
      canvas.style.cursor = 'none'; // Hide cursor when dragging
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedPointIndex(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'none'; // Keep cursor hidden
    }
  };

  const handleCanvasMouseEnter = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'none'; // Hide cursor when entering canvas
    }
  };

  const handleCanvasMouseLeave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default'; // Restore cursor when leaving canvas
    }
    // Reset mouse position when leaving canvas
    setMousePos({ x: -1, y: -1 });
  };

  const getPointAtPosition = (screenX: number, screenY: number): number | null => {
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const screenCoords = worldToScreenCoords(point.x, point.y);
      
      const distance = Math.sqrt(
        Math.pow(screenX - screenCoords.x, 2) + 
        Math.pow(screenY - screenCoords.y, 2)
      );
      
      if (distance <= 8) { // 8px radius for click detection
        return i;
      }
    }
    return null;
  };

  const worldToScreenCoords = (worldX: number, worldY: number) => {
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Apply the same transformations as in rendering
    const screenX = centerX + worldX * zoom + panOffset.x;
    const screenY = centerY - worldY * zoom + panOffset.y;
    
    return { x: screenX, y: screenY };
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
    setLoadedToolpathId(null);
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2D Laser Visualization (X/Y View)</h3>
        {!selectedMachineId && (
          <p className="text-gray-600 text-sm">Select a machine to start creating toolpaths</p>
        )}
      </div>

      {selectedMachineId && (
        <>
          {/* Laser Parameters */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="power">Power (%)</Label>
              <Input
                id="power"
                type="number"
                min="0"
                max="100"
                value={laserParams.power}
                onChange={(e) => setLaserParams(p => ({ ...p, power: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency (Hz)</Label>
              <Input
                id="frequency"
                type="number"
                value={laserParams.frequency}
                onChange={(e) => setLaserParams(p => ({ ...p, frequency: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="speed">Speed (mm/min)</Label>
              <Input
                id="speed"
                type="number"
                value={laserParams.speed}
                onChange={(e) => setLaserParams(p => ({ ...p, speed: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="passes">Passes</Label>
              <Input
                id="passes"
                type="number"
                min="1"
                value={laserParams.passes}
                onChange={(e) => setLaserParams(p => ({ ...p, passes: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Canvas with zoom controls */}
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <Button onClick={() => setZoom(prev => Math.min(5, prev + 0.2))} size="sm" variant="outline">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button onClick={() => setZoom(prev => Math.max(0.1, prev - 0.2))} size="sm" variant="outline">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }} size="sm" variant="outline">
                Reset View
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              width={1400}
              height={700}
              className="border border-gray-300 w-full"
              style={{ cursor: 'none' }}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseEnter={() => {
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = 'none';
                }
              }}
              onMouseLeave={() => {
                if (canvasRef.current) {
                  canvasRef.current.style.cursor = 'default';
                }
                setMousePos({ x: -1, y: -1 });
              }}
              onWheel={handleCanvasWheel}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={() => {
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
              }}
              disabled={isSimulating || points.length === 0}
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Simulate
            </Button>
            <Button
              onClick={() => {
                setIsSimulating(false);
                setCurrentPoint(0);
              }}
              disabled={!isSimulating && currentPoint === 0}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => {
                setPoints([]);
                setCurrentPoint(0);
                setLoadedToolpathId(null);
              }}
              size="sm"
              variant="outline"
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                const gcode = generateGCode();
                const blob = new Blob([gcode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${toolpathName || 'toolpath'}.gcode`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={points.length === 0}
              size="sm"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              G-Code
            </Button>
          </div>

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
                      className={`flex items-center justify-between p-2 border rounded ${
                        loadedToolpathId === toolpath.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {toolpath.name} ({Array.isArray(toolpath.points) ? (toolpath.points as unknown as Point[]).length : 0} points)
                        </span>
                        {loadedToolpathId === toolpath.id && (
                          <Badge variant="secondary" className="text-xs">
                            Loaded
                          </Badge>
                        )}
                      </div>
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

          {/* Endpoint Manager */}
          <div className="mb-4">
            <EndpointManager
              selectedMachineId={selectedMachineId}
              onEndpointSelect={setSelectedEndpoint}
              selectedEndpoint={selectedEndpoint}
            />
          </div>

          {/* Send G-Code */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (!selectedEndpoint) {
                  toast({
                    title: "Error",
                    description: "Please select an endpoint first",
                    variant: "destructive"
                  });
                  return;
                }
                sendGcodeMutation.mutate(selectedEndpoint);
              }}
              disabled={!selectedEndpoint || points.length === 0 || sendGcodeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendGcodeMutation.isPending ? 'Sending...' : 'Send G-Code'}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
