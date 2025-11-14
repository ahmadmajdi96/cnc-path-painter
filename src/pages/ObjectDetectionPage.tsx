
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan, Upload, Settings, Play, Image } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

interface ObjectDetectionPageProps {
  projectId?: string;
}

const ObjectDetectionPage = ({ projectId }: ObjectDetectionPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Object Detection</h1>
          <p className="text-muted-foreground">Detect and locate objects in images and video streams with AI-powered models</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Detection Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Object Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload image for object detection</p>
                <div className="flex gap-2 justify-center">
                  <Button disabled={!selectedModel}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button variant="outline" disabled={!selectedModel}>
                    <Play className="w-4 h-4 mr-2" />
                    Live Feed
                  </Button>
                </div>
              </div>
              
              {selectedModel ? (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected Model:</p>
                  <p className="text-sm text-blue-700">{selectedModel.name}</p>
                </div>
              ) : (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">Please select an object detection model to start</p>
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
              <div className="space-y-3">
                {[
                  { object: 'Person', confidence: '95.7%', bbox: '[120, 45, 280, 340]' },
                  { object: 'Car', confidence: '89.2%', bbox: '[45, 180, 200, 280]' },
                  { object: 'Traffic Light', confidence: '78.5%', bbox: '[320, 20, 350, 80]' },
                  { object: 'Building', confidence: '92.1%', bbox: '[0, 0, 400, 150]' },
                ].map((detection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{detection.object}</p>
                      <p className="text-sm text-gray-500">Bounding box: {detection.bbox}</p>
                    </div>
                    <Badge variant="default">{detection.confidence}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager
            modelType="object_detection"
            title="Object Detection"
            description="AI models for object detection and localization"
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
            projectId={projectId}
          />
          <AIModelDatasetSelector
            modelId={selectedModel?.id || null}
            modelType="object_detection"
            projectId={projectId}
          />
        </div>

        {/* Model Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detection Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">92.8%</div>
              <p className="text-sm text-gray-500">Overall detection accuracy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Objects Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">3,456</div>
              <p className="text-sm text-gray-500">In the last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Processing Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">0.2s</div>
              <p className="text-sm text-gray-500">Average processing time</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetectionPage;
