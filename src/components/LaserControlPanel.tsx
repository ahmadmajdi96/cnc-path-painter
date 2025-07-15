
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LaserControlPanelProps {
  selectedMachineId?: string;
  onParametersChange?: (params: any) => void;
  selectedEndpoint?: string;
}

export const LaserControlPanel = ({ selectedMachineId, onParametersChange, selectedEndpoint }: LaserControlPanelProps) => {
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

  // Fetch selected machine data to set machine-specific parameters
  const { data: selectedMachine } = useQuery({
    queryKey: ['laser-machine-params', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      const { data, error } = await supabase
        .from('laser_machines')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Update parameters when machine changes
  useEffect(() => {
    if (selectedMachine) {
      setLaserPower([selectedMachine.max_power || 100]);
      setPulseFrequency([selectedMachine.max_frequency || 10000]);
      setMarkingSpeed([selectedMachine.max_speed || 2000]);
      setBeamDiameter([selectedMachine.beam_diameter || 0.1]);
    }
  }, [selectedMachine]);

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

  if (!selectedMachineId) {
    return (
      <Card className="p-4 bg-white border border-gray-200 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Laser Control Panel</h3>
        <p className="text-gray-600 text-sm">Select a laser machine to view controls</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Laser Control Panel</h3>
      
      {selectedMachine && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Machine: {selectedMachine.name}</h4>
          <p className="text-sm text-gray-600">{selectedMachine.model}</p>
        </div>
      )}
      
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
              Laser Power: {laserPower[0]}% {selectedMachine && `(Max: ${selectedMachine.max_power || 'N/A'})`}
            </label>
            <Slider
              value={laserPower}
              onValueChange={setLaserPower}
              min={1}
              max={selectedMachine?.max_power || 100}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Pulse Frequency: {pulseFrequency[0]} Hz {selectedMachine && `(Max: ${selectedMachine.max_frequency || 'N/A'})`}
            </label>
            <Slider
              value={pulseFrequency}
              onValueChange={setPulseFrequency}
              min={100}
              max={selectedMachine?.max_frequency || 10000}
              step={100}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Marking Speed: {markingSpeed[0]} mm/min {selectedMachine && `(Max: ${selectedMachine.max_speed || 'N/A'})`}
            </label>
            <Slider
              value={markingSpeed}
              onValueChange={setMarkingSpeed}
              min={50}
              max={selectedMachine?.max_speed || 2000}
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
              Beam Diameter: {beamDiameter[0]} mm {selectedMachine && `(Spec: ${selectedMachine.beam_diameter || 'N/A'})`}
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
