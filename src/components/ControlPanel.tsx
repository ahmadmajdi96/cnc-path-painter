
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const ControlPanel = () => {
  const [feedRate, setFeedRate] = useState([1000]);
  const [spindleSpeed, setSpindleSpeed] = useState([8000]);
  const [plungeDepth, setPlungeDepth] = useState([2]);

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Control Panel</h3>
      
      {/* Machine Status */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Machine Status</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Connection</span>
            <Badge className="bg-green-100 text-green-800">Connected</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">State</span>
            <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tool</span>
            <span className="text-sm font-medium">End Mill 6mm</span>
          </div>
        </div>
      </div>

      {/* Cutting Parameters */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Cutting Parameters</h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Feed Rate: {feedRate[0]} mm/min
            </label>
            <Slider
              value={feedRate}
              onValueChange={setFeedRate}
              min={100}
              max={3000}
              step={100}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Spindle Speed: {spindleSpeed[0]} RPM
            </label>
            <Slider
              value={spindleSpeed}
              onValueChange={setSpindleSpeed}
              min={1000}
              max={15000}
              step={500}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Plunge Depth: {plungeDepth[0]} mm
            </label>
            <Slider
              value={plungeDepth}
              onValueChange={setPlungeDepth}
              min={0.5}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Material Settings */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Material</h4>
        <Select defaultValue="aluminum">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aluminum">Aluminum</SelectItem>
            <SelectItem value="steel">Steel</SelectItem>
            <SelectItem value="wood">Wood</SelectItem>
            <SelectItem value="plastic">Plastic</SelectItem>
            <SelectItem value="brass">Brass</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};
