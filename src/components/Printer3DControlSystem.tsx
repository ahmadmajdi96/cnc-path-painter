
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer3DControlPanel } from './Printer3DControlPanel';
import { Printer3DVisualization } from './Printer3DVisualization';
import { Printer3DFileManager } from './Printer3DFileManager';

export const Printer3DControlSystem = () => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [printerParams, setPrinterParams] = useState<any>(null);

  // Fetch 3D printers
  const { data: printers, isLoading } = useQuery({
    queryKey: ['printer_3d'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('printer_3d')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const selectedMachine = printers?.find(printer => printer.id === selectedMachineId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">3D Printer Control System</h1>
        
        {/* Machine Selection */}
        <Card className="p-6 mb-6 bg-white border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select 3D Printer
              </label>
              <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a 3D printer..." />
                </SelectTrigger>
                <SelectContent>
                  {printers?.map((printer) => (
                    <SelectItem key={printer.id} value={printer.id}>
                      {printer.name} - {printer.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedMachine && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine Details
                </label>
                <div className="text-sm text-gray-600">
                  <p>Model: {selectedMachine.model}</p>
                  <p>Build Volume: {selectedMachine.max_build_volume_x}×{selectedMachine.max_build_volume_y}×{selectedMachine.max_build_volume_z}mm</p>
                  <p>Nozzle: {selectedMachine.nozzle_diameter}mm</p>
                  <p>Max Hotend: {selectedMachine.max_hotend_temp}°C</p>
                  <p>Max Bed: {selectedMachine.max_bed_temp}°C</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {selectedMachineId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="lg:col-span-1">
              <Printer3DControlPanel 
                selectedMachineId={selectedMachineId}
                selectedEndpoint={selectedEndpoint}
                onParametersChange={setPrinterParams}
              />
            </div>

            {/* Visualization */}
            <div className="lg:col-span-2 space-y-6">
              <Printer3DVisualization 
                selectedMachineId={selectedMachineId}
                selectedEndpoint={selectedEndpoint}
                printerParams={printerParams}
                onEndpointSelect={setSelectedEndpoint}
              />
              
              {/* File Manager */}
              <Printer3DFileManager 
                selectedMachineId={selectedMachineId}
                selectedEndpoint={selectedEndpoint}
              />
            </div>
          </div>
        )}

        {!selectedMachineId && (
          <Card className="p-12 bg-white border border-gray-200">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                {isLoading ? 'Loading 3D printers...' : 'Select a 3D printer to begin'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
