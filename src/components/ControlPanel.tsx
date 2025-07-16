
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ControlPanelProps {
  selectedMachineId?: string;
  onParametersChange?: (params: any) => void;
  selectedEndpoint?: string;
}

interface MachineParameters {
  feedRate: number[];
  spindleSpeed: number[];
  plungeDepth: number[];
  material: string;
  materialWidth: number[];
  materialHeight: number[];
}

export const ControlPanel = ({ selectedMachineId, onParametersChange, selectedEndpoint }: ControlPanelProps) => {
  // Store parameters for each machine
  const machineParameters = useRef<Record<string, MachineParameters>>({});
  
  // Default parameters
  const defaultParams: MachineParameters = {
    feedRate: [1000],
    spindleSpeed: [8000],
    plungeDepth: [2],
    material: 'aluminum',
    materialWidth: [300],
    materialHeight: [200]
  };

  // Current parameters state
  const [feedRate, setFeedRate] = useState(defaultParams.feedRate);
  const [spindleSpeed, setSpindleSpeed] = useState(defaultParams.spindleSpeed);
  const [plungeDepth, setPlungeDepth] = useState(defaultParams.plungeDepth);
  const [material, setMaterial] = useState(defaultParams.material);
  const [materialWidth, setMaterialWidth] = useState(defaultParams.materialWidth);
  const [materialHeight, setMaterialHeight] = useState(defaultParams.materialHeight);
  const { toast } = useToast();

  // Fetch selected machine data to set machine-specific parameters
  const { data: selectedMachine } = useQuery({
    queryKey: ['cnc-machine-params', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      const { data, error } = await supabase
        .from('cnc_machines')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Load parameters when machine changes
  useEffect(() => {
    if (selectedMachineId) {
      const savedParams = machineParameters.current[selectedMachineId];
      if (savedParams) {
        // Load saved parameters for this machine
        setFeedRate(savedParams.feedRate);
        setSpindleSpeed(savedParams.spindleSpeed);
        setPlungeDepth(savedParams.plungeDepth);
        setMaterial(savedParams.material);
        setMaterialWidth(savedParams.materialWidth);
        setMaterialHeight(savedParams.materialHeight);
      } else {
        // Initialize with default parameters for new machine
        setFeedRate(defaultParams.feedRate);
        setSpindleSpeed(defaultParams.spindleSpeed);
        setPlungeDepth(defaultParams.plungeDepth);
        setMaterial(defaultParams.material);
        setMaterialWidth(defaultParams.materialWidth);
        setMaterialHeight(defaultParams.materialHeight);
      }
    }
  }, [selectedMachineId]);

  // Save parameters when they change
  useEffect(() => {
    if (selectedMachineId) {
      machineParameters.current[selectedMachineId] = {
        feedRate,
        spindleSpeed,
        plungeDepth,
        material,
        materialWidth,
        materialHeight
      };
    }
  }, [selectedMachineId, feedRate, spindleSpeed, plungeDepth, material, materialWidth, materialHeight]);

  // Auto-save parameters when they change and immediately notify parent
  useEffect(() => {
    const params = {
      feedRate: feedRate[0],
      spindleSpeed: spindleSpeed[0],
      plungeDepth: plungeDepth[0],
      material,
      materialWidth: materialWidth[0],
      materialHeight: materialHeight[0],
      toolDiameter: 6 // Default tool diameter for CNC
    };
    
    if (onParametersChange) {
      onParametersChange(params);
    }
  }, [feedRate, spindleSpeed, plungeDepth, material, materialWidth, materialHeight, onParametersChange]);

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

  if (!selectedMachineId) {
    return (
      <Card className="p-4 bg-white border border-gray-200 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CNC Control Panel</h3>
        <p className="text-gray-600 text-sm">Select a CNC machine to view controls</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">CNC Control Panel</h3>
      
      {selectedMachine && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Machine: {selectedMachine.name}</h4>
          <p className="text-sm text-gray-600">{selectedMachine.model}</p>
        </div>
      )}
      
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

      {/* Material Settings */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Material Settings</h4>
        
        <div className="space-y-4">
          <div>
            <Select value={material} onValueChange={setMaterial}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Width: {materialWidth[0]}mm
              </label>
              <Slider
                value={materialWidth}
                onValueChange={setMaterialWidth}
                min={50}
                max={600}
                step={10}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Height: {materialHeight[0]}mm
              </label>
              <Slider
                value={materialHeight}
                onValueChange={setMaterialHeight}
                min={50}
                max={400}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cutting Parameters */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Cutting Parameters</h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Feed Rate: {feedRate[0]} mm/min {selectedMachine && `(Max: ${selectedMachine.max_feed_rate || 'N/A'})`}
            </label>
            <Slider
              value={feedRate}
              onValueChange={setFeedRate}
              min={100}
              max={selectedMachine?.max_feed_rate || 3000}
              step={100}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Spindle Speed: {spindleSpeed[0]} RPM {selectedMachine && `(Max: ${selectedMachine.max_spindle_speed || 'N/A'})`}
            </label>
            <Slider
              value={spindleSpeed}
              onValueChange={setSpindleSpeed}
              min={1000}
              max={selectedMachine?.max_spindle_speed || 15000}
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

      {/* Safety Controls */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Safety</h4>
        <Button 
          onClick={sendEmergencyStop}
          variant="outline" 
          className="w-full bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        >
          Emergency Stop
        </Button>
      </div>
    </Card>
  );
};
