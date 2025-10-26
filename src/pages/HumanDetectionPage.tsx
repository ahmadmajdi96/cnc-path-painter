import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, AlertCircle } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

const HumanDetectionPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Human Detection</h1>
        <p className="text-muted-foreground">
          Detect and track people in images and videos using advanced pose estimation and detection models
        </p>
      </div>

      {/* Detection Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Human Detection</CardTitle>
          <CardDescription>Upload images or video streams for real-time person detection and tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload images or videos for human detection
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
          <CardDescription>Detected people with bounding boxes and pose estimation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { id: 1, bbox: '[120, 45, 240, 380]', confidence: 0.97, pose: 'Standing', keypoints: 17 },
              { id: 2, bbox: '[310, 60, 420, 350]', confidence: 0.94, pose: 'Walking', keypoints: 17 },
              { id: 3, bbox: '[520, 110, 610, 340]', confidence: 0.91, pose: 'Sitting', keypoints: 14 },
              { id: 4, bbox: '[42, 180, 150, 380]', confidence: 0.88, pose: 'Standing', keypoints: 17 },
            ].map((person) => (
              <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Person {person.id}</Badge>
                  <span className="text-sm text-muted-foreground">BBox: {person.bbox}</span>
                  <Badge variant="secondary">{person.pose}</Badge>
                  <span className="text-sm text-muted-foreground">{person.keypoints} keypoints</span>
                </div>
                <Badge variant="default">{(person.confidence * 100).toFixed(1)}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="human_detection"
          title="AI Models"
          description="Select or configure human detection models"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector 
          modelId={selectedModel?.id || null}
          modelType="human_detection"
        />
      </div>

      {/* Dataset Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Requirements</CardTitle>
          <CardDescription>COCO-style annotations for person detection with keypoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Structure:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <div>dataset/</div>
              <div>├── images/</div>
              <div>│   ├── train/</div>
              <div>│   └── val/</div>
              <div>└── annotations/</div>
              <div>    ├── person_keypoints_train.json</div>
              <div>    └── person_keypoints_val.json</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Annotation Format (COCO):</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div>{'{'}</div>
              <div>  "bbox": [x, y, width, height],</div>
              <div>  "keypoints": [x1,y1,v1, x2,y2,v2, ...],</div>
              <div>  "num_keypoints": 17,</div>
              <div>  "category_id": 1</div>
              <div>{'}'}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Keypoint Schema (17 points):</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Nose', 'Left Eye', 'Right Eye', 'Left Ear', 'Right Ear', 'Left Shoulder', 'Right Shoulder', 
                'Left Elbow', 'Right Elbow', 'Left Wrist', 'Right Wrist', 'Left Hip', 'Right Hip', 
                'Left Knee', 'Right Knee', 'Left Ankle', 'Right Ankle'].map(kp => (
                <Badge key={kp} variant="outline">{kp}</Badge>
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
            <div className="text-3xl font-bold text-primary">91.8%</div>
            <p className="text-sm text-muted-foreground mt-1">Mean Average Precision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">35ms</div>
            <p className="text-sm text-muted-foreground mt-1">Per frame inference</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">People Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">24,652</div>
            <p className="text-sm text-muted-foreground mt-1">Total detections</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HumanDetectionPage;
