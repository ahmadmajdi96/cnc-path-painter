
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download, Play, Pause, RotateCcw } from 'lucide-react';
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

  const queryClient = useQueryClient();

  // Fetch selected machine data
  const { data: selectedMachine } = useQuery({
    queryKey: ['cnc-machine', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      const { data, error } = await supabase
        .from('cnc_machines')
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
    queryKey: ['toolpaths', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return [];
      const { data, error } = await supabase
        .from('toolpaths')
        .select('*')
        .eq('cnc_machine_id', selectedMachineId)
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
        .from('toolpaths')
        .insert({
          cnc_machine_id: selectedMachineId,
          name: toolpathName || `Toolpath ${Date.now()}`,
          points: points,
          machine_params: machineParams
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolpaths', selectedMachineId] });
      setToolpathName('');
    }
  });

  // Update machine parameters when selected machine changes
  useEffect(() => {
    if (selectedMachine) {
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

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw axes
    drawAxes(ctx, canvas.width, canvas.height);

    // Draw toolpath
    if (points.length > 0) {
      drawToolpath(ctx, points, currentPoint);
    }

    // Draw machine info
    if (selectedMachine) {
      drawMachineInfo(ctx, selectedMachine);
    }
  }, [points, currentPoint, selectedMachine]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += 20) {
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

    // Draw path
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < pathPoints.length; i++) {
      const point = pathPoints[i];
      const canvasX = centerX + point.x;
      const canvasY = centerY - point.y; // Flip Y for canvas coordinates

      if (i === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();

    // Draw points
    pathPoints.forEach((point, index) => {
      const canvasX = centerX + point.x;
      const canvasY = centerY - point.y;

      ctx.fillStyle = index === current ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw point coordinates
      ctx.fillStyle = '#374151';
      ctx.font = '10px sans-serif';
      ctx.fillText(`(${point.x}, ${point.y})`, canvasX + 6, canvasY - 6);
    });
  };

  const drawMachineInfo = (ctx: CanvasRenderingContext2D, machine: CNCMachine) => {
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Machine: ${machine.name} - ${machine.model}`, 10, 30);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - canvas.width / 2;
    const y = -(event.clientY - rect.top - canvas.height / 2); // Flip Y for normal coordinates

    setPoints(prev => [...prev, { x: Math.round(x), y: Math.round(y) }]);
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
    const pathPoints = Array.isArray(toolpath.points) 
      ? toolpath.points as Point[]
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
      if (index === 0) {
        gcode += `G0 X${point.x} Y${point.y} ; Rapid to start position\n`;
        gcode += `G1 Z${machineParams.workHeight} F${machineParams.plungeRate} ; Plunge\n`;
      } else {
        gcode += `G1 X${point.x} Y${point.y} F${machineParams.feedRate}\n`;
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

          {/* Canvas */}
          <div className="mb-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="border border-gray-300 cursor-crosshair"
              onClick={handleCanvasClick}
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
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Saved Toolpaths</h4>
              <div className="space-y-2">
                {toolpaths.map((toolpath) => (
                  <div
                    key={toolpath.id}
                    className="flex items-center justify-between p-2 border border-gray-200 rounded"
                  >
                    <span className="text-sm">{toolpath.name} ({Array.isArray(toolpath.points) ? toolpath.points.length : 0} points)</span>
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
