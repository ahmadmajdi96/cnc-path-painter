
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LaserControlPanelProps {
  onParametersChange?: (params: any) => void;
  selectedEndpoint?: string;
}

export const LaserControlPanel = ({ onParametersChange, selectedEndpoint }: LaserControlPanelProps) => {
  const [laserPower, setLaserPower] = useState([79]);
  const [pulseFrequency, setPulseFrequency] = useState([4300]);
  const [markingSpeed, setMarkingSpeed] = useState([1050]);
  const [pulseDuration, setPulseDuration] = useState([100]);
  const [zOffset, setZOffset] = useState([0]);
  const [passes, setPasses] = useState([1]);
  const [laserMode, setLaserMode] = useState('pulsed');
  const [beamDiameter, setBeamDiameter] = useState([0.1]);
  const [material, setMaterial] = useState('steel');
  const { toast } = useToast();

  // Update parent component when parameters change
  React.useEffect(() => {
    if (onParametersChange) {
      onParametersChange({
        laserPower: laserPower[0],
        pulseFrequency: pulseFrequency[0],
        markingSpeed: markingSpeed[0],
        pulseDuration: pulseDuration[0],
        zOffset: zOffset[0],
        passes: passes[0],
        laserMode,
        beamDiameter: beamDiameter[0],
        material
      });
    }
  }, [laserPower, pulseFrequency, markingSpeed, pulseDuration, zOffset, passes, laserMode, beamDiameter, material, onParametersChange]);

  const sendEmergencyStop = async () => {
    if (!selectedEndpoint) {
      toast({
        title: "No Endpoint",
        description: "Please select an endpoint first",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${selectedEndpoint}/emergency-stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'emergency_stop' }),
      });
      
      if (response.ok) {
        toast({
          title: "Emergency Stop Sent",
          description: "Emergency stop command sent successfully",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Emergency Stop Failed",
        description: `Failed to send emergency stop: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const sendLaserTest = async () => {
    if (!selectedEndpoint) {
      toast({
        title: "No Endpoint",
        description: "Please select an endpoint first",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${selectedEndpoint}/laser-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'laser_test',
          power: 10, // Low power for testing
          duration: 1000 // 1 second test
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Laser Test Sent",
          description: "Low power laser test command sent successfully",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Laser Test Failed",
        description: `Failed to send laser test: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Laser Control Panel</h3>
      
      {/* Machine Status */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Laser Status</h4>
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
            <span className="text-sm text-gray-600">Temperature</span>
            <span className="text-sm font-medium">42°C</span>
          </div>
        </div>
      </div>

      {/* Laser Parameters */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Laser Parameters</h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Laser Power: {laserPower[0]}%
            </label>
            <Slider
              value={laserPower}
              onValueChange={setLaserPower}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Pulse Frequency: {pulseFrequency[0]} Hz
            </label>
            <Slider
              value={pulseFrequency}
              onValueChange={setPulseFrequency}
              min={100}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Marking Speed: {markingSpeed[0]} mm/min
            </label>
            <Slider
              value={markingSpeed}
              onValueChange={setMarkingSpeed}
              min={50}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Pulse Duration: {pulseDuration[0]} µs
            </label>
            <Slider
              value={pulseDuration}
              onValueChange={setPulseDuration}
              min={10}
              max={1000}
              step={10}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Z-Offset: {zOffset[0]} mm
            </label>
            <Slider
              value={zOffset}
              onValueChange={setZOffset}
              min={-5}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Beam Diameter: {beamDiameter[0]} mm
            </label>
            <Slider
              value={beamDiameter}
              onValueChange={setBeamDiameter}
              min={0.05}
              max={1.0}
              step={0.05}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passes">Passes</Label>
              <Input
                id="passes"
                type="number"
                value={passes[0]}
                onChange={(e) => setPasses([Number(e.target.value)])}
                min="1"
                max="10"
              />
            </div>
            <div>
              <Label htmlFor="laserMode">Laser Mode</Label>
              <Select value={laserMode} onValueChange={setLaserMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pulsed">Pulsed</SelectItem>
                  <SelectItem value="continuous">Continuous Wave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Material Settings */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Material</h4>
        <Select value={material} onValueChange={setMaterial}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="steel">Steel</SelectItem>
            <SelectItem value="aluminum">Aluminum</SelectItem>
            <SelectItem value="plastic">Plastic</SelectItem>
            <SelectItem value="ceramic">Ceramic</SelectItem>
            <SelectItem value="glass">Glass</SelectItem>
            <SelectItem value="wood">Wood</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Safety Controls */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Safety</h4>
        <div className="space-y-2">
          <Button 
            onClick={sendEmergencyStop}
            variant="outline" 
            className="w-full bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
          >
            Emergency Stop
          </Button>
          <Button 
            onClick={sendLaserTest}
            variant="outline" 
            className="w-full bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
          >
            Laser Test (Low Power)
          </Button>
        </div>
      </div>
    </Card>
  );
};
