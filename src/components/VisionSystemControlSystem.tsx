
import React, { useState, useEffect, useMemo } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { StatusCards } from './StatusCards';
import { VisionSystemList } from './VisionSystemList';
import { VisionSystemViewer } from './VisionSystemViewer';
import { VisionControlPanel } from './VisionControlPanel';
import { VisionSystemFilters } from './VisionSystemFilters';
import { VisionEndpointManager } from './VisionEndpointManager';
import { ImageGallery } from './ImageGallery';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddVisionSystemDialog } from './AddVisionSystemDialog';

interface VisionSystem {
  id: string;
  name: string;
  endpoint: string;
  cameraType: string;
  resolution: string;
  communicationType: 'low-latency' | 'http' | 'ftp' | 's3';
  status: 'online' | 'offline';
}

interface SavedImage {
  id: string;
  url: string;
  name: string;
  timestamp: Date;
  filters?: any;
  systemId: string;
}

interface VisionEndpoint {
  id: string;
  name: string;
  url: string;
  type: string;
  status: 'active' | 'inactive';
  systemId: string;
}

export const VisionSystemControlSystem = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageFilters, setImageFilters] = useState({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Vision systems management
  const [visionSystems, setVisionSystems] = useState<VisionSystem[]>([
    {
      id: 'vs-001',
      name: 'Main Inspection Camera',
      endpoint: 'http://192.168.1.100:8080',
      cameraType: 'Industrial CCD',
      resolution: '1920x1080',
      communicationType: 'low-latency',
      status: 'online'
    },
    {
      id: 'vs-002',
      name: 'Quality Control Camera',
      endpoint: 'http://192.168.1.101:8080',
      cameraType: 'CMOS Sensor',
      resolution: '2592x1944',
      communicationType: 'http',
      status: 'online'
    }
  ]);

  // Endpoints management - Using proper UUID format
  const [endpoints, setEndpoints] = useState<VisionEndpoint[]>([
    {
      id: 'ep-001',
      name: 'Capture Endpoint',
      url: 'http://192.168.1.100:8080/capture',
      type: 'capture',
      status: 'active',
      systemId: 'vs-001'
    },
    {
      id: 'ep-002',
      name: 'Stream Endpoint',
      url: 'http://192.168.1.100:8080/stream',
      type: 'stream',
      status: 'active',
      systemId: 'vs-001'
    },
    {
      id: 'ep-003',
      name: 'Capture Endpoint',
      url: 'http://192.168.1.101:8080/capture',
      type: 'capture',
      status: 'active',
      systemId: 'vs-002'
    }
  ]);

  // Image gallery
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);

  // Filtered vision systems
  const filteredVisionSystems = useMemo(() => {
    return visionSystems.filter(system => {
      const matchesSearch = system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           system.cameraType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || system.status === statusFilter;
      const matchesType = typeFilter === 'all' || system.cameraType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [visionSystems, searchTerm, statusFilter, typeFilter]);

  // Clear endpoint when system changes
  useEffect(() => {
    setSelectedEndpoint('');
    setCurrentImage(null);
    setProcessedImage(null);
  }, [selectedSystem]);

  // Set default endpoint when system is selected
  useEffect(() => {
    if (selectedSystem && !selectedEndpoint) {
      const systemEndpoints = endpoints.filter(ep => ep.systemId === selectedSystem && ep.status === 'active');
      if (systemEndpoints.length > 0) {
        setSelectedEndpoint(systemEndpoints[0].url);
      }
    }
  }, [selectedSystem, endpoints, selectedEndpoint]);

  const handleAddVisionSystem = (systemData: Omit<VisionSystem, 'id' | 'status'>) => {
    const newSystem: VisionSystem = {
      ...systemData,
      id: `vs-${Date.now()}`,
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
    setEndpoints(prev => prev.filter(ep => ep.systemId !== id));
    setSavedImages(prev => prev.filter(img => img.systemId !== id));
    if (selectedSystem === id) {
      setSelectedSystem('');
    }
  };

  const handleAddEndpoint = (endpoint: Omit<VisionEndpoint, 'id'>) => {
    const newEndpoint: VisionEndpoint = {
      ...endpoint,
      id: `ep-${Date.now()}`
    };
    setEndpoints(prev => [...prev, newEndpoint]);
  };

  const handleEditEndpoint = (id: string, endpoint: Omit<VisionEndpoint, 'id'>) => {
    setEndpoints(prev => prev.map(ep => 
      ep.id === id ? { ...ep, ...endpoint } : ep
    ));
  };

  const handleDeleteEndpoint = (id: string) => {
    setEndpoints(prev => prev.filter(ep => ep.id !== id));
    if (selectedEndpoint === endpoints.find(ep => ep.id === id)?.url) {
      setSelectedEndpoint('');
    }
  };

  const handleSaveImage = (image: Omit<SavedImage, 'systemId'>) => {
    if (!selectedSystem) return;
    
    const savedImage: SavedImage = {
      ...image,
      systemId: selectedSystem
    };
    setSavedImages(prev => [savedImage, ...prev]);
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

  const handleClearView = () => {
    setCurrentImage(null);
    setProcessedImage(null);
    setImageFilters({});
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vision System Control</h1>
            <p className="text-muted-foreground">Industrial image processing and vision analysis</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vision System
          </Button>
        </div>

        <StatusCards machineType="cnc" />

        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-280px)] rounded-lg border">
          {/* Left Panel - Vision System List */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <VisionSystemFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
              />
              
              <VisionSystemList 
                selectedSystem={selectedSystem}
                onSystemSelect={setSelectedSystem}
                visionSystems={filteredVisionSystems}
                onAddSystem={handleAddVisionSystem}
                onEditSystem={handleEditVisionSystem}
                onDeleteSystem={handleDeleteVisionSystem}
                allVisionSystems={visionSystems}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Panel - Image Viewer */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              <VisionSystemViewer 
                selectedSystemId={selectedSystem}
                selectedEndpoint={selectedEndpoint}
                currentImage={currentImage}
                processedImage={processedImage}
                onEndpointSelect={setSelectedEndpoint}
                onImageReceived={setCurrentImage}
                onImageProcessed={setProcessedImage}
                imageFilters={imageFilters}
                visionSystems={visionSystems}
                savedImages={savedImages}
                onClearView={handleClearView}
              />

              <ImageGallery
                savedImages={savedImages.filter(img => img.systemId === selectedSystem)}
                onDeleteImage={handleDeleteImage}
                onDownloadImage={handleDownloadImage}
              />
              
              <VisionEndpointManager
                selectedSystemId={selectedSystem}
                endpoints={endpoints}
                selectedEndpoint={selectedEndpoint}
                onEndpointSelect={setSelectedEndpoint}
                onAddEndpoint={handleAddEndpoint}
                onEditEndpoint={handleEditEndpoint}
                onDeleteEndpoint={handleDeleteEndpoint}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Control Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full p-4 overflow-y-auto">
              <VisionControlPanel 
                selectedSystemId={selectedSystem}
                selectedEndpoint={selectedEndpoint}
                currentImage={processedImage || currentImage}
                onFiltersChange={setImageFilters}
                onImageProcessed={setProcessedImage}
                savedImages={savedImages.filter(img => img.systemId === selectedSystem)}
                onSaveImage={handleSaveImage}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <AddVisionSystemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onAddSystem={handleAddVisionSystem}
      />
    </div>
  );
};
