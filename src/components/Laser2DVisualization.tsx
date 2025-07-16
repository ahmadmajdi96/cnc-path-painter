
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Square, Zap } from 'lucide-react';

interface Point2D {
  x: number;
  y: number;
}

interface LaserParams {
  laserPower: number;
  pulseFrequency: number;
  markingSpeed: number;
  pulseDuration: number;
  beamDiameter: number;
  material: string;
}

interface Laser2DVisualizationProps {
  points: Point2D[];
  isSimulating: boolean;
  currentPoint: number;
  onSimulationToggle: () => void;
  onReset: () => void;
  onAddPoint: (point: Point2D) => void;
  onClearPoints: () => void;
  laserParams: LaserParams;
  machineName?: string;
}

export const Laser2DVisualization: React.FC<Laser2DVisualizationProps> = ({
  points,
  isSimulating,
  currentPoint,
  onSimulationToggle,
  onReset,
  onAddPoint,
  onClearPoints,
  laserParams,
  machineName = 'Laser Machine'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [materialVisible, setMaterialVisible] = useState(true);
  const [heatEffectVisible, setHeatEffectVisible] = useState(true);

  // Constants for realistic laser visualization - FIXED POSITIONING
  const GRID_SIZE = 5; // 5mm grid for precision
  const MATERIAL_WIDTH = 300; // 300mm material
  const MATERIAL_HEIGHT = 200; // 200mm material
  const SCALE_FACTOR = 2; // pixels per mm
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  
  // Fixed material position - centered in canvas
  const MATERIAL_OFFSET_X = 50; // Fixed offset from left
  const MATERIAL_OFFSET_Y = 50; // Fixed offset from top

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSpacing = GRID_SIZE * SCALE_FACTOR * zoom;
    
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Draw grid starting from material origin
    const startX = MATERIAL_OFFSET_X;
    const startY = MATERIAL_OFFSET_Y;
    const endX = MATERIAL_OFFSET_X + (MATERIAL_WIDTH * SCALE_FACTOR * zoom);
    const endY = MATERIAL_OFFSET_Y + (MATERIAL_HEIGHT * SCALE_FACTOR * zoom);

    // Vertical grid lines
    for (let x = startX; x <= endX; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = startY; y <= endY; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Major grid lines every 25mm
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1.5;
    const majorGridSpacing = 25 * SCALE_FACTOR * zoom;
    
    for (let x = startX; x <= endX; x += majorGridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    for (let y = startY; y <= endY; y += majorGridSpacing) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  }, [zoom]);

  const drawMaterial = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!materialVisible) return;

    const materialW = MATERIAL_WIDTH * SCALE_FACTOR * zoom;
    const materialH = MATERIAL_HEIGHT * SCALE_FACTOR * zoom;
    
    const x = MATERIAL_OFFSET_X;
    const y = MATERIAL_OFFSET_Y;
    
    // Material surface based on type
    switch (laserParams.material.toLowerCase()) {
      case 'steel':
      case 'stainless steel':
        ctx.fillStyle = '#9ca3af';
        break;
      case 'aluminum':
      case 'aluminium':
        ctx.fillStyle = '#d1d5db';
        break;
      case 'wood':
        ctx.fillStyle = '#d2b48c';
        break;
      case 'acrylic':
      case 'plastic':
        ctx.fillStyle = '#f8fafc';
        break;
      default:
        ctx.fillStyle = '#f3f4f6';
    }
    
    ctx.fillRect(x, y, materialW, materialH);
    
    // Material border
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, materialW, materialH);

    // Material texture for realism
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 20; i++) {
      const rx = x + Math.random() * materialW;
      const ry = y + Math.random() * materialH;
      ctx.fillRect(rx, ry, 2, 2);
    }
    ctx.restore();

    // Material label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${laserParams.material}: ${MATERIAL_WIDTH}×${MATERIAL_HEIGHT}mm`, x + 5, y + 20);
  }, [zoom, materialVisible, laserParams.material]);

  const drawLaserPath = useCallback((ctx: CanvasRenderingContext2D) => {
    if (points.length === 0) return;

    const beamRadius = (laserParams.beamDiameter / 2) * SCALE_FACTOR * zoom;

    // Draw laser path
    for (let i = 0; i < points.length - 1; i++) {
      const point1 = points[i];
      const point2 = points[i + 1];
      
      // Convert coordinates to canvas position - FIXED POSITIONING
      const x1 = MATERIAL_OFFSET_X + point1.x * SCALE_FACTOR * zoom;
      const y1 = MATERIAL_OFFSET_Y + point1.y * SCALE_FACTOR * zoom;
      const x2 = MATERIAL_OFFSET_X + point2.x * SCALE_FACTOR * zoom;
      const y2 = MATERIAL_OFFSET_Y + point2.y * SCALE_FACTOR * zoom;

      // Path color based on simulation progress and laser power
      if (isSimulating && i < currentPoint) {
        // Completed laser marking - shows burn/etch effect
        const intensity = laserParams.laserPower / 100;
        ctx.strokeStyle = `rgba(255, ${Math.floor(100 * (1 - intensity))}, 0, ${0.8 + intensity * 0.2})`;
        ctx.lineWidth = Math.max(2, beamRadius * 1.5);
        
        // Add heat-affected zone if enabled
        if (heatEffectVisible) {
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = beamRadius * 3;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.restore();
        }
      } else if (isSimulating && i === currentPoint) {
        // Current laser beam - bright and animated
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = Math.max(3, beamRadius);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
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

      // Draw laser burn marks for completed segments
      if (isSimulating && i < currentPoint) {
        const numBurns = Math.floor(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 5);
        for (let b = 0; b < numBurns; b++) {
          const t = b / numBurns;
          const bx = x1 + (x2 - x1) * t;
          const by = y1 + (y2 - y1) * t;
          
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          ctx.arc(bx + (Math.random() - 0.5), by + (Math.random() - 0.5), beamRadius * 0.3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    // Draw laser focus points
    points.forEach((point, index) => {
      const x = MATERIAL_OFFSET_X + point.x * SCALE_FACTOR * zoom;
      const y = MATERIAL_OFFSET_Y + point.y * SCALE_FACTOR * zoom;

      if (isSimulating && index === currentPoint) {
        // Active laser beam
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, beamRadius + 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Laser center dot
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        // Laser beam effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, beamRadius * 2);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, beamRadius * 2, 0, 2 * Math.PI);
        ctx.fill();
      } else if (isSimulating && index < currentPoint) {
        // Completed laser mark
        ctx.fillStyle = '#7c2d12';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, beamRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        // Planned point
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, beamRadius * 0.5), 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      // Point coordinates
      ctx.fillStyle = '#000000';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${index + 1}`, x + beamRadius + 5, y - beamRadius);
      ctx.fillText(`(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`, x + beamRadius + 5, y + beamRadius + 10);
    });
  }, [points, isSimulating, currentPoint, zoom, laserParams, heatEffectVisible]);

  const drawLaserInfo = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${machineName} - Beam: Ø${laserParams.beamDiameter}mm`, 10, 25);
    ctx.font = '12px sans-serif';
    ctx.fillText(`Power: ${laserParams.laserPower}% | Speed: ${laserParams.markingSpeed}mm/min`, 10, 45);
    ctx.fillText(`Frequency: ${laserParams.pulseFrequency}Hz | Material: ${laserParams.material}`, 10, 65);
    ctx.fillText(`Scale: ${zoom.toFixed(1)}x | Grid: ${GRID_SIZE}mm`, 10, 85);
    
    if (points.length > 0) {
      ctx.fillText(`Points: ${points.length} | Progress: ${currentPoint}/${points.length}`, 10, 105);
    }

    // Laser status indicator
    if (isSimulating && currentPoint < points.length) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(20, 125, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#374151';
      ctx.fillText('LASER ACTIVE', 35, 130);
    }

    // Coordinate system origin
    ctx.fillStyle = '#374151';
    ctx.font = '10px sans-serif';
    ctx.fillText('(0,0)', MATERIAL_OFFSET_X - 15, MATERIAL_OFFSET_Y + 15);
  }, [machineName, laserParams, zoom, points.length, currentPoint, isSimulating]);

  const drawCoordinateSystem = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // X-axis (from origin)
    ctx.beginPath();
    ctx.moveTo(MATERIAL_OFFSET_X, MATERIAL_OFFSET_Y);
    ctx.lineTo(MATERIAL_OFFSET_X + 50 * zoom, MATERIAL_OFFSET_Y);
    ctx.stroke();
    
    // Y-axis (from origin)
    ctx.beginPath();
    ctx.moveTo(MATERIAL_OFFSET_X, MATERIAL_OFFSET_Y);
    ctx.lineTo(MATERIAL_OFFSET_X, MATERIAL_OFFSET_Y + 50 * zoom);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText('X+', MATERIAL_OFFSET_X + 55 * zoom, MATERIAL_OFFSET_Y + 5);
    ctx.fillText('Y+', MATERIAL_OFFSET_X + 5, MATERIAL_OFFSET_Y + 55 * zoom);
  }, [zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw components in order
    drawGrid(ctx, canvas.width, canvas.height);
    drawMaterial(ctx);
    drawLaserPath(ctx);
    drawCoordinateSystem(ctx);
    drawLaserInfo(ctx);
  }, [zoom, points, isSimulating, currentPoint, laserParams, drawGrid, drawMaterial, drawLaserPath, drawCoordinateSystem, drawLaserInfo]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSimulating) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    // Convert to material coordinates - ONLY POSITIVE VALUES WITHIN MATERIAL
    const materialX = (canvasX - MATERIAL_OFFSET_X) / (SCALE_FACTOR * zoom);
    const materialY = (canvasY - MATERIAL_OFFSET_Y) / (SCALE_FACTOR * zoom);
    
    // Only allow clicks within material bounds (positive coordinates only)
    if (materialX >= 0 && materialY >= 0 && materialX <= MATERIAL_WIDTH && materialY <= MATERIAL_HEIGHT) {
      onAddPoint({ 
        x: Math.round(materialX * 10) / 10, 
        y: Math.round(materialY * 10) / 10 
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
          onClick={() => setHeatEffectVisible(!heatEffectVisible)} 
          size="sm" 
          variant="outline"
          title="Heat Effect: Shows the heat-affected zone (HAZ) around laser marks - the area where material properties are altered by thermal exposure during laser processing"
        >
          <Zap className="w-4 h-4 mr-2" />
          {heatEffectVisible ? 'Hide' : 'Show'} Heat Effect
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
        Click within the material area (positive coordinates only) to add laser marking points. Heat Effect shows the thermal impact zone around laser marks.
      </div>
    </div>
  );
};
