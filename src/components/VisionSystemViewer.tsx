
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Download, RotateCw, ZoomIn, ZoomOut, Move, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisionSystem {
  id: string;
  name: string;
  endpoint: string;
  cameraType: string;
  resolution: string;
  status: 'online' | 'offline';
}

interface VisionSystemViewerProps {
  selectedSystemId?: string;
  selectedEndpoint?: string;
  currentImage?: string | null;
  processedImage?: string | null;
  onEndpointSelect?: (endpoint: string) => void;
  onImageReceived?: (image: string) => void;
  onImageProcessed?: (image: string) => void;
  imageFilters?: any;
  visionSystems: VisionSystem[];
}

export const VisionSystemViewer = ({ 
  selectedSystemId,
  selectedEndpoint,
  currentImage,
  processedImage,
  onEndpointSelect,
  onImageReceived,
  onImageProcessed,
  imageFilters,
  visionSystems
}: VisionSystemViewerProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'original' | 'processed' | 'split'>('original');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  const selectedSystem = visionSystems.find(s => s.id === selectedSystemId);

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
    if (!selectedEndpoint || !selectedSystem) {
      toast({
        title: "No system selected",
        description: "Please select a vision system to capture image",
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
          description: `Successfully captured image from ${selectedSystem.name}`
        });
      }
    } catch (error) {
      console.error('Capture failed:', error);
      // For demo purposes, use a placeholder
      onImageReceived?.('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgdmlld0JveD0iMCAwIDY0MCA0ODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iNDgwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjMyMCIgeT0iMjQwIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNjM2MzYzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW5kdXN0cmlhbCBJbWFnZTwvdGV4dD4KPHN2Zz4K');
      toast({
        title: "Demo mode",
        description: `Using placeholder image for ${selectedSystem.name}`
      });
    } finally {
      setIsCapturing(false);
    }
  }, [selectedEndpoint, selectedSystem, onImageReceived, toast]);

  const downloadImage = useCallback(() => {
    const imageToDownload = processedImage || currentImage;
    if (!imageToDownload) return;

    const link = document.createElement('a');
    link.href = imageToDownload;
    link.download = `vision_${selectedSystem?.name || 'system'}_${Date.now()}.png`;
    link.click();
  }, [currentImage, processedImage, selectedSystem]);

  if (!selectedSystemId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Image Viewer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Select a vision system to begin</p>
              <p className="text-sm text-gray-400">Choose a vision system from the left panel</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <span>Image Viewer - {selectedSystem?.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
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
            
            <div className="flex items-center gap-2 ml-4">
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
        </CardTitle>
      </CardHeader>
      <CardContent>
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};
