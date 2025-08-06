
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Camera, Wifi, WifiOff } from 'lucide-react';

interface VisionSystem {
  id: string;
  name: string;
  endpoint: string;
  cameraType: string;
  resolution: string;
  status: 'online' | 'offline';
}

interface VisionSystemListProps {
  selectedSystem: string;
  onSystemSelect: (systemId: string) => void;
  visionSystems: VisionSystem[];
}

export const VisionSystemList = ({ 
  selectedSystem, 
  onSystemSelect, 
  visionSystems 
}: VisionSystemListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Vision Systems
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visionSystems.map((system) => (
            <div
              key={system.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedSystem === system.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSystemSelect(system.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{system.name}</h3>
                <div className="flex items-center gap-2">
                  {system.status === 'online' ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <Badge variant={system.status === 'online' ? 'default' : 'destructive'}>
                    {system.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Camera className="w-3 h-3" />
                  <span>{system.cameraType}</span>
                </div>
                <div>Resolution: {system.resolution}</div>
                <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {system.endpoint}
                </div>
              </div>
            </div>
          ))}
          
          {visionSystems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No vision systems available</p>
              <p className="text-sm">Add a vision system to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
