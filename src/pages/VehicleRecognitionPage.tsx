import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, AlertCircle } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

const VehicleRecognitionPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Vehicle Recognition</h1>
        <p className="text-muted-foreground">
          Classify and identify vehicle types, makes, models, and colors using deep learning
        </p>
      </div>

      {/* Recognition Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Recognition</CardTitle>
          <CardDescription>Upload images for vehicle type, make, model, and color classification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload vehicle images for classification
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
              Please select an AI model below to start recognition
            </div>
          )}
          {selectedModel && (
            <div className="text-sm text-muted-foreground">
              Using model: <Badge variant="secondary">{selectedModel.name}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recognition Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recognition Results</CardTitle>
          <CardDescription>Detailed vehicle classification results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'Sedan', make: 'Toyota', model: 'Camry', year: '2021', color: 'Silver', confidence: 0.96 },
              { type: 'SUV', make: 'Ford', model: 'Explorer', year: '2022', color: 'Black', confidence: 0.93 },
              { type: 'Truck', make: 'Chevrolet', model: 'Silverado', year: '2020', color: 'White', confidence: 0.89 },
            ].map((vehicle, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge>{vehicle.type}</Badge>
                      <span className="font-semibold">{vehicle.make} {vehicle.model}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Year: {vehicle.year} • Color: {vehicle.color}
                    </div>
                  </div>
                  <Badge variant="secondary">{(vehicle.confidence * 100).toFixed(1)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="vehicle_recognition"
          title="AI Models"
          description="Select or configure vehicle recognition models"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector 
          modelId={selectedModel?.id || null}
          modelType="vehicle_recognition"
        />
      </div>

      {/* Dataset Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Requirements</CardTitle>
          <CardDescription>Image classification dataset for vehicle recognition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Structure:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <div>dataset/</div>
              <div>├── train/</div>
              <div>│   ├── sedan/</div>
              <div>│   ├── suv/</div>
              <div>│   ├── truck/</div>
              <div>│   └── ...</div>
              <div>└── val/</div>
              <div>    ├── sedan/</div>
              <div>    └── ...</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Metadata (JSON):</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div>{'{'}</div>
              <div>  "image": "vehicle_001.jpg",</div>
              <div>  "type": "sedan",</div>
              <div>  "make": "Toyota",</div>
              <div>  "model": "Camry",</div>
              <div>  "year": 2021,</div>
              <div>  "color": "silver"</div>
              <div>{'}'}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Vehicle Categories:</h4>
            <div className="flex flex-wrap gap-2">
              {['Sedan', 'SUV', 'Truck', 'Van', 'Coupe', 'Convertible', 'Hatchback', 'Wagon'].map(type => (
                <Badge key={type} variant="outline">{type}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Classification Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">96.7%</div>
            <p className="text-sm text-muted-foreground mt-1">Top-1 accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Model Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">2,450</div>
            <p className="text-sm text-muted-foreground mt-1">Make/model combinations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicles Classified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">8,932</div>
            <p className="text-sm text-muted-foreground mt-1">Total classifications</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleRecognitionPage;
