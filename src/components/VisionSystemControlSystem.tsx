import React, { useState, useEffect, useMemo } from 'react';
import { StatusCards } from './StatusCards';
import { VisionSystemList } from './VisionSystemList';
import { VisionSystemViewer } from './VisionSystemViewer';
import { VisionControlPanel } from './VisionControlPanel';
import { VisionSystemManager } from './VisionSystemManager';
import { VisionSystemFilters } from './VisionSystemFilters';
import { VisionEndpointManager } from './VisionEndpointManager';
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
      id: '1',
      name: 'Main Inspection Camera',
      endpoint: 'http://192.168.1.100:8080',
      cameraType: 'Industrial CCD',
      resolution: '1920x1080',
      status: 'online'
    },
    {
      id: '2',
      name: 'Quality Control Camera',
      endpoint: 'http://192.168.1.101:8080',
      cameraType: 'CMOS Sensor',
      resolution: '2592x1944',
      status: 'online'
    }
  ]);

  // Endpoints management
  const [endpoints, setEndpoints] = useState<VisionEndpoint[]>([
    {
      id: '1',
      name: 'Capture Endpoint',
      url: 'http://192.168.1.100:8080/capture',
      type: 'capture',
      status: 'active',
      systemId: '1'
    },
    {
      id: '2',
      name: 'Stream Endpoint',
      url: 'http://192.168.1.100:8080/stream',
      type: 'stream',
      status: 'active',
      systemId: '1'
    },
    {
      id: '3',
      name: 'Capture Endpoint',
      url: 'http://192.168.1.101:8080/capture',
      type: 'capture',
      status: 'active',
      systemId: '2'
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
    setEndpoints(prev => prev.filter(ep => ep.systemId !== id));
    setSavedImages(prev => prev.filter(img => img.systemId !== id));
    if (selectedSystem === id) {
      setSelectedSystem('');
    }
  };

  const handleAddEndpoint = (endpointData: Omit<VisionEndpoint, 'id'>) => {
    const newEndpoint: VisionEndpoint = {
      ...endpointData,
      id: Date.now().toString()
    };
    setEndpoints(prev => [...prev, newEndpoint]);
  };

  const handleEditEndpoint = (id: string, endpointData: Omit<VisionEndpoint, 'id'>) => {
    setEndpoints(prev => prev.map(endpoint => 
      endpoint.id === id ? { ...endpoint, ...endpointData } : endpoint
    ));
  };

  const handleDeleteEndpoint = (id: string) => {
    setEndpoints(prev => prev.filter(endpoint => endpoint.id !== id));
    const deletedEndpoint = endpoints.find(ep => ep.id === id);
    if (deletedEndpoint && selectedEndpoint === deletedEndpoint.url) {
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
        <StatusCards machineType="vision" />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6 flex gap-6 min-h-[calc(100vh-200px)]">
        {/* Left Sidebar - Combined Vision System Section */}
        <div className="w-80 flex-shrink-0 space-y-6">
          {/* Filters - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <VisionSystemFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
            />
          </div>
          
          {/* Combined Vision Systems Section */}
          <div className="space-y-4">
            <VisionSystemList 
              selectedSystem={selectedSystem}
              onSystemSelect={setSelectedSystem}
              visionSystems={filteredVisionSystems}
            />
            
            <VisionSystemManager
              visionSystems={visionSystems}
              onAddSystem={handleAddVisionSystem}
              onEditSystem={handleEditVisionSystem}
              onDeleteSystem={handleDeleteVisionSystem}
            />
          </div>
        </div>

        {/* Center - Image Viewer */}
        <div className="flex-1 min-w-0 space-y-6">
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

          {/* Endpoints and Gallery under Image Viewer */}
          <div className="grid grid-cols-2 gap-6">
            <VisionEndpointManager
              selectedSystemId={selectedSystem}
              endpoints={endpoints}
              selectedEndpoint={selectedEndpoint}
              onEndpointSelect={setSelectedEndpoint}
              onAddEndpoint={handleAddEndpoint}
              onEditEndpoint={handleEditEndpoint}
              onDeleteEndpoint={handleDeleteEndpoint}
            />

            <ImageGallery
              savedImages={savedImages.filter(img => img.systemId === selectedSystem)}
              onDeleteImage={handleDeleteImage}
              onDownloadImage={handleDownloadImage}
            />
          </div>
        </div>

        {/* Right Sidebar - Control Panel */}
        <div className="w-96 flex-shrink-0">
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
      </div>

      <AddVisionSystemDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onAddSystem={handleAddVisionSystem}
      />
    </div>
  );
};
