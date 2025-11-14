
import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { CNCVisualization } from './CNCVisualization';
import { ControlPanel } from './ControlPanel';
import { CNCFilters } from './CNCFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddMachineDialog } from './AddMachineDialog';

export const CNCControlSystem = ({ projectId }: { projectId?: string }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [cncParams, setCncParams] = useState({});
  
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
            <h1 className="text-2xl font-bold">CNC Control System</h1>
            <p className="text-muted-foreground">Monitor and control CNC machining operations</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add CNC Machine
          </Button>
        </div>

        <StatusCards machineType="cnc" />

        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-280px)] rounded-lg border">
          {/* Left Panel - Machine List */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <CNCFilters
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
                machineType="cnc"
                projectId={projectId}
                externalFilters={{
                  searchTerm,
                  status: statusFilter,
                  manufacturer: manufacturerFilter
                }}
                hideFilters={true}
                onMachinesLoaded={(machines) => {
                  if (machines.length > 0 && !selectedMachine) {
                    setSelectedMachine(machines[0].id);
                  }
                }}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Panel - 2D Visualization and Endpoint Manager */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <CNCVisualization 
                selectedMachineId={selectedMachine}
                selectedEndpoint={selectedEndpoint}
                cncParams={cncParams}
                onEndpointSelect={setSelectedEndpoint}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Control Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 overflow-y-auto">
              <ControlPanel 
                selectedMachineId={selectedMachine}
                onParametersChange={setCncParams}
                selectedEndpoint={selectedEndpoint}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <AddMachineDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        machineType="cnc"
        projectId={projectId}
      />
    </div>
  );
};
