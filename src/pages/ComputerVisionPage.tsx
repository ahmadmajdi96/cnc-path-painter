
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Upload, FileText, Search, Scan, Camera, Users, Play, Settings } from 'lucide-react';

const ComputerVisionPage = () => {
  const [services] = useState([
    {
      id: 'ocr',
      name: 'Optical Character Recognition',
      description: 'Extract text from images and documents',
      icon: FileText,
      status: 'active',
      accuracy: '98.5%',
      lastUsed: '2 hours ago'
    },
    {
      id: 'qc',
      name: 'Quality Control',
      description: 'Automated visual inspection and defect detection',
      icon: Search,
      status: 'active',
      accuracy: '96.2%',
      lastUsed: '30 minutes ago'
    },
    {
      id: 'object-detection',
      name: 'Object Detection',
      description: 'Detect and locate objects in images',
      icon: Scan,
      status: 'active',
      accuracy: '94.8%',
      lastUsed: '1 hour ago'
    },
    {
      id: 'object-recognition',
      name: 'Object Recognition',
      description: 'Classify and identify objects in images',
      icon: Camera,
      status: 'active',
      accuracy: '97.1%',
      lastUsed: '45 minutes ago'
    },
    {
      id: 'face-recognition',
      name: 'Face Recognition',
      description: 'Identify and verify faces in images',
      icon: Users,
      status: 'active',
      accuracy: '99.3%',
      lastUsed: '3 hours ago'
    },
    {
      id: 'plate-recognition',
      name: 'License Plate Recognition',
      description: 'Extract and recognize license plates',
      icon: Scan,
      status: 'active',
      accuracy: '95.7%',
      lastUsed: '20 minutes ago'
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Computer Vision Services</h1>
          <p className="text-gray-600">AI-powered visual analysis and recognition services</p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Image
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Live Camera
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configure Models
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Accuracy</span>
                      <span className="text-sm font-medium">{service.accuracy}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Last Used</span>
                      <span className="text-sm font-medium">{service.lastUsed}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Run
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComputerVisionPage;
