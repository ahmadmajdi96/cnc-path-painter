
import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { MainNavigation } from '@/components/MainNavigation';
import { StatusCards } from '@/components/StatusCards';
import { ConveyorBeltList } from '@/components/ConveyorBeltList';
import { ConveyorBeltFilters } from '@/components/ConveyorBeltFilters';
import { ConveyorBeltVisualization } from '@/components/ConveyorBeltVisualization';
import { ConveyorBeltControlPanel } from '@/components/ConveyorBeltControlPanel';
import { ConveyorEndpointManager } from '@/components/ConveyorEndpointManager';

interface ConveyorBelt {
  id: string;
  name: string;
  type: 'flat' | 'modular' | 'cleated' | 'inclined' | 'curved' | 'roller';
  status: 'running' | 'idle' | 'error' | 'maintenance';
  speed: number; // m/min
  length: number; // meters
  width: number; // meters
  load: number; // kg
  maxCapacity: number; // kg
  direction: 'forward' | 'reverse' | 'stopped';
  motor: {
    power: number; // kW
    voltage: number; // V
    current: number; // A
    temperature: number; // °C
  };
  sensors: {
    photoelectric: boolean;
    proximity: boolean;
    loadCell: boolean;
    encoder: boolean;
  };
  location: string;
  manufacturer: string;
  model: string;
  installDate: string;
}

interface ConveyorEndpoint {
  id: string;
  name: string;
  url: string;
  type: string;
  status: 'active' | 'inactive';
  systemId: string;
}

export const ConveyorBeltControlSystem = () => {
  const [conveyorBelts, setConveyorBelts] = useState<ConveyorBelt[]>([
    {
      id: 'cb-001',
      name: 'Main Assembly Line',
      type: 'flat',
      status: 'running',
      speed: 15,
      length: 50,
      width: 0.8,
      load: 450,
      maxCapacity: 500,
      direction: 'forward',
      motor: {
        power: 5.5,
        voltage: 380,
        current: 12.5,
        temperature: 65
      },
      sensors: {
        photoelectric: true,
        proximity: true,
        loadCell: true,
        encoder: true
      },
      location: 'Production Hall A',
      manufacturer: 'FlexMove Systems',
      model: 'FM-5000',
      installDate: '2023-01-15'
    },
    {
      id: 'cb-002',
      name: 'Packaging Line',
      type: 'modular',
      status: 'idle',
      speed: 0,
      length: 25,
      width: 0.6,
      load: 0,
      maxCapacity: 300,
      direction: 'stopped',
      motor: {
        power: 3.0,
        voltage: 380,
        current: 0,
        temperature: 25
      },
      sensors: {
        photoelectric: true,
        proximity: false,
        loadCell: true,
        encoder: true
      },
      location: 'Packaging Area',
      manufacturer: 'ConveyTech Pro',
      model: 'CTP-3000M',
      installDate: '2023-03-20'
    },
    {
      id: 'cb-003',
      name: 'Incline Feeder',
      type: 'inclined',
      status: 'running',
      speed: 8,
      length: 12,
      width: 0.5,
      load: 120,
      maxCapacity: 200,
      direction: 'forward',
      motor: {
        power: 2.2,
        voltage: 380,
        current: 6.8,
        temperature: 58
      },
      sensors: {
        photoelectric: true,
        proximity: true,
        loadCell: false,
        encoder: true
      },
      location: 'Storage Area',
      manufacturer: 'UpLift Conveyors',
      model: 'UL-2200I',
      installDate: '2023-02-10'
    }
  ]);

  const [endpoints, setEndpoints] = useState<ConveyorEndpoint[]>([
    {
      id: 'ep-001',
      name: 'Speed Control',
      url: 'http://192.168.1.100:8080/speed',
      type: 'control',
      status: 'active',
      systemId: 'cb-001'
    },
    {
      id: 'ep-002',
      name: 'Status Monitor',
      url: 'http://192.168.1.100:8080/status',
      type: 'monitoring',
      status: 'active',
      systemId: 'cb-001'
    }
  ]);

  const [selectedBelt, setSelectedBelt] = useState<ConveyorBelt | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    if (conveyorBelts.length > 0 && !selectedBelt) {
      setSelectedBelt(conveyorBelts[0]);
    }
  }, [conveyorBelts, selectedBelt]);

  const filteredBelts = conveyorBelts.filter(belt => {
    const matchesSearch = belt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         belt.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         belt.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || belt.status === statusFilter;
    const matchesType = !typeFilter || belt.type === typeFilter;
    const matchesLocation = !locationFilter || belt.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType && matchesLocation;
  });

  const handleBeltSelect = (belt: ConveyorBelt) => {
    setSelectedBelt(belt);
  };

  const handleBeltAdd = (newBelt: Omit<ConveyorBelt, 'id'>) => {
    const belt: ConveyorBelt = {
      ...newBelt,
      id: `cb-${Date.now()}`
    };
    setConveyorBelts([...conveyorBelts, belt]);
  };

  const handleBeltEdit = (id: string, updatedBelt: Omit<ConveyorBelt, 'id'>) => {
    setConveyorBelts(belts =>
      belts.map(belt =>
        belt.id === id ? { ...updatedBelt, id } : belt
      )
    );
    if (selectedBelt?.id === id) {
      setSelectedBelt({ ...updatedBelt, id });
    }
  };

  const handleBeltDelete = (id: string) => {
    setConveyorBelts(belts => belts.filter(belt => belt.id !== id));
    if (selectedBelt?.id === id) {
      setSelectedBelt(conveyorBelts.find(belt => belt.id !== id) || null);
    }
  };

  const handleEndpointAdd = (endpoint: Omit<ConveyorEndpoint, 'id'>) => {
    setEndpoints([...endpoints, { ...endpoint, id: `ep-${Date.now()}` }]);
  };

  const handleEndpointEdit = (id: string, endpoint: Omit<ConveyorEndpoint, 'id'>) => {
    setEndpoints(eps => eps.map(ep => ep.id === id ? { ...endpoint, id } : ep));
  };

  const handleEndpointDelete = (id: string) => {
    setEndpoints(eps => eps.filter(ep => ep.id !== id));
  };

  const handleSpeedChange = (speed: number) => {
    if (selectedBelt) {
      const updatedBelt = {
        ...selectedBelt,
        speed,
        status: speed > 0 ? 'running' as const : 'idle' as const,
        direction: speed > 0 ? 'forward' as const : 'stopped' as const,
        motor: {
          ...selectedBelt.motor,
          current: speed > 0 ? selectedBelt.motor.power * 2.5 : 0,
          temperature: speed > 0 ? 45 + (speed / 20) * 30 : 25
        }
      };
      setSelectedBelt(updatedBelt);
      handleBeltEdit(selectedBelt.id, updatedBelt);
    }
  };

  const handleDirectionChange = (direction: 'forward' | 'reverse' | 'stopped') => {
    if (selectedBelt) {
      const updatedBelt = {
        ...selectedBelt,
        direction,
        status: direction === 'stopped' ? 'idle' as const : 'running' as const,
        speed: direction === 'stopped' ? 0 : selectedBelt.speed || 10
      };
      setSelectedBelt(updatedBelt);
      handleBeltEdit(selectedBelt.id, updatedBelt);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conveyor Belt Control System</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and control conveyor belt operations with real-time visualization
            </p>
          </div>
        </div>

        <StatusCards machineType="cnc" />

        <ResizablePanelGroup direction="horizontal" className="min-h-[800px]">
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="space-y-4 pr-4">
              <ConveyorBeltFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                locationFilter={locationFilter}
                onLocationFilterChange={setLocationFilter}
              />
              
              <ConveyorBeltList
                conveyorBelts={filteredBelts}
                selectedBelt={selectedBelt}
                onBeltSelect={handleBeltSelect}
                onBeltAdd={handleBeltAdd}
                onBeltEdit={handleBeltEdit}
                onBeltDelete={handleBeltDelete}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={35}>
            <div className="space-y-4 px-4">
              <ConveyorBeltVisualization
                conveyorBelt={selectedBelt}
                onSpeedChange={handleSpeedChange}
                onDirectionChange={handleDirectionChange}
              />
              
              <ConveyorEndpointManager
                selectedSystemId={selectedBelt?.id}
                endpoints={endpoints}
                selectedEndpoint={selectedEndpoint}
                onEndpointSelect={setSelectedEndpoint}
                onAddEndpoint={handleEndpointAdd}
                onEditEndpoint={handleEndpointEdit}
                onDeleteEndpoint={handleEndpointDelete}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="pl-4">
              <ConveyorBeltControlPanel
                conveyorBelt={selectedBelt}
                onSpeedChange={handleSpeedChange}
                onDirectionChange={handleDirectionChange}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
