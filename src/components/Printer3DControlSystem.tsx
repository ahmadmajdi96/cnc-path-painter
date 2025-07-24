
import React, { useState, useEffect } from 'react';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { Printer3DVisualization } from './Printer3DVisualization';
import { Printer3DControlPanel } from './Printer3DControlPanel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddMachineDialog } from './AddMachineDialog';
import { MainNavigation } from './MainNavigation';

export const Printer3DControlSystem = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [printerParams, setPrinterParams] = useState({});

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
            <h1 className="text-2xl font-bold text-gray-900">3D Printer Control System</h1>
            <p className="text-gray-600">Monitor and control 3D printing operations</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add 3D Printer
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="px-6 py-4">
        <StatusCards />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6 flex gap-6 min-h-[calc(100vh-200px)]">
        {/* Left Sidebar - Machine List */}
        <div className="w-80 flex-shrink-0">
          <MachineList 
            selectedMachine={selectedMachine}
            onMachineSelect={setSelectedMachine}
            machineType="3d_printer"
          />
        </div>

        {/* Center - 3D Visualization and Endpoint Manager */}
        <div className="flex-1 min-w-0 space-y-6">
          <Printer3DVisualization 
            selectedMachineId={selectedMachine}
            selectedEndpoint={selectedEndpoint}
            printerParams={printerParams}
            onEndpointSelect={setSelectedEndpoint}
          />
        </div>

        {/* Right Sidebar - Control Panel */}
        <div className="w-96 flex-shrink-0">
          <Printer3DControlPanel 
            selectedMachineId={selectedMachine}
            onParametersChange={setPrinterParams}
            selectedEndpoint={selectedEndpoint}
          />
        </div>
      </div>

      <AddMachineDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        machineType="3d_printer"
      />
    </div>
  );
};
