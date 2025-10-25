
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan, Upload, Settings, Play, Image, Car } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

const PlateRecognitionPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">License Plate Recognition</h1>
          <p className="text-muted-foreground">Automatically detect and read license plates with AI-powered OCR technology</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recognition Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Plate Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload image for license plate recognition</p>
                <div className="flex gap-2 justify-center">
                  <Button disabled={!selectedModel}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button variant="outline" disabled={!selectedModel}>
                    <Play className="w-4 h-4 mr-2" />
                    Live Recognition
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
                  <p className="text-sm text-orange-700">Please select a plate recognition model to start</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recognition Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recognition Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { plate: 'ABC-1234', confidence: '98.9%', location: 'Front Camera', timestamp: '2 min ago' },
                  { plate: 'XYZ-5678', confidence: '97.2%', location: 'Rear Camera', timestamp: '5 min ago' },
                  { plate: 'DEF-9012', confidence: '95.8%', location: 'Side Camera', timestamp: '8 min ago' },
                  { plate: 'GHI-3456', confidence: '94.1%', location: 'Front Camera', timestamp: '12 min ago' },
                ].map((recognition, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium font-mono text-lg">{recognition.plate}</p>
                        <p className="text-sm text-gray-500">{recognition.location} • {recognition.timestamp}</p>
                      </div>
                    </div>
                    <Badge variant="default">{recognition.confidence}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager
            modelType="plate_recognition"
            title="Plate Recognition"
            description="AI models for license plate detection and OCR"
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
          />
          <AIModelDatasetSelector
            modelId={selectedModel?.id || null}
            modelType="plate_recognition"
          />
        </div>

        {/* Model Performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recognition Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">97.8%</div>
              <p className="text-sm text-gray-500">Character accuracy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Plates Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">1,524</div>
              <p className="text-sm text-gray-500">Successfully read</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detection Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">0.4s</div>
              <p className="text-sm text-gray-500">Average per plate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Cameras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">8</div>
              <p className="text-sm text-gray-500">Currently monitoring</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlateRecognitionPage;
