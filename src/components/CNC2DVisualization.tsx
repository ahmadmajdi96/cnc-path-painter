
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Square } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface CNC2DVisualizationProps {
  points: Point3D[];
  isSimulating: boolean;
  currentPoint: number;
  onSimulationToggle: () => void;
  onReset: () => void;
  onAddPoint: (point: Point3D) => void;
  onClearPoints: () => void;
  machineName?: string;
}

export const CNC2DVisualization: React.FC<CNC2DVisualizationProps> = ({
  points,
  isSimulating,
  currentPoint,
  onSimulationToggle,
  onReset,
  onAddPoint,
  onClearPoints,
  machineName = 'CNC Machine'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [workpieceVisible, setWorkpieceVisible] = useState(true);

  // Constants for realistic CNC visualization
  const GRID_SIZE = 10; // 10mm grid
  const WORKPIECE_WIDTH = 200; // 200mm workpiece
  const WORKPIECE_HEIGHT = 150; // 150mm workpiece
  const TOOL_DIAMETER = 6; // 6mm end mill
  const SCALE_FACTOR = 2; // pixels per mm

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSpacing = GRID_SIZE * SCALE_FACTOR * zoom;
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Calculate grid offset based on pan
    const offsetX = (panOffset.x % gridSpacing);
    const offsetY = (panOffset.y % gridSpacing);

    // Draw vertical grid lines
    for (let x = offsetX; x <= width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = offsetY; y <= height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw major grid lines every 50mm
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;
    const majorGridSpacing = 50 * SCALE_FACTOR * zoom;
    
    for (let x = offsetX; x <= width; x += majorGridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = offsetY; y <= height; y += majorGridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [zoom, panOffset]);

  const drawWorkpiece = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    if (!workpieceVisible) return;

    const workpieceW = WORKPIECE_WIDTH * SCALE_FACTOR * zoom;
    const workpieceH = WORKPIECE_HEIGHT * SCALE_FACTOR * zoom;
    
    ctx.fillStyle = '#f3f4f6';
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    
    const x = centerX - workpieceW / 2 + panOffset.x;
    const y = centerY - workpieceH / 2 + panOffset.y;
    
    ctx.fillRect(x, y, workpieceW, workpieceH);
    ctx.strokeRect(x, y, workpieceW, workpieceH);

    // Add workpiece label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Workpiece: ${WORKPIECE_WIDTH}×${WORKPIECE_HEIGHT}mm`, x + 5, y + 20);
  }, [zoom, panOffset, workpieceVisible]);

  const drawToolpath = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    if (points.length === 0) return;

    const toolRadius = (TOOL_DIAMETER / 2) * SCALE_FACTOR * zoom;

    // Draw rapid moves (dashed lines)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Draw feed moves (solid lines)
    for (let i = 0; i < points.length - 1; i++) {
      const point1 = points[i];
      const point2 = points[i + 1];
      
      const x1 = centerX + point1.x * SCALE_FACTOR * zoom + panOffset.x;
      const y1 = centerY - point1.y * SCALE_FACTOR * zoom + panOffset.y;
      const x2 = centerX + point2.x * SCALE_FACTOR * zoom + panOffset.x;
      const y2 = centerY - point2.y * SCALE_FACTOR * zoom + panOffset.y;

      // Color based on simulation progress
      if (isSimulating && i < currentPoint) {
        ctx.strokeStyle = '#ef4444'; // Red for completed
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
      } else if (isSimulating && i === currentPoint) {
        ctx.strokeStyle = '#22c55e'; // Green for current
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#3b82f6'; // Blue for upcoming
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw tool path visualization (simulated cut)
      if (isSimulating && i <= currentPoint) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#fbbf24';
        
        // Draw cut line
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const perpAngle = angle + Math.PI / 2;
        
        const offset = toolRadius / 2;
        const px1 = x1 + Math.cos(perpAngle) * offset;
        const py1 = y1 + Math.sin(perpAngle) * offset;
        const px2 = x1 - Math.cos(perpAngle) * offset;
        const py2 = y1 - Math.sin(perpAngle) * offset;
        const px3 = x2 - Math.cos(perpAngle) * offset;
        const py3 = y2 - Math.sin(perpAngle) * offset;
        const px4 = x2 + Math.cos(perpAngle) * offset;
        const py4 = y2 + Math.sin(perpAngle) * offset;

        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.lineTo(px3, py3);
        ctx.lineTo(px4, py4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw tool positions
    points.forEach((point, index) => {
      const x = centerX + point.x * SCALE_FACTOR * zoom + panOffset.x;
      const y = centerY - point.y * SCALE_FACTOR * zoom + panOffset.y;

      // Tool circle
      if (isSimulating && index === currentPoint) {
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#16a34a';
      } else if (isSimulating && index < currentPoint) {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#dc2626';
      } else {
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#2563eb';
      }

      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(x, y, toolRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Point number and coordinates
      ctx.fillStyle = '#000000';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${index + 1}`, x + toolRadius + 5, y - toolRadius);
      ctx.fillText(`(${point.x.toFixed(1)}, ${point.y.toFixed(1)}, ${point.z.toFixed(1)})`, x + toolRadius + 5, y + toolRadius + 10);
    });

    // Current tool position during simulation
    if (isSimulating && currentPoint < points.length) {
      const currentPos = points[currentPoint];
      const x = centerX + currentPos.x * SCALE_FACTOR * zoom + panOffset.x;
      const y = centerY - currentPos.y * SCALE_FACTOR * zoom + panOffset.y;

      // Animated tool
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(x, y, toolRadius + 2, 0, 2 * Math.PI);
      ctx.stroke();

      // Tool center
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [points, isSimulating, currentPoint, zoom, panOffset]);

  const drawMachineInfo = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${machineName} - Tool: Ø${TOOL_DIAMETER}mm End Mill`, 10, 25);
    ctx.font = '12px sans-serif';
    ctx.fillText(`Scale: ${zoom.toFixed(1)}x | Grid: ${GRID_SIZE}mm`, 10, 45);
    
    if (points.length > 0) {
      ctx.fillText(`Points: ${points.length} | Progress: ${currentPoint}/${points.length}`, 10, 65);
    }
  }, [machineName, zoom, points.length, currentPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw components
    drawGrid(ctx, canvas.width, canvas.height);
    drawWorkpiece(ctx, centerX, centerY);
    drawToolpath(ctx, centerX, centerY);
    drawMachineInfo(ctx);

    // Draw coordinate system
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(centerX + panOffset.x, centerY + panOffset.y);
    ctx.lineTo(centerX + 50 * zoom + panOffset.x, centerY + panOffset.y);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX + panOffset.x, centerY + panOffset.y);
    ctx.lineTo(centerX + panOffset.x, centerY - 50 * zoom + panOffset.y);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText('X+', centerX + 55 * zoom + panOffset.x, centerY + 5 + panOffset.y);
    ctx.fillText('Y+', centerX + 5 + panOffset.x, centerY - 55 * zoom + panOffset.y);
  }, [zoom, panOffset, points, isSimulating, currentPoint, drawGrid, drawWorkpiece, drawToolpath, drawMachineInfo]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing || isSimulating) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = (canvasX - centerX - panOffset.x) / (SCALE_FACTOR * zoom);
    const worldY = -(canvasY - centerY - panOffset.y) / (SCALE_FACTOR * zoom);
    
    onAddPoint({ x: Math.round(worldX * 10) / 10, y: Math.round(worldY * 10) / 10, z: 0 });
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const newZoom = event.deltaY > 0 
      ? Math.max(0.1, zoom - zoomSpeed)
      : Math.min(5, zoom + zoomSpeed);
    setZoom(newZoom);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Button
          onClick={onSimulationToggle}
          disabled={points.length === 0}
          size="sm"
        >
          {isSimulating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isSimulating ? 'Pause' : 'Simulate'}
        </Button>
        <Button onClick={onReset} size="sm" variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button onClick={() => setZoom(Math.min(5, zoom + 0.2))} size="sm" variant="outline">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button onClick={() => setZoom(Math.max(0.1, zoom - 0.2))} size="sm" variant="outline">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button onClick={onClearPoints} size="sm" variant="outline">
          <Square className="w-4 h-4 mr-2" />
          Clear
        </Button>
        <Button 
          onClick={() => setWorkpieceVisible(!workpieceVisible)} 
          size="sm" 
          variant="outline"
        >
          {workpieceVisible ? 'Hide' : 'Show'} Workpiece
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 cursor-crosshair bg-white"
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseMove={(e) => {
          const rect = canvasRef.current!.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      />
      
      <div className="text-sm text-gray-600">
        Click on the canvas to add CNC toolpath points. The simulation shows realistic tool movement and cutting operations.
      </div>
    </div>
  );
};
