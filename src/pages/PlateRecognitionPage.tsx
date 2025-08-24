
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan, Upload, Camera, Settings, Search } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';

const PlateRecognitionPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">License Plate Recognition</h1>
          <p className="text-gray-600">Automatic number plate recognition (ANPR) for vehicles using AI models</p>
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
                <Scan className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload vehicle image or start live monitoring</p>
                <div className="flex gap-2 justify-center">
                  <Button disabled={!selectedModel}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button variant="outline" disabled={!selectedModel}>
                    <Camera className="w-4 h-4 mr-2" />
                    Live Feed
                  </Button>
                </div>
              </div>
              
              {selectedModel ? (
                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm font-medium text-blue-900">Selected ANPR Model:</p>
                  <p className="text-sm text-blue-700">{selectedModel.name}</p>
                </div>
              ) : (
                <div className="p-3 bg-orange-50 rounded-lg mb-4">
                  <p className="text-sm text-orange-700">Please select a plate recognition model to start</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" disabled={!selectedModel}>
                  <Search className="w-4 h-4 mr-2" />
                  Search Plate
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
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
                  { plate: 'ABC-123', confidence: '98.7%', country: 'USA', timestamp: 'Just now' },
                  { plate: 'XYZ-789', confidence: '95.4%', country: 'USA', timestamp: '2 min ago' },
                  { plate: 'DEF-456', confidence: '92.1%', country: 'CAN', timestamp: '5 min ago' },
                  { plate: 'GHI-012', confidence: '89.8%', country: 'USA', timestamp: '8 min ago' },
                ].map((recognition, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-mono font-bold text-lg">{recognition.plate}</p>
                      <p className="text-sm text-gray-500">{recognition.country} • {recognition.timestamp}</p>
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
          modelType="plate_recognition"
          title="Plate Recognition"
          description="AI models for automatic number plate recognition (ANPR)"
          onModelSelect={setSelectedModel}
          selectedModelId={selectedModel?.id}
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recognition Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">95.7%</div>
              <p className="text-sm text-gray-500">Overall accuracy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Plates Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">1,823</div>
              <p className="text-sm text-gray-500">Vehicles processed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Processing Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">0.4s</div>
              <p className="text-sm text-gray-500">Average time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Blacklist Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">3</div>
              <p className="text-sm text-gray-500">Alerts triggered</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Plate Recognitions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 1, plate: 'ABC-123', location: 'Gate A', status: 'authorized', time: '14:32:15' },
                { id: 2, plate: 'XYZ-789', location: 'Gate B', status: 'visitor', time: '14:28:42' },
                { id: 3, plate: 'DEF-456', location: 'Parking Lot', status: 'authorized', time: '14:25:18' },
                { id: 4, plate: 'GHI-012', location: 'Gate A', status: 'blacklisted', time: '14:20:55' },
              ].map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-mono font-bold">{entry.plate}</div>
                    <div className="text-sm text-gray-500">{entry.location}</div>
                    <div className="text-sm text-gray-500">{entry.time}</div>
                  </div>
                  <Badge variant={
                    entry.status === 'authorized' ? 'default' :
                    entry.status === 'visitor' ? 'secondary' : 'destructive'
                  }>
                    {entry.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlateRecognitionPage;
