
import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { RoboticArmVisualization } from './RoboticArmVisualization';
import { RoboticArmControlPanel } from './RoboticArmControlPanel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddRoboticArmDialog } from './AddRoboticArmDialog';

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
            Add Robotic Arm
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="px-6 py-4">
        <StatusCards machineType="robotic_arms" />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-200px)]">
          {/* Left Sidebar - Machine List */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="pr-4">
              <MachineList 
                selectedMachine={selectedMachine}
                onMachineSelect={setSelectedMachine}
                machineType="robotic_arms"
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center - 3D Visualization and Endpoint Manager */}
          <ResizablePanel defaultSize={50} minSize={35}>
            <div className="px-4">
              <RoboticArmVisualization 
                selectedMachineId={selectedMachine}
                selectedEndpoint={selectedEndpoint}
                roboticArmParams={roboticArmParams}
                onEndpointSelect={setSelectedEndpoint}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Sidebar - Control Panel */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="pl-4">
              <RoboticArmControlPanel 
                selectedMachineId={selectedMachine}
                onParametersChange={setRoboticArmParams}
                selectedEndpoint={selectedEndpoint}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <AddRoboticArmDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};
