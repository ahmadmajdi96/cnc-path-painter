
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Settings, Play, Image } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';

const ObjectRecognitionPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Object Recognition</h1>
          <p className="text-muted-foreground">Classify and identify objects in images with high accuracy using AI models</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recognition Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Object Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload image for object recognition</p>
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
                  <p className="text-sm text-orange-700">Please select an object recognition model to start</p>
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
                  { object: 'Golden Retriever', confidence: '97.8%', category: 'Animal' },
                  { object: 'Smartphone', confidence: '94.2%', category: 'Electronics' },
                  { object: 'Coffee Mug', confidence: '91.5%', category: 'Kitchen' },
                  { object: 'Red Rose', confidence: '89.3%', category: 'Plant' },
                ].map((recognition, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{recognition.object}</p>
                      <p className="text-sm text-gray-500">{recognition.category}</p>
                    </div>
                    <Badge variant="default">{recognition.confidence}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Model Manager */}
        <AIModelManager
          modelType="object_recognition"
          title="Object Recognition"
          description="AI models for object classification and identification"
          onModelSelect={setSelectedModel}
          selectedModelId={selectedModel?.id}
        />

        {/* Model Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">97.1%</div>
              <p className="text-sm text-gray-500">Overall recognition accuracy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Objects Recognized</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">1,247</div>
              <p className="text-sm text-gray-500">In the last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Processing Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">0.3s</div>
              <p className="text-sm text-gray-500">Average processing time</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ObjectRecognitionPage;
