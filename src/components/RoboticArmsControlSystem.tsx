
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoboticArmControlPanel } from './RoboticArmControlPanel';
import { RoboticArmVisualization } from './RoboticArmVisualization';
import { RoboticArmFileManager } from './RoboticArmFileManager';

export const RoboticArmsControlSystem = () => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [roboticArmParams, setRoboticArmParams] = useState<any>(null);

  // Fetch robotic arms
  const { data: roboticArms, isLoading } = useQuery({
    queryKey: ['robotic_arms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('robotic_arms')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const selectedMachine = roboticArms?.find(arm => arm.id === selectedMachineId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Robotic Arms Control System</h1>
        
        {/* Machine Selection */}
        <Card className="p-6 mb-6 bg-white border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Robotic Arm
              </label>
              <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a robotic arm..." />
                </SelectTrigger>
                <SelectContent>
                  {roboticArms?.map((arm) => (
                    <SelectItem key={arm.id} value={arm.id}>
                      {arm.name} - {arm.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedMachine && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine Details
                </label>
                <div className="text-sm text-gray-600">
                  <p>Model: {selectedMachine.model}</p>
                  <p>Joints: {selectedMachine.joints}</p>
                  <p>Max Reach: {selectedMachine.max_reach}mm</p>
                  <p>Max Payload: {selectedMachine.max_payload}kg</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {selectedMachineId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="lg:col-span-1">
              <RoboticArmControlPanel 
                selectedMachineId={selectedMachineId}
                selectedEndpoint={selectedEndpoint}
                onParametersChange={setRoboticArmParams}
              />
            </div>

            {/* Visualization */}
            <div className="lg:col-span-2 space-y-6">
              <RoboticArmVisualization 
                selectedMachineId={selectedMachineId}
                selectedEndpoint={selectedEndpoint}
                roboticArmParams={roboticArmParams}
                onEndpointSelect={setSelectedEndpoint}
              />
              
              {/* File Manager */}
              <RoboticArmFileManager 
                selectedMachineId={selectedMachineId}
                selectedEndpoint={selectedEndpoint}
              />
            </div>
          </div>
        )}

        {!selectedMachineId && (
          <Card className="p-12 bg-white border border-gray-200">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                {isLoading ? 'Loading robotic arms...' : 'Select a robotic arm to begin'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
