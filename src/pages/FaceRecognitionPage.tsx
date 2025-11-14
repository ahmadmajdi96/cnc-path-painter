
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Upload, Settings, Play, Image, UserCheck } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

interface FaceRecognitionPageProps {
  projectId?: string;
}

const FaceRecognitionPage = ({ projectId }: FaceRecognitionPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Face Recognition</h1>
          <p className="text-muted-foreground">Identify and verify faces with advanced AI recognition technology</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recognition Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Face Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload image for face recognition</p>
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
                  <p className="text-sm text-orange-700">Please select a face recognition model to start</p>
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
                  { name: 'John Smith', confidence: '98.5%', status: 'verified', id: 'EMP001' },
                  { name: 'Sarah Johnson', confidence: '96.2%', status: 'verified', id: 'EMP002' },
                  { name: 'Unknown Person', confidence: '45.1%', status: 'unverified', id: 'N/A' },
                  { name: 'Mike Davis', confidence: '94.7%', status: 'verified', id: 'EMP003' },
                ].map((recognition, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <UserCheck className={`w-5 h-5 ${recognition.status === 'verified' ? 'text-green-600' : 'text-red-600'}`} />
                      <div>
                        <p className="font-medium">{recognition.name}</p>
                        <p className="text-sm text-gray-500">ID: {recognition.id}</p>
                      </div>
                    </div>
                    <Badge variant={recognition.status === 'verified' ? 'default' : 'destructive'}>
                      {recognition.confidence}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager
            modelType="face_recognition"
            title="Face Recognition"
            description="AI models for face detection and recognition"
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
            projectId={projectId}
          />
          <AIModelDatasetSelector
            modelId={selectedModel?.id || null}
            modelType="face_recognition"
            projectId={projectId}
          />
        </div>

        {/* Model Performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recognition Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">98.1%</div>
              <p className="text-sm text-gray-500">Overall accuracy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Faces Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">1,892</div>
              <p className="text-sm text-gray-500">Today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Database Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">2,341</div>
              <p className="text-sm text-gray-500">Registered faces</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Processing Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">0.1s</div>
              <p className="text-sm text-gray-500">Average per face</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionPage;
