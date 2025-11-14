import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, AlertCircle } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

interface VehicleDetectionPageProps {
  projectId?: string;
}

const VehicleDetectionPage = ({ projectId }: VehicleDetectionPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vehicle Detection</h1>
          <p className="text-muted-foreground">Detect and locate vehicles in images and video streams using YOLO-based object detection models</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Detection Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Vehicle Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload image or video for vehicle detection</p>
                  <div className="flex gap-2 justify-center">
                    <Button disabled={!selectedModel}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <Button variant="outline" disabled={!selectedModel}>
                      <Video className="w-4 h-4 mr-2" />
                      Live Feed
                    </Button>
                  </div>
                </div>
              </div>
              
              {selectedModel ? (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected Model:</p>
                  <p className="text-sm text-blue-700">{selectedModel.name}</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">Please select a vehicle detection model below</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detection Results */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-gray-500">No detections yet. Upload an image or connect a video feed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager 
            modelType="vehicle_detection"
            title="Vehicle Detection"
            description="AI models for vehicle detection and localization"
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
            projectId={projectId}
          />
          <AIModelDatasetSelector 
            modelId={selectedModel?.id || null}
            modelType="vehicle_detection"
            projectId={projectId}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detection mAP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">94.2%</div>
              <p className="text-sm text-muted-foreground">Mean Average Precision</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Inference Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">45ms</div>
              <p className="text-sm text-muted-foreground">Per frame processing</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Vehicles Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">12,847</div>
              <p className="text-sm text-muted-foreground">Total detections processed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">1.2s</div>
              <p className="text-sm text-muted-foreground">Average per image</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetectionPage;
