
import React, { useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Thermometer, Gauge } from 'lucide-react';

interface ConveyorBelt {
  id: string;
  name: string;
  type: 'flat' | 'modular' | 'cleated' | 'inclined' | 'curved' | 'roller';
  status: 'running' | 'idle' | 'error' | 'maintenance';
  speed: number;
  length: number;
  width: number;
  load: number;
  maxCapacity: number;
  direction: 'forward' | 'reverse' | 'stopped';
  motor: {
    power: number;
    voltage: number;
    current: number;
    temperature: number;
  };
  sensors: {
    photoelectric: boolean;
    proximity: boolean;
    loadCell: boolean;
    encoder: boolean;
  };
  location: string;
  manufacturer: string;
  model: string;
  installDate: string;
}

interface ConveyorBeltVisualizationProps {
  conveyorBelt: ConveyorBelt | null;
  onSpeedChange: (speed: number) => void;
  onDirectionChange: (direction: 'forward' | 'reverse' | 'stopped') => void;
}

export const ConveyorBeltVisualization = ({
  conveyorBelt,
  onSpeedChange,
  onDirectionChange
}: ConveyorBeltVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const beltOffsetRef = useRef<number>(0);

  const drawConveyorBelt = useCallback((ctx: CanvasRenderingContext2D, belt: ConveyorBelt) => {
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Scale factors based on belt dimensions
    const scale = Math.min(400 / belt.length, 200 / belt.width);
    const beltLength = belt.length * scale;
    const beltWidth = belt.width * scale;
    
    // Belt frame
    const frameX = centerX - beltLength / 2;
    const frameY = centerY - beltWidth / 2;
    
    // Draw belt frame
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 8;
    ctx.strokeRect(frameX - 10, frameY - 10, beltLength + 20, beltWidth + 20);
    
    // Draw belt surface based on type
    switch (belt.type) {
      case 'flat':
        drawFlatBelt(ctx, frameX, frameY, beltLength, beltWidth, belt);
        break;
      case 'modular':
        drawModularBelt(ctx, frameX, frameY, beltLength, beltWidth, belt);
        break;
      case 'cleated':
        drawCleatedBelt(ctx, frameX, frameY, beltLength, beltWidth, belt);
        break;
      case 'inclined':
        drawInclinedBelt(ctx, frameX, frameY, beltLength, beltWidth, belt);
        break;
      case 'curved':
        drawCurvedBelt(ctx, centerX, centerY, beltLength, beltWidth, belt);
        break;
      case 'roller':
        drawRollerConveyor(ctx, frameX, frameY, beltLength, beltWidth, belt);
        break;
    }
    
    // Draw load indicators
    if (belt.load > 0) {
      drawLoad(ctx, frameX, frameY, beltLength, beltWidth, belt);
    }
    
    // Draw sensors
    drawSensors(ctx, frameX, frameY, beltLength, beltWidth, belt);
    
    // Draw direction indicator
    if (belt.status === 'running' && belt.direction !== 'stopped') {
      drawDirectionIndicator(ctx, frameX, frameY, beltLength, beltWidth, belt.direction);
    }
    
    // Draw information panel
    drawInfoPanel(ctx, belt);
  }, []);

  const drawFlatBelt = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, width: number, belt: ConveyorBelt) => {
    // Belt surface
    ctx.fillStyle = belt.status === 'running' ? '#2a2a2a' : '#1a1a1a';
    ctx.fillRect(x, y, length, width);
    
    // Belt texture - moving pattern if running
    if (belt.status === 'running' && belt.direction !== 'stopped') {
      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 2;
      
      const patternSpacing = 20;
      const offset = beltOffsetRef.current % patternSpacing;
      
      for (let i = -patternSpacing; i < length + patternSpacing; i += patternSpacing) {
        const lineX = x + i + offset;
        ctx.beginPath();
        ctx.moveTo(lineX, y);
        ctx.lineTo(lineX, y + width);
        ctx.stroke();
      }
    }
    
    // Belt edges
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, length, width);
  };

  const drawModularBelt = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, width: number, belt: ConveyorBelt) => {
    // Belt surface
    ctx.fillStyle = belt.status === 'running' ? '#3a3a3a' : '#2a2a2a';
    ctx.fillRect(x, y, length, width);
    
    // Modular segments
    const segmentWidth = 15;
    const offset = belt.status === 'running' ? beltOffsetRef.current % segmentWidth : 0;
    
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < length; i += segmentWidth) {
      const segmentX = x + i + offset;
      if (segmentX > x - segmentWidth && segmentX < x + length + segmentWidth) {
        ctx.beginPath();
        ctx.moveTo(segmentX, y);
        ctx.lineTo(segmentX, y + width);
        ctx.stroke();
      }
    }
    
    // Belt edges
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, length, width);
  };

  const drawCleatedBelt = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, width: number, belt: ConveyorBelt) => {
    // Belt surface
    ctx.fillStyle = belt.status === 'running' ? '#2a2a2a' : '#1a1a1a';
    ctx.fillRect(x, y, length, width);
    
    // Cleats (raised sections)
    const cleatSpacing = 30;
    const cleatHeight = 8;
    const offset = belt.status === 'running' ? beltOffsetRef.current % cleatSpacing : 0;
    
    ctx.fillStyle = '#444444';
    
    for (let i = 0; i < length; i += cleatSpacing) {
      const cleatX = x + i + offset;
      if (cleatX > x - cleatSpacing && cleatX < x + length + cleatSpacing) {
        ctx.fillRect(cleatX - 2, y - cleatHeight/2, 4, width + cleatHeight);
      }
    }
    
    // Belt edges
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, length, width);
  };

  const drawInclinedBelt = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, width: number, belt: ConveyorBelt) => {
    // Inclined belt - draw at an angle
    const inclineAngle = 15 * Math.PI / 180; // 15 degree incline
    const inclineHeight = length * Math.sin(inclineAngle);
    
    ctx.save();
    ctx.translate(x + length/2, y + width/2);
    ctx.rotate(inclineAngle);
    ctx.translate(-length/2, -width/2);
    
    // Belt surface
    ctx.fillStyle = belt.status === 'running' ? '#2a2a2a' : '#1a1a1a';
    ctx.fillRect(0, 0, length, width);
    
    // Texture for grip
    if (belt.status === 'running' && belt.direction !== 'stopped') {
      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 1;
      
      const patternSpacing = 10;
      const offset = beltOffsetRef.current % patternSpacing;
      
      for (let i = 0; i < width; i += 5) {
        for (let j = -patternSpacing; j < length + patternSpacing; j += patternSpacing) {
          const dotX = j + offset;
          if (dotX > 0 && dotX < length) {
            ctx.beginPath();
            ctx.arc(dotX, i, 1, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
      }
    }
    
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, length, width);
    
    ctx.restore();
    
    // Draw support structure
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + width);
    ctx.lineTo(x + length, y + width - inclineHeight);
    ctx.stroke();
  };

  const drawCurvedBelt = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, length: number, width: number, belt: ConveyorBelt) => {
    // Curved belt - draw as an arc
    const radius = length / 3;
    const innerRadius = radius - width/2;
    const outerRadius = radius + width/2;
    
    // Belt surface
    ctx.fillStyle = belt.status === 'running' ? '#2a2a2a' : '#1a1a1a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI);
    ctx.arc(centerX, centerY, innerRadius, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    
    // Belt texture
    if (belt.status === 'running' && belt.direction !== 'stopped') {
      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 2;
      
      const numLines = 20;
      const angleOffset = (beltOffsetRef.current / 10) % (Math.PI / numLines);
      
      for (let i = 0; i < numLines; i++) {
        const angle = (Math.PI * i / numLines) + angleOffset;
        const x1 = centerX + innerRadius * Math.cos(angle);
        const y1 = centerY + innerRadius * Math.sin(angle);
        const x2 = centerX + outerRadius * Math.cos(angle);
        const y2 = centerY + outerRadius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    
    // Belt edges
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI);
    ctx.stroke();
  };

  const drawRollerConveyor = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, width: number, belt: ConveyorBelt) => {
    // Frame
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, length, width);
    
    // Rollers
    const rollerSpacing = 20;
    const rollerRadius = width / 4;
    const numRollers = Math.floor(length / rollerSpacing);
    
    for (let i = 0; i < numRollers; i++) {
      const rollerX = x + (i + 0.5) * rollerSpacing;
      const rollerY = y + width / 2;
      
      // Roller rotation based on belt speed
      const rotationOffset = belt.status === 'running' ? (beltOffsetRef.current * 0.1) % (2 * Math.PI) : 0;
      
      ctx.save();
      ctx.translate(rollerX, rollerY);
      ctx.rotate(rotationOffset);
      
      // Roller body
      ctx.fillStyle = '#666666';
      ctx.beginPath();
      ctx.arc(0, 0, rollerRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Roller lines
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 2;
      for (let j = 0; j < 8; j++) {
        const angle = (j * Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(rollerRadius * Math.cos(angle), rollerRadius * Math.sin(angle));
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // Frame edges
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, length, width);
  };

  const drawLoad = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, width: number, belt: ConveyorBelt) => {
    const loadPercentage = belt.load / belt.maxCapacity;
    const numBoxes = Math.floor(loadPercentage * 10);
    const boxSize = Math.min(width / 3, 20);
    
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < numBoxes; i++) {
      const boxX = x + (i * length / 10) + (length / 20);
      const boxY = y + (width - boxSize) / 2;
      
      if (belt.status === 'running' && belt.direction !== 'stopped') {
        // Move boxes with belt
        const offset = belt.direction === 'forward' ? beltOffsetRef.current * 0.5 : -beltOffsetRef.current * 0.5;
        const adjustedX = (boxX + offset) % (length + boxSize) - boxSize;
        if (adjustedX > x - boxSize && adjustedX < x + length) {
          ctx.fillRect(adjustedX, boxY, boxSize, boxSize);
          ctx.strokeRect(adjustedX, boxY, boxSize, boxSize);
        }
      } else {
        ctx.fillRect(boxX, boxY, boxSize, boxSize);
        ctx.strokeRect(boxX, boxY, boxSize, boxSize);
      }
    }
  };

  const drawSensors = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, width: number, belt: ConveyorBelt) => {
    const sensorSize = 8;
    
    // Photoelectric sensor
    if (belt.sensors.photoelectric) {
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(x - 15, y + width/2 - sensorSize/2, sensorSize, sensorSize);
      ctx.fillStyle = '#FF4444';
      ctx.fillRect(x + length + 7, y + width/2 - sensorSize/2, sensorSize, sensorSize);
    }
    
    // Proximity sensor
    if (belt.sensors.proximity) {
      ctx.fillStyle = '#4ECDC4';
      ctx.beginPath();
      ctx.arc(x + length/4, y - 10, sensorSize/2, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Load cell
    if (belt.sensors.loadCell) {
      ctx.fillStyle = '#45B7D1';
      ctx.fillRect(x + length/2 - sensorSize/2, y + width + 5, sensorSize, sensorSize);
    }
    
    // Encoder
    if (belt.sensors.encoder) {
      ctx.fillStyle = '#F9CA24';
      ctx.beginPath();
      ctx.arc(x + 3*length/4, y - 10, sensorSize/2, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const drawDirectionIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number, length: number, width: number, direction: string) => {
    const arrowY = y + width + 30;
    const arrowSize = 15;
    
    ctx.fillStyle = direction === 'forward' ? '#22C55E' : '#EF4444';
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 3;
    
    if (direction === 'forward') {
      // Forward arrows
      for (let i = 0; i < 3; i++) {
        const arrowX = x + length/2 - 30 + i * 20;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + arrowSize, arrowY);
        ctx.lineTo(arrowX + arrowSize - 5, arrowY - 5);
        ctx.moveTo(arrowX + arrowSize, arrowY);
        ctx.lineTo(arrowX + arrowSize - 5, arrowY + 5);
        ctx.stroke();
      }
    } else {
      // Reverse arrows
      for (let i = 0; i < 3; i++) {
        const arrowX = x + length/2 + 30 - i * 20;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowSize, arrowY);
        ctx.lineTo(arrowX - arrowSize + 5, arrowY - 5);
        ctx.moveTo(arrowX - arrowSize, arrowY);
        ctx.lineTo(arrowX - arrowSize + 5, arrowY + 5);
        ctx.stroke();
      }
    }
  };

  const drawInfoPanel = (ctx: CanvasRenderingContext2D, belt: ConveyorBelt) => {
    const panelX = 10;
    const panelY = 10;
    const panelWidth = 200;
    const panelHeight = 100;
    
    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText(belt.name, panelX + 10, panelY + 20);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Type: ${belt.type}`, panelX + 10, panelY + 40);
    ctx.fillText(`Speed: ${belt.speed} m/min`, panelX + 10, panelY + 55);
    ctx.fillText(`Load: ${belt.load}/${belt.maxCapacity} kg`, panelX + 10, panelY + 70);
    ctx.fillText(`Status: ${belt.status}`, panelX + 10, panelY + 85);
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !conveyorBelt) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update belt offset for animation
    if (conveyorBelt.status === 'running' && conveyorBelt.direction !== 'stopped') {
      const speed = conveyorBelt.speed * 0.2; // Scale for animation
      if (conveyorBelt.direction === 'forward') {
        beltOffsetRef.current += speed;
      } else {
        beltOffsetRef.current -= speed;
      }
    }
    
    // Draw conveyor belt
    drawConveyorBelt(ctx, conveyorBelt);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [conveyorBelt, drawConveyorBelt]);

  useEffect(() => {
    if (conveyorBelt) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [conveyorBelt, animate]);

  if (!conveyorBelt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Conveyor Belt Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select a conveyor belt to view visualization
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {conveyorBelt.name} - Live View
          </span>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(conveyorBelt.status)} text-white`}>
              {conveyorBelt.status}
            </Badge>
            <Badge variant="outline">
              {conveyorBelt.type}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full border border-border rounded-lg bg-gray-100"
          />
          
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="w-4 h-4 text-blue-500" />
              <span>Speed: {conveyorBelt.speed} m/min</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Power: {conveyorBelt.motor.power} kW</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="w-4 h-4 text-red-500" />
              <span>Temp: {conveyorBelt.motor.temperature}°C</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-green-500" />
              <span>Load: {conveyorBelt.load}/{conveyorBelt.maxCapacity} kg</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
