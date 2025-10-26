import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, AlertCircle } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

const PlateDetectionPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Plate Detection</h1>
        <p className="text-muted-foreground">
          Detect and locate license plates in images and video streams with high accuracy
        </p>
      </div>

      {/* Detection Interface */}
      <Card>
        <CardHeader>
          <CardTitle>License Plate Detection</CardTitle>
          <CardDescription>Upload images or connect feed for plate detection with bounding box localization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload vehicle images for license plate detection
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
          <CardDescription>Detected license plates with coordinates and confidence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { bbox: '[245, 180, 312, 206]', confidence: 0.97, angle: 2.3 },
              { bbox: '[520, 145, 587, 171]', confidence: 0.95, angle: -1.5 },
              { bbox: '[102, 215, 169, 241]', confidence: 0.92, angle: 0.8 },
              { bbox: '[678, 190, 745, 216]', confidence: 0.89, angle: 3.1 },
            ].map((plate, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">Plate {idx + 1}</Badge>
                  <span className="text-sm text-muted-foreground">BBox: {plate.bbox}</span>
                  <span className="text-sm text-muted-foreground">Angle: {plate.angle}°</span>
                </div>
                <Badge variant="secondary">{(plate.confidence * 100).toFixed(1)}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="plate_detection"
          title="AI Models"
          description="Select or configure plate detection models"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector 
          modelId={selectedModel?.id || null}
          modelType="plate_detection"
        />
      </div>

      {/* Dataset Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Requirements</CardTitle>
          <CardDescription>YOLO format with plate bounding box annotations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Structure:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <div>dataset/</div>
              <div>├── images/</div>
              <div>│   ├── train/</div>
              <div>│   └── val/</div>
              <div>└── labels/</div>
              <div>    ├── train/ (YOLO .txt)</div>
              <div>    └── val/ (YOLO .txt)</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Annotation Format:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div># class_id center_x center_y width height</div>
              <div>0 0.485 0.623 0.145 0.062  # License plate</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Data Augmentation:</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Apply various transformations to improve robustness:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Rotation', 'Brightness', 'Blur', 'Occlusion', 'Perspective', 'Weather'].map(aug => (
                <Badge key={aug} variant="outline">{aug}</Badge>
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
            <div className="text-3xl font-bold text-primary">97.3%</div>
            <p className="text-sm text-muted-foreground mt-1">Mean Average Precision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">28ms</div>
            <p className="text-sm text-muted-foreground mt-1">Per image inference</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plates Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">15,624</div>
            <p className="text-sm text-muted-foreground mt-1">Total detections</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlateDetectionPage;
