import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, AlertCircle } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

const VehicleDetectionPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Vehicle Detection</h1>
        <p className="text-muted-foreground">
          Detect and locate vehicles in images and video streams using YOLO-based object detection models
        </p>
      </div>

      {/* Detection Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Detection</CardTitle>
          <CardDescription>Upload images or connect video feed for real-time vehicle detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload an image or video for vehicle detection
            </p>
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
          {!selectedModel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              Please select an AI model below to start detection
            </div>
          )}
          {selectedModel && (
            <div className="text-sm text-muted-foreground">
              Using model: <Badge variant="secondary">{selectedModel.name}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detection Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detection Results</CardTitle>
          <CardDescription>Detected vehicles with bounding boxes and confidence scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { type: 'Car', confidence: 0.98, bbox: '[120, 45, 280, 195]' },
              { type: 'Truck', confidence: 0.95, bbox: '[310, 60, 480, 220]' },
              { type: 'Motorcycle', confidence: 0.89, bbox: '[520, 110, 590, 180]' },
              { type: 'Bus', confidence: 0.93, bbox: '[42, 180, 240, 340]' },
            ].map((detection, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{detection.type}</Badge>
                  <span className="text-sm text-muted-foreground">BBox: {detection.bbox}</span>
                </div>
                <Badge variant="secondary">{(detection.confidence * 100).toFixed(1)}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="vehicle_detection"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector selectedModel={selectedModel} />
      </div>

      {/* Dataset Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Requirements</CardTitle>
          <CardDescription>YOLO format annotations for vehicle detection training</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Structure:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <div>dataset/</div>
              <div>├── images/</div>
              <div>│   ├── train/ (training images)</div>
              <div>│   └── val/ (validation images)</div>
              <div>└── labels/</div>
              <div>    ├── train/ (YOLO format .txt files)</div>
              <div>    └── val/ (YOLO format .txt files)</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Annotation Format (YOLO):</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div># class_id center_x center_y width height (normalized 0-1)</div>
              <div>0 0.5 0.5 0.3 0.4  # Car</div>
              <div>1 0.7 0.3 0.2 0.3  # Truck</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Classes:</h4>
            <div className="flex flex-wrap gap-2">
              {['Car', 'Truck', 'Bus', 'Motorcycle', 'Bicycle', 'Van'].map(cls => (
                <Badge key={cls} variant="outline">{cls}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detection mAP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">94.2%</div>
            <p className="text-sm text-muted-foreground mt-1">Mean Average Precision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inference Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">45ms</div>
            <p className="text-sm text-muted-foreground mt-1">Per frame processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicles Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">12,847</div>
            <p className="text-sm text-muted-foreground mt-1">Total detections processed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleDetectionPage;
