
import React, { useState, useEffect } from 'react';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { RoboticArmVisualization } from './RoboticArmVisualization';
import { RoboticArmControlPanel } from './RoboticArmControlPanel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddRoboticArmDialog } from './AddRoboticArmDialog';
import { MainNavigation } from './MainNavigation';

export const RoboticArmsControlSystem = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [roboticArmParams, setRoboticArmParams] = useState({});

  // Clear endpoint when machine changes
  useEffect(() => {
    setSelectedEndpoint('');
  }, [selectedMachine]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Robotic Arms Control System</h1>
            <p className="text-gray-600">Monitor and control industrial robotic arms</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Robot
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="px-6 py-4">
        <StatusCards machineType="robotic_arms" />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6 flex gap-6 min-h-[calc(100vh-200px)]">
        {/* Left Sidebar - Machine List */}
        <div className="w-80 flex-shrink-0">
          <MachineList 
            selectedMachine={selectedMachine}
            onMachineSelect={setSelectedMachine}
            machineType="robotic_arms"
          />
        </div>

        {/* Center - 3D Visualization and Endpoint Manager */}
        <div className="flex-1 min-w-0 space-y-6">
          <RoboticArmVisualization 
            selectedMachineId={selectedMachine}
            selectedEndpoint={selectedEndpoint}
            roboticArmParams={roboticArmParams}
            onEndpointSelect={setSelectedEndpoint}
          />
        </div>

        {/* Right Sidebar - Control Panel */}
        <div className="w-96 flex-shrink-0">
          <RoboticArmControlPanel 
            selectedMachineId={selectedMachine}
            onParametersChange={setRoboticArmParams}
            selectedEndpoint={selectedEndpoint}
          />
        </div>
      </div>

      <AddRoboticArmDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};
