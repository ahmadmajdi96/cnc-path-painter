
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MachineList } from './MachineList';
import { EndpointManager } from './EndpointManager';
import { Printer3DControlPanel } from './Printer3DControlPanel';
import { Printer3DVisualization } from './Printer3DVisualization';
import { AddMachineDialog } from './AddMachineDialog';

export const Printer3DControlSystem = () => {
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [printerParams, setPrinterParams] = useState({});

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">3D Printer Control</h1>
            <p className="text-gray-600 mt-1">Manage and control your 3D printing operations</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add 3D Printer
          </Button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <MachineList
              selectedMachine={selectedMachine}
              onMachineSelect={setSelectedMachine}
              machineType="3d_printer"
            />
            <EndpointManager
              selectedMachineId={selectedMachine}
              onEndpointSelect={setSelectedEndpoint}
              selectedEndpoint={selectedEndpoint}
              machineType="3d_printer"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white border border-gray-200 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">3D Printer Visualization</h2>
              </div>
              <Printer3DVisualization 
                selectedMachineId={selectedMachine}
                selectedEndpoint={selectedEndpoint}
                printerParams={printerParams}
                onEndpointSelect={setSelectedEndpoint}
              />
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <Printer3DControlPanel 
              selectedMachineId={selectedMachine}
              selectedEndpoint={selectedEndpoint}
              onParametersChange={setPrinterParams}
            />
          </div>
        </div>
      </div>

      <AddMachineDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        machineType="3d_printer"
      />
    </div>
  );
};
