
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Upload, Square, RotateCcw, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Point {
  id: string;
  x: number;
  y: number;
  z: number;
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
  const [isRunning, setIsRunning] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showDistance, setShowDistance] = useState(false);
  const [pathName, setPathName] = useState('New Toolpath');
  
  const [machineParams, setMachineParams] = useState<MachineParams>({
    spindleSpeed: 15000,
    feedRate: 1000,
    plungeRate: 300,
    safeHeight: 5,
    workHeight: -2
  });

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
          name: pathName,
          points: points,
          machine_params: machineParams
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolpaths', selectedMachineId] });
      setPoints([]);
      setPathName('New Toolpath');
    }
  });

  // Update machine params when selected machine changes
  useEffect(() => {
    if (selectedMachine) {
      setMachineParams({
        spindleSpeed: selectedMachine.max_spindle_speed || 15000,
        feedRate: selectedMachine.max_feed_rate || 1000,
        plungeRate: selectedMachine.plunge_rate || 300,
        safeHeight: selectedMachine.safe_height || 5,
        workHeight: selectedMachine.work_height || -2
      });
    }
  }, [selectedMachine]);

  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculateEstimatedTime = () => {
    if (points.length < 2) return 0;
    
    let totalTime = 0;
    const { feedRate, plungeRate, safeHeight, workHeight } = machineParams;
    
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        const distance = Math.sqrt(points[0].x ** 2 + points[0].y ** 2);
        totalTime += (distance / feedRate) * 60;
        totalTime += (Math.abs(safeHeight - workHeight) / plungeRate) * 60;
      } else {
        const distance = calculateDistance(points[i-1], points[i]);
        totalTime += (distance / feedRate) * 60;
      }
    }
    
    totalTime += (Math.abs(workHeight - safeHeight) / plungeRate) * 60;
    return Math.round(totalTime);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const machineX = ((x / canvas.width) * 200) - 100;
    const machineY = (((canvas.height - y) / canvas.height) * 200) - 100;
    
    const newPoint: Point = {
      id: Date.now().toString(),
      x: Math.round(machineX * 10) / 10,
      y: Math.round(machineY * 10) / 10,
      z: machineParams.workHeight
    };
    
    setPoints(prev => [...prev, newPoint]);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePos({ x, y });
    setShowDistance(points.length > 0);
  };

  const handleCanvasMouseLeave = () => setShowDistance(false);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    const gridSize = 20;
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Draw toolpath
    if (points.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      points.forEach((point, index) => {
        const canvasX = ((point.x + 100) / 200) * canvas.width;
        const canvasY = canvas.height - (((point.y + 100) / 200) * canvas.height);
        
        if (index === 0) {
          ctx.moveTo(canvasX, canvasY);
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      });
      
      ctx.stroke();
    }
    
    // Draw points
    points.forEach((point, index) => {
      const canvasX = ((point.x + 100) / 200) * canvas.width;
      const canvasY = canvas.height - (((point.y + 100) / 200) * canvas.height);
      
      if (isRunning && index <= currentPoint) {
        ctx.fillStyle = index === currentPoint ? '#ef4444' : '#22c55e';
      } else {
        ctx.fillStyle = '#3b82f6';
      }
      
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), canvasX, canvasY + 4);
    });
    
    // Draw distance indicator
    if (showDistance && points.length > 0) {
      const lastPoint = points[points.length - 1];
      const lastCanvasX = ((lastPoint.x + 100) / 200) * canvas.width;
      const lastCanvasY = canvas.height - (((lastPoint.y + 100) / 200) * canvas.height);
      
      const mouseMachineX = ((mousePos.x / canvas.width) * 200) - 100;
      const mouseMachineY = (((canvas.height - mousePos.y) / canvas.height) * 200) - 100;
      
      const distance = calculateDistance(
        { x: lastPoint.x, y: lastPoint.y },
        { x: mouseMachineX, y: mouseMachineY }
      );
      
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(lastCanvasX, lastCanvasY);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${distance.toFixed(1)}mm`, mousePos.x + 10, mousePos.y - 10);
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [points, currentPoint, isRunning, mousePos, showDistance]);

  const simulateOperation = () => {
    if (points.length === 0) return;
    
    setIsRunning(true);
    setCurrentPoint(0);
    
    const interval = setInterval(() => {
      setCurrentPoint(prev => {
        if (prev >= points.length - 1) {
          setIsRunning(false);
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const clearPath = () => {
    setPoints([]);
    setCurrentPoint(0);
    setIsRunning(false);
  };

  const estimatedTime = calculateEstimatedTime();

  if (!selectedMachineId) {
    return (
      <Card className="p-4 bg-white border border-gray-200 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">No Machine Selected</h3>
          <p>Please select a CNC machine from the list to view its toolpath visualization.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">2D Toolpath Visualization</h3>
          {selectedMachine && (
            <p className="text-sm text-gray-600">{selectedMachine.name} - {selectedMachine.model}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {estimatedTime > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Est. Time: {Math.floor(estimatedTime / 60)}:{(estimatedTime % 60).toString().padStart(2, '0')}
            </Badge>
          )}
          <div className="flex gap-2">
            <Button
              onClick={simulateOperation}
              disabled={points.length === 0 || isRunning}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-1" />
              {isRunning ? 'Running...' : 'Play'}
            </Button>
            <Button
              onClick={clearPath}
              disabled={isRunning}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              onClick={() => setIsRunning(false)}
              disabled={!isRunning}
              size="sm"
              variant="outline"
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
            <Button
              onClick={() => saveToolpathMutation.mutate()}
              disabled={points.length === 0 || saveToolpathMutation.isPending}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload G-Code
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="border border-gray-300 rounded-lg cursor-crosshair w-full"
            style={{ maxHeight: '400px' }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
          />
          <p className="text-sm text-gray-600 mt-2">
            Click on the canvas to add points. Yellow dashed line shows distance from the last point.
          </p>
        </div>

        <div className="w-64 space-y-4">
          <div>
            <Label htmlFor="pathName">Toolpath Name</Label>
            <Input
              id="pathName"
              value={pathName}
              onChange={(e) => setPathName(e.target.value)}
              className="h-8"
            />
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Machine Parameters</h4>
            <div className="space-y-2 text-sm">
              <div>
                <Label htmlFor="spindleSpeed">Spindle Speed (RPM)</Label>
                <Input
                  id="spindleSpeed"
                  type="number"
                  value={machineParams.spindleSpeed}
                  onChange={(e) => setMachineParams(prev => ({
                    ...prev,
                    spindleSpeed: Number(e.target.value)
                  }))}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="feedRate">Feed Rate (mm/min)</Label>
                <Input
                  id="feedRate"
                  type="number"
                  value={machineParams.feedRate}
                  onChange={(e) => setMachineParams(prev => ({
                    ...prev,
                    feedRate: Number(e.target.value)
                  }))}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="plungeRate">Plunge Rate (mm/min)</Label>
                <Input
                  id="plungeRate"
                  type="number"
                  value={machineParams.plungeRate}
                  onChange={(e) => setMachineParams(prev => ({
                    ...prev,
                    plungeRate: Number(e.target.value)
                  }))}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="safeHeight">Safe Height (mm)</Label>
                <Input
                  id="safeHeight"
                  type="number"
                  step="0.1"
                  value={machineParams.safeHeight}
                  onChange={(e) => setMachineParams(prev => ({
                    ...prev,
                    safeHeight: Number(e.target.value)
                  }))}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="workHeight">Work Height (mm)</Label>
                <Input
                  id="workHeight"
                  type="number"
                  step="0.1"
                  value={machineParams.workHeight}
                  onChange={(e) => setMachineParams(prev => ({
                    ...prev,
                    workHeight: Number(e.target.value)
                  }))}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Points ({points.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {points.map((point, index) => (
                <div key={point.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                  <span className="flex-1">
                    P{index + 1}: X{point.x} Y{point.y} Z{point.z}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {toolpaths.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Saved Toolpaths</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {toolpaths.map((toolpath) => (
                  <div key={toolpath.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{toolpath.name}</div>
                    <div className="text-gray-500">{Array.isArray(toolpath.points) ? toolpath.points.length : 0} points</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
