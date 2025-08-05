
import React, { useState, useEffect } from 'react';
import { StatusCards } from './StatusCards';
import { MachineList } from './MachineList';
import { VisionSystemViewer } from './VisionSystemViewer';
import { VisionControlPanel } from './VisionControlPanel';
import { VisionSystemManager } from './VisionSystemManager';
import { ImageGallery } from './ImageGallery';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddVisionSystemDialog } from './AddVisionSystemDialog';
import { MainNavigation } from './MainNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VisionSystem {
  id: string;
  name: string;
  endpoint: string;
  cameraType: string;
  resolution: string;
  status: 'online' | 'offline';
}

interface SavedImage {
  id: string;
  url: string;
  name: string;
  timestamp: Date;
  filters?: any;
}

export const VisionSystemControlSystem = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageFilters, setImageFilters] = useState({});
  
  // Vision systems management
  const [visionSystems, setVisionSystems] = useState<VisionSystem[]>([
    {
      id: '1',
      name: 'Main Inspection Camera',
      endpoint: 'http://192.168.1.100:8080',
      cameraType: 'Industrial CCD',
      resolution: '1920x1080',
      status: 'online'
    }
  ]);

  // Image gallery
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);

  // Clear endpoint when machine changes
  useEffect(() => {
    setSelectedEndpoint('');
    setCurrentImage(null);
    setProcessedImage(null);
  }, [selectedMachine]);

  const handleAddVisionSystem = (systemData: Omit<VisionSystem, 'id' | 'status'>) => {
    const newSystem: VisionSystem = {
      ...systemData,
      id: Date.now().toString(),
      status: 'online'
    };
    setVisionSystems(prev => [...prev, newSystem]);
  };

  const handleEditVisionSystem = (id: string, systemData: Omit<VisionSystem, 'id' | 'status'>) => {
    setVisionSystems(prev => prev.map(system => 
      system.id === id ? { ...system, ...systemData } : system
    ));
  };

  const handleDeleteVisionSystem = (id: string) => {
    setVisionSystems(prev => prev.filter(system => system.id !== id));
    if (selectedMachine === id) {
      setSelectedMachine('');
    }
  };

  const handleSaveImage = (image: SavedImage) => {
    setSavedImages(prev => [image, ...prev]);
  };

  const handleDeleteImage = (id: string) => {
    setSavedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDownloadImage = (image: SavedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${image.name}.png`;
    link.click();
  };

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
        {/* Left Sidebar - Machine List and System Management */}
        <div className="w-80 flex-shrink-0 space-y-6">
          <MachineList 
            selectedMachine={selectedMachine}
            onMachineSelect={setSelectedMachine}
            machineType="laser"
          />
          
          <VisionSystemManager
            visionSystems={visionSystems}
            onAddSystem={handleAddVisionSystem}
            onEditSystem={handleEditVisionSystem}
            onDeleteSystem={handleDeleteVisionSystem}
          />
        </div>

        {/* Center - Image Viewer and Processing */}
        <div className="flex-1 min-w-0">
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

        {/* Right Sidebar - Control Panel and Gallery */}
        <div className="w-96 flex-shrink-0">
          <Tabs defaultValue="control" className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="control">Control</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="control" className="mt-0">
              <VisionControlPanel 
                selectedMachineId={selectedMachine}
                selectedEndpoint={selectedEndpoint}
                currentImage={processedImage || currentImage}
                onFiltersChange={setImageFilters}
                onImageProcessed={setProcessedImage}
                savedImages={savedImages}
                onSaveImage={handleSaveImage}
              />
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-0">
              <ImageGallery
                savedImages={savedImages}
                onDeleteImage={handleDeleteImage}
                onDownloadImage={handleDownloadImage}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddVisionSystemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
};
