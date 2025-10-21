
import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { CNCVisualization } from './CNCVisualization';
import { LaserControlPanel } from './LaserControlPanel';
import { LaserMarkingFilters } from './LaserMarkingFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddMachineDialog } from './AddMachineDialog';

export const LaserMarkingControlSystem = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [laserParams, setLaserParams] = useState({});
  
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
            <h1 className="text-2xl font-bold">Laser Marking Control</h1>
            <p className="text-muted-foreground">Monitor and control laser marking operations</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Laser Machine
          </Button>
        </div>

        <StatusCards machineType="laser" />

        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-280px)] rounded-lg border">
          {/* Left Panel - Machine List */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <LaserMarkingFilters
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
                machineType="laser"
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

          {/* Center Panel - 2D Visualization and Endpoint Manager */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <CNCVisualization 
                selectedMachineId={selectedMachine}
                selectedEndpoint={selectedEndpoint}
                cncParams={laserParams}
                onEndpointSelect={setSelectedEndpoint}
                machineType="laser"
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Control Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 overflow-y-auto">
              <LaserControlPanel 
                selectedMachineId={selectedMachine}
                onParametersChange={setLaserParams}
                selectedEndpoint={selectedEndpoint}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <AddMachineDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        machineType="laser"
      />
    </div>
  );
};
