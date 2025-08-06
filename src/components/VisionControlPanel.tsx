
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { 
  Contrast, 
  Sun, 
  Focus, 
  Filter,
  Eye,
  Settings,
  Save
} from 'lucide-react';
import { applyImageFilters, ImageFilters } from '@/utils/imageProcessing';

interface SavedImage {
  id: string;
  url: string;
  name: string;
  timestamp: Date;
  filters?: ImageFilters;
}

interface VisionControlPanelProps {
  selectedSystemId?: string;
  selectedEndpoint?: string;
  currentImage?: string | null;
  onFiltersChange?: (filters: ImageFilters) => void;
  onImageProcessed?: (image: string) => void;
  savedImages: SavedImage[];
  onSaveImage: (image: SavedImage) => void;
}

export const VisionControlPanel = ({
  selectedSystemId,
  selectedEndpoint,
  currentImage,
  onFiltersChange,
  onImageProcessed,
  savedImages,
  onSaveImage
}: VisionControlPanelProps) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 0,
    contrast: 0,
    blur: 0,
    threshold: 128,
    edgeDetection: false,
    noiseReduction: 0
  });

  const [imageName, setImageName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilterChange = useCallback((key: keyof ImageFilters, value: number | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [filters, onFiltersChange]);

  const applyFilters = useCallback(async () => {
    if (!currentImage) {
      toast({
        title: "No image",
        description: "Please load an image first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const processedImage = await applyImageFilters(currentImage, filters);
      onImageProcessed?.(processedImage);
      toast({
        title: "Filters applied",
        description: "Image has been processed successfully"
      });
    } catch (error) {
      console.error('Filter application failed:', error);
      toast({
        title: "Filter failed",
        description: "Failed to apply filters to image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentImage, filters, onImageProcessed, toast]);

  const saveCurrentImage = useCallback(() => {
    if (!currentImage) {
      toast({
        title: "No image",
        description: "Please load an image first",
        variant: "destructive"
      });
      return;
    }

    const name = imageName.trim() || `Image_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    const savedImage: SavedImage = {
      id: Date.now().toString(),
      url: currentImage,
      name,
      timestamp: new Date(),
      filters: { ...filters }
    };

    onSaveImage(savedImage);
    setImageName('');
    toast({
      title: "Image saved",
      description: `Image "${name}" has been saved to gallery`
    });
  }, [currentImage, imageName, filters, onSaveImage, toast]);

  if (!selectedSystemId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Vision Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Select a vision system to access controls
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Vision Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="inspection">Inspection</TabsTrigger>
              <TabsTrigger value="save">Save</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4" />
                    Brightness: {filters.brightness}
                  </Label>
                  <Slider
                    value={[filters.brightness]}
                    onValueChange={([value]) => handleFilterChange('brightness', value)}
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Contrast className="w-4 h-4" />
                    Contrast: {filters.contrast}
                  </Label>
                  <Slider
                    value={[filters.contrast]}
                    onValueChange={([value]) => handleFilterChange('contrast', value)}
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Focus className="w-4 h-4" />
                    Noise Reduction: {filters.noiseReduction}
                  </Label>
                  <Slider
                    value={[filters.noiseReduction]}
                    onValueChange={([value]) => handleFilterChange('noiseReduction', value)}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4" />
                    Edge Threshold: {filters.threshold}
                  </Label>
                  <Slider
                    value={[filters.threshold]}
                    onValueChange={([value]) => handleFilterChange('threshold', value)}
                    min={0}
                    max={255}
                    step={1}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edgeDetection"
                    checked={filters.edgeDetection}
                    onChange={(e) => handleFilterChange('edgeDetection', e.target.checked)}
                  />
                  <Label htmlFor="edgeDetection">Enable Edge Detection</Label>
                </div>

                <Button 
                  onClick={applyFilters} 
                  disabled={!currentImage || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Apply Filters'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="inspection" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Industrial Vision Features</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Edge detection & contour analysis</li>
                    <li>• Dimensional measurement</li>
                    <li>• Defect identification</li>
                    <li>• Surface roughness analysis</li>
                    <li>• Pattern matching & recognition</li>
                    <li>• Quality control automation</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="save" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageName">Image Name</Label>
                  <Input
                    id="imageName"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    placeholder="Enter image name (optional)"
                  />
                </div>

                <Button 
                  onClick={saveCurrentImage}
                  disabled={!currentImage}
                  className="w-full flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Current Image
                </Button>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    Saved Images: {savedImages.length}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
