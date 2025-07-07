import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Square, RotateCcw, Download, Upload } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  id: number;
  isFromGCode?: boolean;
}

interface GCodeCommand {
  command: string;
  x?: number;
  y?: number;
  z?: number;
  f?: number;
}

interface CuttingParams {
  feedRate: number;
  spindleSpeed: number;
  plungeDepth: number;
}

export const CNCVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(-1);
  const [nextPointId, setNextPointId] = useState(1);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [gCodeCommands, setGCodeCommands] = useState<GCodeCommand[]>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [distanceFromLastPoint, setDistanceFromLastPoint] = useState<number>(0);
  const [cuttingParams, setCuttingParams] = useState<CuttingParams>({
    feedRate: 1000,
    spindleSpeed: 8000,
    plungeDepth: 2
  });

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const GRID_SIZE = 20;

  useEffect(() => {
    drawCanvas();
  }, [points, currentPointIndex, mousePosition, distanceFromLastPoint]);

  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculateTotalPathLength = () => {
    if (points.length < 2) return 0;
    
    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
      totalLength += calculateDistance(points[i - 1], points[i]);
    }
    return totalLength;
  };

  const calculateEstimatedTime = () => {
    const pathLengthPixels = calculateTotalPathLength();
    // Convert pixels to mm (assuming 1 pixel = 0.1mm for estimation)
    const pathLengthMm = pathLengthPixels * 0.1;
    
    if (pathLengthMm === 0) return "0:00";
    
    // Calculate cutting time based on feed rate
    const cuttingTimeMinutes = pathLengthMm / cuttingParams.feedRate;
    
    // Add overhead time for plunge/retract operations
    const numberOfMoves = points.length;
    const plungeRetractTime = numberOfMoves * 0.1; // 0.1 minutes per plunge/retract
    
    const totalTimeMinutes = cuttingTimeMinutes + plungeRetractTime;
    const minutes = Math.floor(totalTimeMinutes);
    const seconds = Math.floor((totalTimeMinutes - minutes) * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Snap to grid
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    setMousePosition({ x: snappedX, y: snappedY });

    // Calculate distance from last point
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      const distance = calculateDistance(lastPoint, { x: snappedX, y: snappedY });
      setDistanceFromLastPoint(distance);
    }
  };

  const handleMouseLeave = () => {
    setMousePosition(null);
    setDistanceFromLastPoint(0);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 40);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 40);
    ctx.stroke();
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, CANVAS_HEIGHT);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.fillText('X', CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20);
    ctx.fillText('Y', 20, 20);

    // Draw path lines
    if (points.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }

    // Draw preview line from last point to mouse cursor
    if (mousePosition && points.length > 0 && !isPlaying) {
      const lastPoint = points[points.length - 1];
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(mousePosition.x, mousePosition.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw preview point
      ctx.beginPath();
      ctx.arc(mousePosition.x, mousePosition.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw distance text
      if (distanceFromLastPoint > 0) {
        const midX = (lastPoint.x + mousePosition.x) / 2;
        const midY = (lastPoint.y + mousePosition.y) / 2;
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        const distanceMm = (distanceFromLastPoint * 0.1).toFixed(1);
        ctx.fillText(`${distanceMm}mm`, midX, midY - 10);
      }
    }

    // Draw points
    points.forEach((point, index) => {
      const isActive = index === currentPointIndex;
      const isCompleted = index < currentPointIndex;
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      
      if (isActive) {
        ctx.fillStyle = '#f59e0b'; // Current point - amber
      } else if (isCompleted) {
        ctx.fillStyle = '#10b981'; // Completed points - green
      } else if (point.isFromGCode) {
        ctx.fillStyle = '#8b5cf6'; // G-code points - purple
      } else {
        ctx.fillStyle = '#fbbf24'; // Default points - yellow
      }
      
      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw point number
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.id.toString(), point.x, point.y + 4);
    });
  };

  const parseGCode = (gCodeContent: string): Point[] => {
    const lines = gCodeContent.split('\n');
    const parsedPoints: Point[] = [];
    let currentX = 0;
    let currentY = 0;
    let pointId = 1;
    const commands: GCodeCommand[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim().toUpperCase();
      if (trimmedLine.startsWith(';') || trimmedLine === '') return; // Skip comments and empty lines

      const command: GCodeCommand = { command: trimmedLine };
      
      // Parse G0 and G1 commands (rapid move and linear interpolation)
      if (trimmedLine.includes('G0') || trimmedLine.includes('G1')) {
        const xMatch = trimmedLine.match(/X([-+]?\d*\.?\d+)/);
        const yMatch = trimmedLine.match(/Y([-+]?\d*\.?\d+)/);
        const zMatch = trimmedLine.match(/Z([-+]?\d*\.?\d+)/);
        const fMatch = trimmedLine.match(/F(\d+)/);

        if (xMatch) {
          command.x = parseFloat(xMatch[1]);
          currentX = command.x;
        }
        if (yMatch) {
          command.y = parseFloat(yMatch[1]);
          currentY = command.y;
        }
        if (zMatch) {
          command.z = parseFloat(zMatch[1]);
        }
        if (fMatch) {
          command.f = parseInt(fMatch[1]);
        }

        // Convert real-world coordinates to canvas coordinates
        // Assuming the G-code coordinates are in mm and we scale them appropriately
        const canvasX = (currentX * 2) + 100; // Scale and offset
        const canvasY = CANVAS_HEIGHT - ((currentY * 2) + 100); // Invert Y and scale

        // Only add points that are within canvas bounds and for cutting moves (G1)
        if (canvasX >= 0 && canvasX <= CANVAS_WIDTH && canvasY >= 0 && canvasY <= CANVAS_HEIGHT) {
          if (trimmedLine.includes('G1') && (!command.z || command.z <= 0)) { // Only cutting moves
            parsedPoints.push({
              x: canvasX,
              y: canvasY,
              id: pointId++,
              isFromGCode: true
            });
          }
        }
      }

      commands.push(command);
    });

    setGCodeCommands(commands);
    return parsedPoints;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const gCodePoints = parseGCode(content);
      setPoints(gCodePoints);
      setNextPointId(gCodePoints.length + 1);
      setCurrentPointIndex(-1);
    };
    
    reader.readAsText(file);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Snap to grid
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    const newPoint: Point = {
      x: snappedX,
      y: snappedY,
      id: nextPointId,
      isFromGCode: false
    };

    setPoints(prev => [...prev, newPoint]);
    setNextPointId(prev => prev + 1);
  };

  const playSequence = async () => {
    if (points.length === 0) return;

    setIsPlaying(true);
    setCurrentPointIndex(0);

    for (let i = 0; i < points.length; i++) {
      setCurrentPointIndex(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setTimeout(() => {
      setCurrentPointIndex(-1);
      setIsPlaying(false);
    }, 500);
  };

  const stopSequence = () => {
    setIsPlaying(false);
    setCurrentPointIndex(-1);
  };

  const clearPoints = () => {
    if (isPlaying) return;
    setPoints([]);
    setCurrentPointIndex(-1);
    setNextPointId(1);
    setUploadedFileName('');
    setGCodeCommands([]);
  };

  const exportGCode = () => {
    if (points.length === 0) return;

    let gcode = '; CNC G-Code Generated by CNC Control System\n';
    gcode += 'G21 ; Set units to millimeters\n';
    gcode += 'G90 ; Absolute positioning\n';
    gcode += 'G94 ; Feed rate per minute\n';
    gcode += `F${cuttingParams.feedRate} ; Set feed rate to ${cuttingParams.feedRate}mm/min\n`;
    gcode += `M3 S${cuttingParams.spindleSpeed} ; Start spindle at ${cuttingParams.spindleSpeed} RPM\n\n`;

    // Convert canvas coordinates to real-world coordinates (assuming 1 pixel = 0.1mm)
    const manualPoints = points.filter(p => !p.isFromGCode);
    manualPoints.forEach((point, index) => {
      const realX = ((point.x - 40) * 0.1).toFixed(2);
      const realY = (((CANVAS_HEIGHT - 40) - point.y) * 0.1).toFixed(2);
      
      if (index === 0) {
        gcode += `G0 X${realX} Y${realY} ; Rapid move to start position\n`;
        gcode += `G1 Z-${cuttingParams.plungeDepth} ; Plunge to cutting depth\n`;
      } else {
        gcode += `G1 X${realX} Y${realY} ; Cut to point ${point.id}\n`;
      }
    });

    gcode += '\nG1 Z5 ; Retract\n';
    gcode += 'M5 ; Stop spindle\n';
    gcode += 'G0 X0 Y0 ; Return to origin\n';
    gcode += 'M30 ; Program end\n';

    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cnc_program.gcode';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">CNC 2D Visualization</h3>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".gcode,.nc,.cnc"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={playSequence} 
            disabled={isPlaying || points.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Play Sequence
          </Button>
          <Button 
            onClick={stopSequence} 
            disabled={!isPlaying}
            variant="outline"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
          <Button 
            onClick={clearPoints} 
            disabled={isPlaying}
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button 
            onClick={exportGCode} 
            disabled={points.length === 0}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export G-Code
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload G-Code
          </Button>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair bg-white"
          style={{ display: 'block' }}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instructions:</strong> Upload a G-code file or click on the canvas to add waypoints. Move cursor to see distance from last point.</p>
        <p><strong>Status:</strong> {points.length} points defined | {isPlaying ? 'Playing sequence...' : 'Ready'} {uploadedFileName && `| Loaded: ${uploadedFileName}`}</p>
        <p><strong>Estimated Runtime:</strong> {calculateEstimatedTime()}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Manual points</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>G-code points</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>Current</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
