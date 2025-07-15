
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
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [materialVisible, setMaterialVisible] = useState(true);
  const [heatEffectVisible, setHeatEffectVisible] = useState(true);

  // Constants for realistic laser visualization
  const GRID_SIZE = 5; // 5mm grid for precision
  const MATERIAL_WIDTH = 300; // 300mm material
  const MATERIAL_HEIGHT = 200; // 200mm material
  const SCALE_FACTOR = 2; // pixels per mm

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSpacing = GRID_SIZE * SCALE_FACTOR * zoom;
    
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    const offsetX = (panOffset.x % gridSpacing);
    const offsetY = (panOffset.y % gridSpacing);

    // Fine grid
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

    // Material texture
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
  }, [zoom, panOffset, materialVisible, laserParams.material]);

  const drawLaserPath = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    if (points.length === 0) return;

    const beamRadius = (laserParams.beamDiameter / 2) * SCALE_FACTOR * zoom;

    // Draw laser path
    for (let i = 0; i < points.length - 1; i++) {
      const point1 = points[i];
      const point2 = points[i + 1];
      
      const x1 = centerX + point1.x * SCALE_FACTOR * zoom + panOffset.x;
      const y1 = centerY - point1.y * SCALE_FACTOR * zoom + panOffset.y;
      const x2 = centerX + point2.x * SCALE_FACTOR * zoom + panOffset.x;
      const y2 = centerY - point2.y * SCALE_FACTOR * zoom + panOffset.y;

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
      const x = centerX + point.x * SCALE_FACTOR * zoom + panOffset.x;
      const y = centerY - point.y * SCALE_FACTOR * zoom + panOffset.y;

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
  }, [points, isSimulating, currentPoint, zoom, panOffset, laserParams, heatEffectVisible]);

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
  }, [machineName, laserParams, zoom, points.length, currentPoint, isSimulating]);

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
    drawLaserPath(ctx, centerX, centerY);
    drawLaserInfo(ctx);

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
  }, [zoom, panOffset, points, isSimulating, currentPoint, laserParams, drawGrid, drawMaterial, drawLaserPath, drawLaserInfo]);

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
    
    onAddPoint({ x: Math.round(worldX * 10) / 10, y: Math.round(worldY * 10) / 10 });
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
        onMouseMove={(e) => {
          const rect = canvasRef.current!.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      />
      
      <div className="text-sm text-gray-600">
        Click on the canvas to add laser marking points. The simulation shows realistic laser marking with heat effects and material interaction.
      </div>
    </div>
  );
};
