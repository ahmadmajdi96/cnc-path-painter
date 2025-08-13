
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Upload, Camera, Shield, Settings, UserPlus } from 'lucide-react';

const FaceRecognitionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Face Recognition</h1>
          <p className="text-gray-600">Identify and verify faces with advanced biometric analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload image or start live recognition</p>
                <div className="flex gap-2 justify-center">
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Live Camera
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Person
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recognition Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Recognition Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'John Smith', confidence: '99.2%', lastSeen: '2 minutes ago', status: 'verified' },
                  { name: 'Unknown Person', confidence: '0%', lastSeen: 'Just now', status: 'unrecognized' },
                  { name: 'Sarah Johnson', confidence: '97.8%', lastSeen: '5 minutes ago', status: 'verified' },
                  { name: 'Mike Davis', confidence: '94.5%', lastSeen: '8 minutes ago', status: 'verified' },
                ].map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-gray-500">{person.lastSeen}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={person.status === 'verified' ? 'default' : 'secondary'}>
                        {person.confidence}
                      </Badge>
                      <Badge variant={person.status === 'verified' ? 'default' : 'destructive'}>
                        {person.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Management */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Face Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">247</div>
                <p className="text-sm text-gray-500">Registered Faces</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">99.3%</div>
                <p className="text-sm text-gray-500">Recognition Rate</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1,543</div>
                <p className="text-sm text-gray-500">Today's Recognitions</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">0.2s</div>
                <p className="text-sm text-gray-500">Avg Response Time</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Register New Face
              </Button>
              <Button variant="outline">
                Export Database
              </Button>
              <Button variant="outline">
                Import Faces
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaceRecognitionPage;
