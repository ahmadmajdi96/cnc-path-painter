
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Contrast, 
  Brightness4, 
  Blur, 
  Filter,
  Crosshair,
  Zap,
  Search,
  Grid3X3,
  Eye,
  Settings
} from 'lucide-react';

interface VisionControlPanelProps {
  selectedMachineId?: string;
  selectedEndpoint?: string;
  currentImage?: string | null;
  onFiltersChange?: (filters: any) => void;
  onImageProcessed?: (image: string) => void;
}

export const VisionControlPanel = ({
  selectedMachineId,
  selectedEndpoint,
  currentImage,
  onFiltersChange,
  onImageProcessed
}: VisionControlPanelProps) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    brightness: 0,
    contrast: 0,
    blur: 0,
    threshold: 128,
    edgeDetection: false,
    noiseReduction: 0
  });

  const [inspectionParams, setInspectionParams] = useState({
    defectDetection: false,
    dimensionalCheck: false,
    surfaceAnalysis: false,
    patternMatching: false,
    tolerance: 5
  });

  const handleFilterChange = useCallback((key: string, value: number | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [filters, onFiltersChange]);

  const applyFilter = useCallback(async (filterType: string) => {
    if (!currentImage) {
      toast({
        title: "No image",
        description: "Please load an image first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate image processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply different filters based on type
          switch (filterType) {
            case 'edge':
              // Simple edge detection simulation
              for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                const edge = gray > filters.threshold ? 255 : 0;
                data[i] = edge;
                data[i + 1] = edge;
                data[i + 2] = edge;
              }
              break;
            
            case 'brightness':
              for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, data[i] + filters.brightness));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + filters.brightness));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + filters.brightness));
              }
              break;
            
            case 'contrast':
              const contrastFactor = (259 * (filters.contrast + 255)) / (255 * (259 - filters.contrast));
              for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, contrastFactor * (data[i] - 128) + 128));
                data[i + 1] = Math.min(255, Math.max(0, contrastFactor * (data[i + 1] - 128) + 128));
                data[i + 2] = Math.min(255, Math.max(0, contrastFactor * (data[i + 2] - 128) + 128));
              }
              break;
          }

          ctx.putImageData(imageData, 0, 0);
          const processedDataUrl = canvas.toDataURL();
          onImageProcessed?.(processedDataUrl);
          
          toast({
            title: "Filter applied",
            description: `${filterType} filter has been applied successfully`
          });
        }
      };
      
      img.src = currentImage;
    } catch (error) {
      console.error('Filter application failed:', error);
      toast({
        title: "Filter failed",
        description: "Failed to apply filter to image",
        variant: "destructive"
      });
    }
  }, [currentImage, filters, onImageProcessed, toast]);

  const runInspection = useCallback(async (inspectionType: string) => {
    if (!currentImage) {
      toast({
        title: "No image",
        description: "Please load an image first",
        variant: "destructive"
      });
      return;
    }

    // Simulate inspection results
    const results = {
      defectDetection: { defects: Math.floor(Math.random() * 3), severity: 'Low' },
      dimensionalCheck: { withinTolerance: Math.random() > 0.3, deviation: (Math.random() * 2 - 1).toFixed(2) },
      surfaceAnalysis: { roughness: (Math.random() * 5 + 1).toFixed(2), quality: 'Good' },
      patternMatching: { confidence: (Math.random() * 30 + 70).toFixed(1) }
    };

    toast({
      title: "Inspection complete",
      description: `${inspectionType} inspection finished with results`,
      duration: 5000
    });

    console.log(`${inspectionType} results:`, results[inspectionType as keyof typeof results]);
  }, [currentImage, toast]);

  if (!selectedMachineId) {
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
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Brightness4 className="w-4 h-4" />
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
                    <Blur className="w-4 h-4" />
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

                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={() => applyFilter('brightness')}>
                    Apply Brightness
                  </Button>
                  <Button size="sm" onClick={() => applyFilter('contrast')}>
                    Apply Contrast
                  </Button>
                  <Button size="sm" onClick={() => applyFilter('edge')}>
                    Edge Detection
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inspection" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Inspection Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inspection type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defect">Defect Detection</SelectItem>
                      <SelectItem value="dimensional">Dimensional Check</SelectItem>
                      <SelectItem value="surface">Surface Analysis</SelectItem>
                      <SelectItem value="pattern">Pattern Matching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Tolerance (%): {inspectionParams.tolerance}</Label>
                  <Slider
                    value={[inspectionParams.tolerance]}
                    onValueChange={([value]) => 
                      setInspectionParams(prev => ({ ...prev, tolerance: value }))
                    }
                    min={0.1}
                    max={20}
                    step={0.1}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => runInspection('defectDetection')}
                    className="flex items-center gap-1"
                  >
                    <Search className="w-4 h-4" />
                    Defect Check
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => runInspection('dimensionalCheck')}
                    className="flex items-center gap-1"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Dimensions
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => runInspection('surfaceAnalysis')}
                    className="flex items-center gap-1"
                  >
                    <Crosshair className="w-4 h-4" />
                    Surface
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => runInspection('patternMatching')}
                    className="flex items-center gap-1"
                  >
                    <Zap className="w-4 h-4" />
                    Pattern
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-700">Status</div>
                    <Badge variant="outline" className="mt-1">
                      {currentImage ? 'Image Loaded' : 'No Image'}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-700">Processing</div>
                    <Badge variant="outline" className="mt-1">Ready</Badge>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Industrial Features</h4>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
