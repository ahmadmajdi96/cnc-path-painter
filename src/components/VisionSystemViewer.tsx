
import React, { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EndpointManager } from './EndpointManager';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Download, RotateCw, ZoomIn, ZoomOut, Move, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisionSystemViewerProps {
  selectedMachineId?: string;
  selectedEndpoint?: string;
  currentImage?: string | null;
  processedImage?: string | null;
  onEndpointSelect?: (endpoint: string) => void;
  onImageReceived?: (image: string) => void;
  onImageProcessed?: (image: string) => void;
  imageFilters?: any;
}

export const VisionSystemViewer = ({ 
  selectedMachineId,
  selectedEndpoint,
  currentImage,
  processedImage,
  onEndpointSelect,
  onImageReceived,
  onImageProcessed,
  imageFilters
}: VisionSystemViewerProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'original' | 'processed' | 'split'>('original');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onImageReceived?.(imageData);
        toast({
          title: "Image loaded",
          description: "Image ready for processing"
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageReceived, toast]);

  const captureFromEndpoint = useCallback(async () => {
    if (!selectedEndpoint) {
      toast({
        title: "No endpoint selected",
        description: "Please select an endpoint to capture image",
        variant: "destructive"
      });
      return;
    }

    setIsCapturing(true);
    try {
      // Simulate API call to capture image from endpoint
      const response = await fetch(selectedEndpoint + '/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
          onImageReceived?.(e.target?.result as string);
        };
        reader.readAsDataURL(blob);
        
        toast({
          title: "Image captured",
          description: "Successfully captured image from endpoint"
        });
      }
    } catch (error) {
      console.error('Capture failed:', error);
      // For demo purposes, use a placeholder
      onImageReceived?.('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgdmlld0JveD0iMCAwIDY0MCA0ODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iNDgwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjMyMCIgeT0iMjQwIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNjM2MzYzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW5kdXN0cmlhbCBJbWFnZTwvdGV4dD4KPHN2Zz4K');
      toast({
        title: "Demo mode",
        description: "Using placeholder image for demonstration"
      });
    } finally {
      setIsCapturing(false);
    }
  }, [selectedEndpoint, onImageReceived, toast]);

  const downloadImage = useCallback(() => {
    const imageToDownload = processedImage || currentImage;
    if (!imageToDownload) return;

    const link = document.createElement('a');
    link.href = imageToDownload;
    link.download = `vision_${Date.now()}.png`;
    link.click();
  }, [currentImage, processedImage]);

  if (!selectedMachineId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Select a vision system to begin image processing</p>
        </div>
        <EndpointManager 
          selectedMachineId={selectedMachineId}
          onEndpointSelect={onEndpointSelect || (() => {})}
          selectedEndpoint={selectedEndpoint || ''}
          machineType="laser"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image Viewer */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900">Image Viewer</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'original' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('original')}
              >
                Original
              </Button>
              <Button
                variant={viewMode === 'processed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('processed')}
                disabled={!processedImage}
              >
                Processed
              </Button>
              <Button
                variant={viewMode === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('split')}
                disabled={!processedImage}
              >
                Split View
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(25, zoom - 25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
            <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(400, zoom + 25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRotation((rotation + 90) % 360)}>
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={downloadImage} disabled={!currentImage}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative bg-gray-50 rounded-lg min-h-96 flex items-center justify-center overflow-hidden">
            {currentImage ? (
              <div className="flex w-full h-full">
                {viewMode === 'split' && processedImage ? (
                  <>
                    <div className="flex-1 flex items-center justify-center border-r-2 border-gray-300">
                      <img 
                        src={currentImage} 
                        alt="Original" 
                        className="max-w-full max-h-full object-contain"
                        style={{ 
                          transform: `scale(${zoom/100}) rotate(${rotation}deg)`,
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <img 
                        src={processedImage} 
                        alt="Processed" 
                        className="max-w-full max-h-full object-contain"
                        style={{ 
                          transform: `scale(${zoom/100}) rotate(${rotation}deg)`,
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <img 
                    src={viewMode === 'processed' ? processedImage || currentImage : currentImage} 
                    alt={viewMode === 'processed' ? 'Processed' : 'Original'} 
                    className="max-w-full max-h-full object-contain"
                    style={{ 
                      transform: `scale(${zoom/100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease'
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No image loaded</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button 
                    onClick={captureFromEndpoint} 
                    disabled={!selectedEndpoint || isCapturing}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isCapturing ? 'Capturing...' : 'Capture'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <EndpointManager 
        selectedMachineId={selectedMachineId}
        onEndpointSelect={onEndpointSelect || (() => {})}
        selectedEndpoint={selectedEndpoint || ''}
        machineType="laser"
      />
    </div>
  );
};
