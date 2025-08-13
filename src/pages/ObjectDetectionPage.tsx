
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan, Upload, Camera, Settings, Play } from 'lucide-react';

const ObjectDetectionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Object Detection</h1>
          <p className="text-gray-600">Detect and locate multiple objects in images and video streams</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detection Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Object Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <Scan className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload image or start camera feed</p>
                <div className="flex gap-2 justify-center">
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Live Camera
                  </Button>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configure Models
              </Button>
            </CardContent>
          </Card>

          {/* Detection Results */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { object: 'Person', confidence: '98.5%', bbox: '[x:120, y:80, w:150, h:300]' },
                  { object: 'Car', confidence: '95.2%', bbox: '[x:300, y:200, w:200, h:120]' },
                  { object: 'Traffic Light', confidence: '89.7%', bbox: '[x:450, y:50, w:30, h:80]' },
                  { object: 'Stop Sign', confidence: '92.3%', bbox: '[x:550, y:150, w:60, h:60]' },
                ].map((detection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{detection.object}</p>
                      <p className="text-sm text-gray-500">{detection.bbox}</p>
                    </div>
                    <Badge variant="default">{detection.confidence}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Detections */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Detection Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 1, filename: 'street_scene.jpg', objects: 15, confidence: '94.2%', date: '1 hour ago' },
                { id: 2, filename: 'warehouse_camera.mp4', objects: 32, confidence: '91.8%', date: '3 hours ago' },
                { id: 3, filename: 'security_feed.jpg', objects: 8, confidence: '96.5%', date: '5 hours ago' },
              ].map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Scan className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{job.filename}</p>
                      <p className="text-sm text-gray-500">{job.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Objects: {job.objects}</span>
                    <Badge variant="default">{job.confidence}</Badge>
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

export default ObjectDetectionPage;
