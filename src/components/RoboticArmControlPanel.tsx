
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RoboticArmControlPanelProps {
  selectedMachineId?: string;
  onParametersChange?: (params: any) => void;
  selectedEndpoint?: string;
}

interface JointControlParams {
  [key: string]: number[];
}

export const RoboticArmControlPanel = ({ 
  selectedMachineId, 
  onParametersChange, 
  selectedEndpoint 
}: RoboticArmControlPanelProps) => {
  const [jointAngles, setJointAngles] = useState<JointControlParams>({});
  const [selectedConfiguration, setSelectedConfiguration] = useState('');
  const [speed, setSpeed] = useState([50]);
  const [acceleration, setAcceleration] = useState([25]);
  const { toast } = useToast();

  // Fetch selected machine data
  const { data: selectedMachine } = useQuery({
    queryKey: ['robotic_arm_params', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      const { data, error } = await supabase
        .from('robotic_arms')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Fetch saved configurations
  const { data: configurations } = useQuery({
    queryKey: ['joint_configurations', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return [];
      const { data, error } = await supabase
        .from('joint_configurations')
        .select('*')
        .eq('robotic_arm_id', selectedMachineId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Initialize joint angles when machine changes
  useEffect(() => {
    if (selectedMachine) {
      const initialAngles: JointControlParams = {};
      for (let i = 1; i <= selectedMachine.joints; i++) {
        initialAngles[`joint_${i}`] = [0];
      }
      setJointAngles(initialAngles);
    }
  }, [selectedMachine]);

  // Update parent with parameters whenever joint angles change
  useEffect(() => {
    if (selectedMachine && onParametersChange) {
      const params = {
        jointAngles: jointAngles,
        speed: speed[0],
        acceleration: acceleration[0],
        joints: selectedMachine.joints,
        maxReach: selectedMachine.max_reach,
        maxPayload: selectedMachine.max_payload
      };
      onParametersChange(params);
    }
  }, [jointAngles, speed, acceleration, selectedMachine, onParametersChange]);

  const handleJointChange = (jointName: string, value: number[]) => {
    setJointAngles(prev => ({
      ...prev,
      [jointName]: value
    }));
  };

  const handleLoadConfiguration = (configId: string) => {
    const config = configurations?.find(c => c.id === configId);
    if (config) {
      const newAngles: JointControlParams = {};
      for (let i = 1; i <= (selectedMachine?.joints || 6); i++) {
        const angleKey = `joint_${i}_angle`;
        newAngles[`joint_${i}`] = [config[angleKey] || 0];
      }
      setJointAngles(newAngles);
      setSelectedConfiguration(configId);
      toast({
        title: "Configuration Loaded",
        description: `Loaded configuration: ${config.name}`
      });
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedMachineId) {
      toast({
        title: "Error",
        description: "Please select a robotic arm first",
        variant: "destructive"
      });
      return;
    }

    const configData: any = {
      robotic_arm_id: selectedMachineId,
      name: `Config_${Date.now()}`,
      is_default: false
    };

    // Add joint angles to config data
    for (let i = 1; i <= (selectedMachine?.joints || 6); i++) {
      configData[`joint_${i}_angle`] = jointAngles[`joint_${i}`]?.[0] || 0;
    }

    try {
      const { error } = await supabase
        .from('joint_configurations')
        .insert(configData);

      if (error) throw error;

      toast({
        title: "Configuration Saved",
        description: "Joint configuration saved successfully"
      });

      // Refresh configurations
      window.location.reload();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

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

  const moveToHomePosition = () => {
    if (!selectedMachine) return;
    
    const homeAngles: JointControlParams = {};
    for (let i = 1; i <= selectedMachine.joints; i++) {
      homeAngles[`joint_${i}`] = [0];
    }
    setJointAngles(homeAngles);
    
    toast({
      title: "Moving to Home",
      description: "All joints set to home position (0°)"
    });
  };

  if (!selectedMachineId) {
    return (
      <Card className="p-4 bg-white border border-gray-200 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Joint Control Panel</h3>
        <p className="text-gray-600 text-sm">Select a robotic arm to view controls</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Joint Control Panel</h3>
      
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
            <span className="text-sm text-gray-600">Joints</span>
            <span className="text-sm font-medium">{selectedMachine?.joints || 6}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <Button onClick={moveToHomePosition} size="sm" className="w-full">
            Move to Home Position
          </Button>
        </div>
      </div>

      {/* Saved Configurations */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Saved Configurations</h4>
        <div className="space-y-2">
          <Select value={selectedConfiguration} onValueChange={handleLoadConfiguration}>
            <SelectTrigger>
              <SelectValue placeholder="Select configuration" />
            </SelectTrigger>
            <SelectContent>
              {configurations?.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSaveConfiguration} size="sm" className="w-full">
            Save Current Configuration
          </Button>
        </div>
      </div>

      {/* Movement Parameters */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Movement Parameters</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Speed: {speed[0]}%
            </label>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Acceleration: {acceleration[0]}%
            </label>
            <Slider
              value={acceleration}
              onValueChange={setAcceleration}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Joint Movement Controls */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Joint Movement Controls ({selectedMachine?.joints || 6} joints)</h4>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {selectedMachine && Array.from({ length: selectedMachine.joints }).map((_, index) => {
            const jointName = `joint_${index + 1}`;
            const currentAngle = jointAngles[jointName]?.[0] || 0;
            
            return (
              <div key={jointName} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Joint {index + 1}: {currentAngle.toFixed(1)}°
                </label>
                <Slider
                  value={jointAngles[jointName] || [0]}
                  onValueChange={(value) => handleJointChange(jointName, value)}
                  min={-180}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>
            );
          })}
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
