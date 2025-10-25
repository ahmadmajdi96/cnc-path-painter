import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

interface Annotation {
  id: string;
  classId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DatasetClass {
  id: string;
  name: string;
  color: string;
}

interface ImageAnnotationCanvasProps {
  image: { id: string; url: string; name: string };
  classes: DatasetClass[];
  annotations: Annotation[];
  onAnnotationsUpdate: (annotations: Annotation[]) => void;
}

type DragHandle = 'tl' | 'tr' | 'bl' | 'br' | 'move' | null;

export const ImageAnnotationCanvas: React.FC<ImageAnnotationCanvasProps> = ({
  image,
  classes,
  annotations,
  onAnnotationsUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '');
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageRef = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    imageRef.current.src = image.url;
    imageRef.current.onload = () => {
      setImageLoaded(true);
      drawCanvas();
    };
  }, [image.url]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [annotations, selectedAnnotation, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    const maxWidth = container.clientWidth;
    const maxHeight = 500;
    const imgRatio = imageRef.current.width / imageRef.current.height;
    
    let canvasWidth = maxWidth;
    let canvasHeight = canvasWidth / imgRatio;
    
    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = canvasHeight * imgRatio;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw annotations
    annotations.forEach((annotation) => {
      const cls = classes.find(c => c.id === annotation.classId);
      if (!cls) return;

      const isSelected = annotation.id === selectedAnnotation;
      
      ctx.strokeStyle = cls.color;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.fillStyle = cls.color + '30'; // 30 is hex for ~18% opacity
      
      ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);

      // Draw class label
      ctx.fillStyle = cls.color;
      ctx.fillRect(annotation.x, annotation.y - 20, ctx.measureText(cls.name).width + 10, 20);
      ctx.fillStyle = 'white';
      ctx.font = '12px sans-serif';
      ctx.fillText(cls.name, annotation.x + 5, annotation.y - 6);

      // Draw corner handles for selected annotation
      if (isSelected) {
        const handleSize = 8;
        ctx.fillStyle = cls.color;
        
        // Top-left
        ctx.fillRect(annotation.x - handleSize/2, annotation.y - handleSize/2, handleSize, handleSize);
        // Top-right
        ctx.fillRect(annotation.x + annotation.width - handleSize/2, annotation.y - handleSize/2, handleSize, handleSize);
        // Bottom-left
        ctx.fillRect(annotation.x - handleSize/2, annotation.y + annotation.height - handleSize/2, handleSize, handleSize);
        // Bottom-right
        ctx.fillRect(annotation.x + annotation.width - handleSize/2, annotation.y + annotation.height - handleSize/2, handleSize, handleSize);
      }
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getHandleAtPos = (x: number, y: number, annotation: Annotation): DragHandle => {
    const handleSize = 8;
    const tolerance = handleSize;

    // Check corners
    if (Math.abs(x - annotation.x) < tolerance && Math.abs(y - annotation.y) < tolerance) return 'tl';
    if (Math.abs(x - (annotation.x + annotation.width)) < tolerance && Math.abs(y - annotation.y) < tolerance) return 'tr';
    if (Math.abs(x - annotation.x) < tolerance && Math.abs(y - (annotation.y + annotation.height)) < tolerance) return 'bl';
    if (Math.abs(x - (annotation.x + annotation.width)) < tolerance && Math.abs(y - (annotation.y + annotation.height)) < tolerance) return 'br';

    // Check if inside box (for moving)
    if (x >= annotation.x && x <= annotation.x + annotation.width &&
        y >= annotation.y && y <= annotation.y + annotation.height) {
      return 'move';
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    // Check if clicking on existing annotation
    for (const annotation of [...annotations].reverse()) {
      const handle = getHandleAtPos(pos.x, pos.y, annotation);
      if (handle) {
        setSelectedAnnotation(annotation.id);
        setDragHandle(handle);
        setStartPos(pos);
        setIsDrawing(true);
        return;
      }
    }

    // Start new annotation
    if (!selectedClass) return;
    
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      classId: selectedClass,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    };

    setCurrentAnnotation(newAnnotation);
    setSelectedAnnotation(newAnnotation.id);
    setStartPos(pos);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (currentAnnotation) {
      // Drawing new annotation
      const width = pos.x - startPos.x;
      const height = pos.y - startPos.y;
      
      const updatedAnnotation = {
        ...currentAnnotation,
        width,
        height,
      };

      setCurrentAnnotation(updatedAnnotation);

      // Redraw with current annotation
      drawCanvas();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cls = classes.find(c => c.id === selectedClass);
      if (!cls) return;

      ctx.strokeStyle = cls.color;
      ctx.lineWidth = 2;
      ctx.fillStyle = cls.color + '30';
      ctx.fillRect(updatedAnnotation.x, updatedAnnotation.y, updatedAnnotation.width, updatedAnnotation.height);
      ctx.strokeRect(updatedAnnotation.x, updatedAnnotation.y, updatedAnnotation.width, updatedAnnotation.height);
    } else if (selectedAnnotation && dragHandle) {
      // Modifying existing annotation
      const annotation = annotations.find(a => a.id === selectedAnnotation);
      if (!annotation) return;

      let updatedAnnotation = { ...annotation };
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;

      if (dragHandle === 'move') {
        updatedAnnotation.x += dx;
        updatedAnnotation.y += dy;
      } else if (dragHandle === 'tl') {
        updatedAnnotation.x += dx;
        updatedAnnotation.y += dy;
        updatedAnnotation.width -= dx;
        updatedAnnotation.height -= dy;
      } else if (dragHandle === 'tr') {
        updatedAnnotation.y += dy;
        updatedAnnotation.width += dx;
        updatedAnnotation.height -= dy;
      } else if (dragHandle === 'bl') {
        updatedAnnotation.x += dx;
        updatedAnnotation.width -= dx;
        updatedAnnotation.height += dy;
      } else if (dragHandle === 'br') {
        updatedAnnotation.width += dx;
        updatedAnnotation.height += dy;
      }

      setStartPos(pos);
      onAnnotationsUpdate(annotations.map(a => a.id === selectedAnnotation ? updatedAnnotation : a));
    }
  };

  const handleMouseUp = () => {
    if (currentAnnotation && Math.abs(currentAnnotation.width) > 10 && Math.abs(currentAnnotation.height) > 10) {
      // Normalize negative dimensions
      const normalized = {
        ...currentAnnotation,
        x: currentAnnotation.width < 0 ? currentAnnotation.x + currentAnnotation.width : currentAnnotation.x,
        y: currentAnnotation.height < 0 ? currentAnnotation.y + currentAnnotation.height : currentAnnotation.y,
        width: Math.abs(currentAnnotation.width),
        height: Math.abs(currentAnnotation.height),
      };
      
      onAnnotationsUpdate([...annotations, normalized]);
    }

    setIsDrawing(false);
    setCurrentAnnotation(null);
    setDragHandle(null);
  };

  const handleDeleteAnnotation = () => {
    if (!selectedAnnotation) return;
    onAnnotationsUpdate(annotations.filter(a => a.id !== selectedAnnotation));
    setSelectedAnnotation(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label>Selected Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: cls.color }}
                    />
                    {cls.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedAnnotation && (
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDeleteAnnotation}
            className="mt-6"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div ref={containerRef} className="border rounded-lg overflow-hidden bg-muted">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair w-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• Click and drag to create bounding boxes</p>
        <p>• Click on boxes to select them</p>
        <p>• Drag corners to resize, drag inside to move</p>
      </div>
    </div>
  );
};
