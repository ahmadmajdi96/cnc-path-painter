
import React, { useState } from 'react';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { LaserVisualization } from './LaserVisualization';
import { LaserControlPanel } from './LaserControlPanel';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { AddMachineDialog } from './AddMachineDialog';
import { Link } from 'react-router-dom';

export const LaserControlSystem = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Laser Marking Control System</h1>
              <p className="text-gray-600">Monitor and control industrial laser marking machines</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline">
                Switch to CNC Control
              </Button>
            </Link>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Laser Machine
            </Button>
          </div>
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
          />
        </div>

        {/* Center - 2D Visualization (Full Width) */}
        <div className="flex-1 min-w-0">
          <LaserVisualization selectedMachineId={selectedMachine} />
        </div>

        {/* Right Sidebar - Control Panel */}
        <div className="w-80 flex-shrink-0">
          <LaserControlPanel />
        </div>
      </div>

      <AddMachineDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};
