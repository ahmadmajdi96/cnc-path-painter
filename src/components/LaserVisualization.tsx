import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download, Play, Pause, RotateCcw, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LaserMachine {
  id: string;
  name: string;
  model: string;
  manufacturer?: string;
  status: string;
  max_power?: number;
  max_frequency?: number;
  max_speed?: number;
  beam_diameter?: number;
  endpoint_url?: string;
  ip_address?: string;
  port?: number;
  protocol?: string;
  created_at: string;
  updated_at: string;
}

interface LaserToolpath {
  id: string;
  laser_machine_id: string;
  name: string;
  points: any;
  laser_params?: any;
  created_at: string;
  updated_at: string;
}

interface Point {
  x: number;
  y: number;
}

interface LaserParams {
  laserPower: number;
  pulseFrequency: number;
  markingSpeed: number;
  pulseDuration: number;
  zOffset: number;
  passes: number;
  laserMode: string;
  beamDiameter: number;
}

interface LaserVisualizationProps {
  selectedMachineId?: string;
}

export const LaserVisualization = ({ selectedMachineId }: LaserVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [laserParams, setLaserParams] = useState<LaserParams>({
    laserPower: 50,
    pulseFrequency: 1000,
    markingSpeed: 500,
    pulseDuration: 100,
    zOffset: 0,
    passes: 1,
    laserMode: 'pulsed',
    beamDiameter: 0.1
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [toolpathName, setToolpathName] = useState('');
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [laserEndpoint, setLaserEndpoint] = useState('');

  // Scale factor: 1 pixel = 0.1 mm
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
          name: toolpathName || `Laser Path ${Date.now()}`,
          points: points,
          laser_params: laserParams
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laser-toolpaths', selectedMachineId] });
      setToolpathName('');
    }
  });

  // Update machine endpoint mutation
  const updateEndpointMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      if (!selectedMachineId) return;
      
      const { error } = await supabase
        .from('laser_machines')
        .update({ endpoint_url: endpoint })
        .eq('id', selectedMachineId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laser-machine', selectedMachineId] });
    }
  });

  useEffect(() => {
    if (selectedMachine) {
      setLaserParams({
        laserPower: selectedMachine.max_power || 50,
        pulseFrequency: selectedMachine.max_frequency || 1000,
        markingSpeed: selectedMachine.max_speed || 500,
        pulseDuration: 100,
        zOffset: 0,
        passes: 1,
        laserMode: 'pulsed',
        beamDiameter: selectedMachine.beam_diameter || 0.1
      });
      setLaserEndpoint(selectedMachine.endpoint_url || '');
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

    // Draw path lines (laser beam path)
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const point1 = pathPoints[i];
      const point2 = pathPoints[i + 1];
      
      const canvasX1 = centerX + point1.x;
      const canvasY1 = centerY - point1.y;
      const canvasX2 = centerX + point2.x;
      const canvasY2 = centerY - point2.y;

      // Color finished steps in red during simulation
      if (isSimulating && i < current) {
        ctx.strokeStyle = '#dc2626'; // Red for laser marked
      } else {
        ctx.strokeStyle = '#7c3aed'; // Purple for laser path
      }
      
      ctx.lineWidth = 3; // Thicker line to represent laser beam
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
        ctx.fillStyle = '#dc2626'; // Red for current laser position
      } else if (isSimulating && index < current) {
        ctx.fillStyle = '#991b1b'; // Dark red for completed
      } else {
        ctx.fillStyle = '#7c3aed'; // Purple for pending
      }
      
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Draw point coordinates in mm
      const mmX = (point.x * MM_PER_PIXEL).toFixed(1);
      const mmY = (point.y * MM_PER_PIXEL).toFixed(1);
      ctx.fillStyle = '#374151';
      ctx.font = '10px sans-serif';
      ctx.fillText(`(${mmX}, ${mmY})mm`, canvasX + 8, canvasY - 8);
    });
  };

  const drawMachineInfo = (ctx: CanvasRenderingContext2D, machine: any) => {
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Laser: ${machine.name} - ${machine.model}`, 10, 30);
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

  const screenToWorldCoords = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const worldX = (canvasX - centerX - panOffset.x) / zoom;
    const worldY = (centerY - canvasY + panOffset.y) / zoom;
    
    return { x: Math.round(worldX), y: Math.round(worldY) };
  };

  const worldToScreenCoords = (worldX: number, worldY: number) => {
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const screenX = centerX + worldX * zoom + panOffset.x;
    const screenY = centerY - worldY * zoom + panOffset.y;
    
    return { x: screenX, y: screenY };
  };

  const getPointAtPosition = (screenX: number, screenY: number): number | null => {
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const screenCoords = worldToScreenCoords(point.x, point.y);
      
      const distance = Math.sqrt(
        Math.pow(screenX - screenCoords.x, 2) + 
        Math.pow(screenY - screenCoords.y, 2)
      );
      
      if (distance <= 8) {
        return i;
      }
    }
    return null;
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
      canvas.style.cursor = 'none';
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX;
    const screenY = event.clientY;
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    setMousePos({ x: canvasX, y: canvasY });

    if (isDragging && draggedPointIndex !== null) {
      const worldCoords = screenToWorldCoords(screenX, screenY);
      setPoints(prev => {
        const newPoints = [...prev];
        newPoints[draggedPointIndex] = worldCoords;
        return newPoints;
      });
    } else {
      const pointIndex = getPointAtPosition(canvasX, canvasY);
      canvas.style.cursor = 'none';
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedPointIndex(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'none';
    }
  };

  const handleCanvasMouseEnter = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'none';
    }
  };

  const handleCanvasMouseLeave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
    setMousePos({ x: -1, y: -1 });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX;
    const screenY = event.clientY;
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;

    if (getPointAtPosition(canvasX, canvasY) !== null) return;

    const worldCoords = screenToWorldCoords(screenX, screenY);
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

  const zoomIn = () => setZoom(prev => Math.min(5, prev + 0.2));
  const zoomOut = () => setZoom(prev => Math.max(0.1, prev - 0.2));
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

  const loadToolpath = (toolpath: any) => {
    const pathPoints = Array.isArray(toolpath.points) 
      ? (toolpath.points as Point[])
      : [];
    setPoints(pathPoints);
    setCurrentPoint(0);
    
    if (toolpath.laser_params) {
      const params = toolpath.laser_params as any;
      setLaserParams({
        laserPower: params.laserPower || laserParams.laserPower,
        pulseFrequency: params.pulseFrequency || laserParams.pulseFrequency,
        markingSpeed: params.markingSpeed || laserParams.markingSpeed,
        pulseDuration: params.pulseDuration || laserParams.pulseDuration,
        zOffset: params.zOffset || laserParams.zOffset,
        passes: params.passes || laserParams.passes,
        laserMode: params.laserMode || laserParams.laserMode,
        beamDiameter: params.beamDiameter || laserParams.beamDiameter
      });
    }
  };

  const generateLaserCode = () => {
    if (points.length === 0) return '';

    let code = '; Generated Laser Marking Code\n';
    code += `; Machine: ${selectedMachine?.name || 'Unknown'}\n`;
    code += `; Date: ${new Date().toISOString()}\n\n`;
    
    code += `LASER_POWER=${laserParams.laserPower}\n`;
    code += `PULSE_FREQ=${laserParams.pulseFrequency}\n`;
    code += `MARK_SPEED=${laserParams.markingSpeed}\n`;
    code += `PULSE_DURATION=${laserParams.pulseDuration}\n`;
    code += `Z_OFFSET=${laserParams.zOffset}\n`;
    code += `PASSES=${laserParams.passes}\n`;
    code += `LASER_MODE=${laserParams.laserMode}\n`;
    code += `BEAM_DIAMETER=${laserParams.beamDiameter}\n\n`;

    points.forEach((point, index) => {
      const mmX = (point.x * MM_PER_PIXEL).toFixed(3);
      const mmY = (point.y * MM_PER_PIXEL).toFixed(3);
      
      if (index === 0) {
        code += `MOVE X${mmX} Y${mmY} ; Move to start position\n`;
        code += `LASER_ON ; Start laser\n`;
      } else {
        code += `MARK X${mmX} Y${mmY} ; Mark to position\n`;
      }
    });

    code += `LASER_OFF ; Stop laser\n`;
    code += `MOVE X0 Y0 ; Return to origin\n`;

    return code;
  };

  const downloadLaserCode = () => {
    const code = generateLaserCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolpathName || 'laser-path'}.lmc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendLaserCodeToMachine = async () => {
    if (!laserEndpoint || points.length === 0) return;
    
    const code = generateLaserCode();
    try {
      const response = await fetch(laserEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: code,
      });
      
      if (response.ok) {
        console.log('Laser code sent successfully');
      } else {
        console.error('Failed to send laser code');
      }
    } catch (error) {
      console.error('Error sending laser code:', error);
    }
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2D Laser Marking Visualization (X/Y View)</h3>
        {!selectedMachineId && (
          <p className="text-gray-600 text-sm">Select a laser machine to start creating marking paths</p>
        )}
      </div>

      {selectedMachineId && (
        <>
          {/* Laser Parameters */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="laserPower">Laser Power (%)</Label>
              <Input
                id="laserPower"
                type="number"
                value={laserParams.laserPower}
                onChange={(e) => setLaserParams(p => ({ ...p, laserPower: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="markingSpeed">Marking Speed (mm/min)</Label>
              <Input
                id="markingSpeed"
                type="number"
                value={laserParams.markingSpeed}
                onChange={(e) => setLaserParams(p => ({ ...p, markingSpeed: Number(e.target.value) }))}
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
              width={1400}
              height={700}
              className="border border-gray-300 w-full"
              style={{ cursor: 'none' }}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseEnter={handleCanvasMouseEnter}
              onMouseLeave={handleCanvasMouseLeave}
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
              onClick={downloadLaserCode}
              disabled={points.length === 0}
              size="sm"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Laser Code
            </Button>
          </div>

          {/* Save Toolpath */}
          {points.length > 0 && (
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Laser path name"
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
              <h4 className="font-medium text-gray-900 mb-2">Saved Laser Paths</h4>
              <ScrollArea className="h-40 border border-gray-200 rounded p-2">
                <div className="space-y-2">
                  {toolpaths.map((toolpath) => (
                    <div
                      key={toolpath.id}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded"
                    >
                      <span className="text-sm">{toolpath.name} ({Array.isArray(toolpath.points) ? (toolpath.points as Point[]).length : 0} points)</span>
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

          {/* Laser Endpoint Configuration */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Laser Endpoint</h4>
            <div className="flex gap-2">
              <Input
                placeholder="http://laser-ip:port/mark"
                value={laserEndpoint}
                onChange={(e) => setLaserEndpoint(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => updateEndpointMutation.mutate(laserEndpoint)}
                disabled={updateEndpointMutation.isPending}
                size="sm"
                variant="outline"
              >
                Save
              </Button>
              <Button
                onClick={sendLaserCodeToMachine}
                disabled={!laserEndpoint || points.length === 0}
                size="sm"
              >
                Send Code
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
