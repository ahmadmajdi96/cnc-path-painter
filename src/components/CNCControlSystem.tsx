
import React, { useState, useEffect } from 'react';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { CNCVisualization } from './CNCVisualization';
import { ControlPanel } from './ControlPanel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddMachineDialog } from './AddMachineDialog';
import { MainNavigation } from './MainNavigation';

export const CNCControlSystem = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [cncParams, setCncParams] = useState({});

  // Persist endpoint selection across page reloads
  useEffect(() => {
    const savedEndpoint = localStorage.getItem(`cnc-endpoint-${selectedMachine}`);
    if (savedEndpoint && selectedMachine) {
      setSelectedEndpoint(savedEndpoint);
    }
  }, [selectedMachine]);

  // Save endpoint selection to localStorage
  const handleEndpointSelect = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    if (selectedMachine && endpoint) {
      localStorage.setItem(`cnc-endpoint-${selectedMachine}`, endpoint);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">CNC Control System</h1>
            <p className="text-gray-600">Monitor and control CNC machining operations</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add CNC Machine
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="px-6 py-4">
        <StatusCards machineType="cnc" />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-200px)]">
        {/* Left Sidebar - Machine List */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <MachineList 
            selectedMachine={selectedMachine}
            onMachineSelect={setSelectedMachine}
            machineType="cnc"
          />
        </div>

        {/* Center - 2D Visualization and Endpoint Manager */}
        <div className="flex-1 min-w-0 space-y-6 overflow-hidden">
          <CNCVisualization 
            selectedMachineId={selectedMachine}
            selectedEndpoint={selectedEndpoint}
            cncParams={cncParams}
            onEndpointSelect={handleEndpointSelect}
          />
        </div>

        {/* Right Sidebar - Control Panel */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <ControlPanel 
            selectedMachineId={selectedMachine}
            onParametersChange={setCncParams}
            selectedEndpoint={selectedEndpoint}
          />
        </div>
      </div>

      <AddMachineDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        machineType="cnc"
      />
    </div>
  );
};
