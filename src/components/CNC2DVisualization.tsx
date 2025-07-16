
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Square, Wrench } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface CNCParams {
  spindleSpeed: number;
  feedRate: number;
  plungeRate: number;
  safeHeight: number;
  material: string;
  toolDiameter: number;
}

interface CNC2DVisualizationProps {
  points: Point3D[];
  isSimulating: boolean;
  currentPoint: number;
  onSimulationToggle: () => void;
  onReset: () => void;
  onAddPoint: (point: Point3D) => void;
  onClearPoints: () => void;
  cncParams?: CNCParams;
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
  cncParams = {
    spindleSpeed: 12000,
    feedRate: 1000,
    plungeRate: 500,
    safeHeight: 5,
    material: 'aluminum',
    toolDiameter: 3
  },
  machineName = 'CNC Machine'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [materialVisible, setMaterialVisible] = useState(true);
  const [toolpathVisible, setToolpathVisible] = useState(true);

  // Constants for realistic CNC visualization
  const GRID_SIZE = 5; // 5mm grid
  const MATERIAL_WIDTH = 300; // 300mm workpiece
  const MATERIAL_HEIGHT = 200; // 200mm workpiece
  const SCALE_FACTOR = 2; // pixels per mm
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSpacing = GRID_SIZE * SCALE_FACTOR * zoom;
    
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    const offsetX = (panOffset.x % gridSpacing);
    const offsetY = (panOffset.y % gridSpacing);

    // Fine grid lines
    for (let x = offsetX; x <= width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = offsetY; y <= height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Major grid lines every 25mm
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1.5;
    const majorGridSpacing = 25 * SCALE_FACTOR * zoom;
    
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

  const drawMaterial = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    if (!materialVisible) return;

    const materialW = MATERIAL_WIDTH * SCALE_FACTOR * zoom;
    const materialH = MATERIAL_HEIGHT * SCALE_FACTOR * zoom;
    
    const x = centerX - materialW / 2 + panOffset.x;
    const y = centerY - materialH / 2 + panOffset.y;
    
    // Material color based on type
    switch (cncParams.material.toLowerCase()) {
      case 'aluminum':
      case 'aluminium':
        ctx.fillStyle = '#d1d5db';
        break;
      case 'steel':
        ctx.fillStyle = '#9ca3af';
        break;
      case 'wood':
        ctx.fillStyle = '#d2b48c';
        break;
      case 'plastic':
        ctx.fillStyle = '#f8fafc';
        break;
      default:
        ctx.fillStyle = '#e5e7eb';
    }
    
    ctx.fillRect(x, y, materialW, materialH);
    
    // Material border
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, materialW, materialH);

    // Material label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${cncParams.material}: ${MATERIAL_WIDTH}×${MATERIAL_HEIGHT}mm`, x + 5, y + 20);
  }, [zoom, panOffset, materialVisible, cncParams.material]);

  const drawToolpath = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    if (points.length === 0 || !toolpathVisible) return;

    const toolRadius = (cncParams.toolDiameter / 2) * SCALE_FACTOR * zoom;

    // Draw toolpath
    for (let i = 0; i < points.length - 1; i++) {
      const point1 = points[i];
      const point2 = points[i + 1];
      
      const x1 = centerX + point1.x * SCALE_FACTOR * zoom + panOffset.x;
      const y1 = centerY - point1.y * SCALE_FACTOR * zoom + panOffset.y;
      const x2 = centerX + point2.x * SCALE_FACTOR * zoom + panOffset.x;
      const y2 = centerY - point2.y * SCALE_FACTOR * zoom + panOffset.y;

      // Path color based on simulation progress
      if (isSimulating && i < currentPoint) {
        // Completed cut - show material removal
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = Math.max(3, toolRadius);
        
        // Show cut groove
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = toolRadius * 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
      } else if (isSimulating && i === currentPoint) {
        // Current cutting position
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = Math.max(2, toolRadius);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
      } else {
        // Planned path
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
    }

    // Draw tool positions
    points.forEach((point, index) => {
      const x = centerX + point.x * SCALE_FACTOR * zoom + panOffset.x;
      const y = centerY - point.y * SCALE_FACTOR * zoom + panOffset.y;

      if (isSimulating && index === currentPoint) {
        // Active tool
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, toolRadius + 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (isSimulating && index < currentPoint) {
        // Completed position - show cut mark
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.arc(x, y, toolRadius, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Planned position
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, toolRadius * 0.7), 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      // Point coordinates and Z-height
      ctx.fillStyle = '#000000';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${index + 1}`, x + toolRadius + 5, y - toolRadius);
      ctx.fillText(`(${point.x.toFixed(1)}, ${point.y.toFixed(1)}, Z${point.z.toFixed(1)})`, x + toolRadius + 5, y + toolRadius + 10);
    });
  }, [points, isSimulating, currentPoint, zoom, panOffset, toolpathVisible, cncParams.toolDiameter]);

  const drawMachineInfo = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${machineName} - Tool: Ø${cncParams.toolDiameter}mm`, 10, 25);
    ctx.font = '12px sans-serif';
    ctx.fillText(`Spindle: ${cncParams.spindleSpeed}RPM | Feed: ${cncParams.feedRate}mm/min`, 10, 45);
    ctx.fillText(`Plunge: ${cncParams.plungeRate}mm/min | Safe Height: ${cncParams.safeHeight}mm`, 10, 65);
    ctx.fillText(`Scale: ${zoom.toFixed(1)}x | Grid: ${GRID_SIZE}mm | Material: ${cncParams.material}`, 10, 85);
    
    if (points.length > 0) {
      ctx.fillText(`Points: ${points.length} | Progress: ${currentPoint}/${points.length}`, 10, 105);
    }

    // Machine status
    if (isSimulating && currentPoint < points.length) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(20, 125, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#374151';
      ctx.fillText('CUTTING ACTIVE', 35, 130);
    }
  }, [machineName, cncParams, zoom, points.length, currentPoint, isSimulating]);

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
    drawMaterial(ctx, centerX, centerY);
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
  }, [zoom, panOffset, points, isSimulating, currentPoint, cncParams, drawGrid, drawMaterial, drawToolpath, drawMachineInfo]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSimulating) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = (canvasX - centerX - panOffset.x) / (SCALE_FACTOR * zoom);
    const worldY = -(canvasY - centerY - panOffset.y) / (SCALE_FACTOR * zoom);
    
    // Only allow positive coordinates within material bounds
    if (worldX >= 0 && worldY >= 0 && worldX <= MATERIAL_WIDTH && worldY <= MATERIAL_HEIGHT) {
      onAddPoint({ 
        x: Math.round(worldX * 10) / 10, 
        y: Math.round(worldY * 10) / 10, 
        z: 0 
      });
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const newZoom = event.deltaY > 0 
      ? Math.max(MIN_ZOOM, zoom - zoomSpeed)
      : Math.min(MAX_ZOOM, zoom + zoomSpeed);
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
        <Button onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + 0.2))} size="sm" variant="outline">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - 0.2))} size="sm" variant="outline">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button onClick={onClearPoints} size="sm" variant="outline">
          <Square className="w-4 h-4 mr-2" />
          Clear
        </Button>
        <Button 
          onClick={() => setMaterialVisible(!materialVisible)} 
          size="sm" 
          variant="outline"
        >
          {materialVisible ? 'Hide' : 'Show'} Material
        </Button>
        <Button 
          onClick={() => setToolpathVisible(!toolpathVisible)} 
          size="sm" 
          variant="outline"
        >
          <Wrench className="w-4 h-4 mr-2" />
          {toolpathVisible ? 'Hide' : 'Show'} Toolpath
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width={900}
        height={700}
        className="border border-gray-300 cursor-crosshair bg-gray-50"
        onClick={handleCanvasClick}
        onWheel={handleWheel}
      />
      
      <div className="text-sm text-gray-600">
        Click within the material area to add CNC cutting points. The simulation shows realistic tool movement and material removal.
      </div>
    </div>
  );
};
