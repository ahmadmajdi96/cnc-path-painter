
import React, { useState, useEffect } from 'react';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { VisionSystemViewer } from './VisionSystemViewer';
import { VisionControlPanel } from './VisionControlPanel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddVisionSystemDialog } from './AddVisionSystemDialog';
import { MainNavigation } from './MainNavigation';

export const VisionSystemControlSystem = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageFilters, setImageFilters] = useState({});

  // Clear endpoint when machine changes
  useEffect(() => {
    setSelectedEndpoint('');
    setCurrentImage(null);
    setProcessedImage(null);
  }, [selectedMachine]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vision System Control</h1>
            <p className="text-gray-600">Industrial image processing and vision analysis</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vision System
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="px-6 py-4">
        <StatusCards machineType="laser" />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6 flex gap-6 min-h-[calc(100vh-200px)]">
        {/* Left Sidebar - Machine List */}
        <div className="w-80 flex-shrink-0">
          <MachineList 
            selectedMachine={selectedMachine}
            onMachineSelect={setSelectedMachine}
            machineType="laser"
          />
        </div>

        {/* Center - Image Viewer and Processing */}
        <div className="flex-1 min-w-0 space-y-6">
          <VisionSystemViewer 
            selectedMachineId={selectedMachine}
            selectedEndpoint={selectedEndpoint}
            currentImage={currentImage}
            processedImage={processedImage}
            onEndpointSelect={setSelectedEndpoint}
            onImageReceived={setCurrentImage}
            onImageProcessed={setProcessedImage}
            imageFilters={imageFilters}
          />
        </div>

        {/* Right Sidebar - Control Panel */}
        <div className="w-96 flex-shrink-0">
          <VisionControlPanel 
            selectedMachineId={selectedMachine}
            selectedEndpoint={selectedEndpoint}
            currentImage={currentImage}
            onFiltersChange={setImageFilters}
            onImageProcessed={setProcessedImage}
          />
        </div>
      </div>

      <AddVisionSystemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};
