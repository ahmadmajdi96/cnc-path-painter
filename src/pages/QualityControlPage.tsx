
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Camera, AlertTriangle, CheckCircle, Settings, Play } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

const QualityControlPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Quality Control</h1>
          <p className="text-muted-foreground">AI-powered visual inspection and defect detection</p>
        </div>

        {/* Live Inspection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Live Inspection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Camera feed will appear here</p>
                <Button disabled={!selectedModel}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Inspection
                </Button>
              </div>
              
              <div className="space-y-4">
                {selectedModel ? (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Selected Model:</p>
                    <p className="text-sm text-blue-700">{selectedModel.name}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700">Please select a quality control model to start inspection</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Pass Rate</span>
                  <Badge variant="default">96.2%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Defects Detected</span>
                  <Badge variant="destructive">3</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Items Inspected</span>
                  <span className="font-medium">247</span>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Detection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager
            modelType="quality_control"
            title="Quality Control"
            description="AI models for visual inspection and defect detection"
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
          />
          <AIModelDatasetSelector
            modelId={selectedModel?.id || null}
            modelType="quality_control"
          />
        </div>

        {/* Recent Inspections */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 1, item: 'PCB Board #1234', result: 'pass', defects: 0, timestamp: '2 minutes ago' },
                { id: 2, item: 'Metal Part #5678', result: 'fail', defects: 2, timestamp: '5 minutes ago' },
                { id: 3, item: 'Assembly #9012', result: 'pass', defects: 0, timestamp: '8 minutes ago' },
                { id: 4, item: 'Component #3456', result: 'fail', defects: 1, timestamp: '12 minutes ago' },
              ].map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {inspection.result === 'pass' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{inspection.item}</p>
                      <p className="text-sm text-gray-500">{inspection.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Defects: {inspection.defects}</span>
                    <Badge variant={inspection.result === 'pass' ? 'default' : 'destructive'}>
                      {inspection.result.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QualityControlPage;
