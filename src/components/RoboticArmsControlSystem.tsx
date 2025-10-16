
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
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Robotic Arms Control System</h1>
            <p className="text-muted-foreground">Monitor and control industrial robotic arms</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Robotic Arm
          </Button>
        </div>

        <StatusCards machineType="robotic_arms" />

        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-280px)] rounded-lg border">
          {/* Left Panel - Machine List */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 overflow-y-auto">
              <MachineList 
                selectedMachine={selectedMachine}
                onMachineSelect={setSelectedMachine}
                machineType="robotic_arms"
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Panel - 3D Visualization and Endpoint Manager */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <RoboticArmVisualization 
                selectedMachineId={selectedMachine}
                selectedEndpoint={selectedEndpoint}
                roboticArmParams={roboticArmParams}
                onEndpointSelect={setSelectedEndpoint}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Control Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 overflow-y-auto">
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
