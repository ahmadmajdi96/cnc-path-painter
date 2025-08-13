
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Camera, AlertTriangle, CheckCircle, Settings, Play } from 'lucide-react';

const QualityControlPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quality Control</h1>
          <p className="text-gray-600">AI-powered visual inspection and defect detection</p>
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
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Start Inspection
                </Button>
              </div>
              
              <div className="space-y-4">
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

        {/* Recent Inspections */}
        <Card>
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
