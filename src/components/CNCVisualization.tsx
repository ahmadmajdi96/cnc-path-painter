
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Upload, Square, RotateCcw, Edit3, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

export const CNCVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showDistance, setShowDistance] = useState(false);
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ x: 0, y: 0, z: 0 });
  
  const [machineParams, setMachineParams] = useState<MachineParams>({
    spindleSpeed: 15000,
    feedRate: 1000,
    plungeRate: 300,
    safeHeight: 5,
    workHeight: -2
  });

  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculateEstimatedTime = () => {
    if (points.length < 2) return 0;
    
    let totalTime = 0;
    const { feedRate, plungeRate, safeHeight, workHeight } = machineParams;
    
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        // Initial positioning
        const distance = Math.sqrt(points[0].x ** 2 + points[0].y ** 2);
        totalTime += (distance / feedRate) * 60; // Convert to seconds
        totalTime += (Math.abs(safeHeight - workHeight) / plungeRate) * 60;
      } else {
        // Move between points
        const distance = calculateDistance(points[i-1], points[i]);
        totalTime += (distance / feedRate) * 60;
      }
    }
    
    // Return to safe height at the end
    totalTime += (Math.abs(workHeight - safeHeight) / plungeRate) * 60;
    
    return Math.round(totalTime);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert canvas coordinates to machine coordinates
    const machineX = ((x / canvas.width) * 200) - 100; // -100 to 100mm
    const machineY = (((canvas.height - y) / canvas.height) * 200) - 100; // -100 to 100mm
    
    const newPoint: Point = {
      id: Date.now().toString(),
      x: Math.round(machineX * 10) / 10, // Round to 1 decimal
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

  const handleCanvasMouseLeave = () => {
    setShowDistance(false);
  };

  const startEditing = (point: Point) => {
    setEditingPoint(point.id);
    setEditValues({ x: point.x, y: point.y, z: point.z });
  };

  const saveEdit = () => {
    if (!editingPoint) return;
    
    setPoints(prev => prev.map(p => 
      p.id === editingPoint 
        ? { ...p, ...editValues }
        : p
    ));
    setEditingPoint(null);
  };

  const cancelEdit = () => {
    setEditingPoint(null);
  };

  const deletePoint = (pointId: string) => {
    setPoints(prev => prev.filter(p => p.id !== pointId));
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
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
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Y-axis
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
      
      // Highlight current point during simulation
      if (isRunning && index <= currentPoint) {
        ctx.fillStyle = index === currentPoint ? '#ef4444' : '#22c55e';
      } else {
        ctx.fillStyle = '#3b82f6';
      }
      
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw point number
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
      
      // Convert mouse pos to machine coordinates for distance calculation
      const mouseMachineX = ((mousePos.x / canvas.width) * 200) - 100;
      const mouseMachineY = (((canvas.height - mousePos.y) / canvas.height) * 200) - 100;
      
      const distance = calculateDistance(
        { x: lastPoint.x, y: lastPoint.y },
        { x: mouseMachineX, y: mouseMachineY }
      );
      
      // Draw line from last point to mouse
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(lastCanvasX, lastCanvasY);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw distance text
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

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">2D Toolpath Visualization</h3>
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
            Click on the canvas to add points. The yellow dashed line shows distance from the last point.
          </p>
        </div>

        <div className="w-64 space-y-4">
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
                  {editingPoint === point.id ? (
                    <div className="flex-1 space-y-1">
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.1"
                          value={editValues.x}
                          onChange={(e) => setEditValues(prev => ({ ...prev, x: Number(e.target.value) }))}
                          className="h-6 text-xs"
                          placeholder="X"
                        />
                        <Input
                          type="number"
                          step="0.1"
                          value={editValues.y}
                          onChange={(e) => setEditValues(prev => ({ ...prev, y: Number(e.target.value) }))}
                          className="h-6 text-xs"
                          placeholder="Y"
                        />
                        <Input
                          type="number"
                          step="0.1"
                          value={editValues.z}
                          onChange={(e) => setEditValues(prev => ({ ...prev, z: Number(e.target.value) }))}
                          className="h-6 text-xs"
                          placeholder="Z"
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={saveEdit} className="h-6 text-xs px-2">Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="h-6 text-xs px-2">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1">
                        P{index + 1}: X{point.x} Y{point.y} Z{point.z}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(point)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePoint(point.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
