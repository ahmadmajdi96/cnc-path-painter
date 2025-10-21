
import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { Printer3DVisualization } from './Printer3DVisualization';
import { Printer3DControlPanel } from './Printer3DControlPanel';
import { Printer3DFilters } from './Printer3DFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddMachineDialog } from './AddMachineDialog';

export const Printer3DControlSystem = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [printerParams, setPrinterParams] = useState({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('');

  // Clear endpoint when machine changes
  useEffect(() => {
    setSelectedEndpoint('');
  }, [selectedMachine]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">3D Printer Control System</h1>
            <p className="text-muted-foreground">Monitor and control 3D printing operations</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add 3D Printer
          </Button>
        </div>

        <StatusCards machineType="3d_printer" />

        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-280px)] rounded-lg border">
          {/* Left Panel - Machine List */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <Printer3DFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                manufacturerFilter={manufacturerFilter}
                onManufacturerChange={setManufacturerFilter}
              />
              
              <MachineList 
                selectedMachine={selectedMachine}
                onMachineSelect={setSelectedMachine}
                machineType="3d_printer"
                externalFilters={{
                  searchTerm,
                  status: statusFilter,
                  manufacturer: manufacturerFilter
                }}
                hideFilters={true}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Panel - 3D Visualization and Endpoint Manager */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <Printer3DVisualization 
                selectedMachineId={selectedMachine}
                selectedEndpoint={selectedEndpoint}
                printerParams={printerParams}
                onEndpointSelect={setSelectedEndpoint}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Control Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 overflow-y-auto">
              <Printer3DControlPanel 
                selectedMachineId={selectedMachine}
                onParametersChange={setPrinterParams}
                selectedEndpoint={selectedEndpoint}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <AddMachineDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        machineType="3d_printer"
      />
    </div>
  );
};
