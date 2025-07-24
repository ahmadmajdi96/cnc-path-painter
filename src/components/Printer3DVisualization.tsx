
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EndpointManager } from './EndpointManager';

interface Printer3DVisualizationProps {
  selectedMachineId?: string;
  selectedEndpoint?: string;
  printerParams?: any;
  onEndpointSelect?: (endpoint: string) => void;
}

export const Printer3DVisualization = ({ 
  selectedMachineId,
  selectedEndpoint,
  printerParams,
  onEndpointSelect 
}: Printer3DVisualizationProps) => {
  // Fetch machine data query
  const { data: machineData, isLoading } = useQuery({
    queryKey: ['3d_printer', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      
      const { data, error } = await supabase
        .from('3d_printers')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMachineId
  });

  if (!selectedMachineId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Select a 3D printer to view visualization</p>
        </div>
        <EndpointManager 
          selectedMachineId={selectedMachineId}
          onEndpointSelect={onEndpointSelect || (() => {})}
          selectedEndpoint={selectedEndpoint || ''}
          machineType="3d_printer"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Loading 3D printer data...</p>
        </div>
        <EndpointManager 
          selectedMachineId={selectedMachineId}
          onEndpointSelect={onEndpointSelect || (() => {})}
          selectedEndpoint={selectedEndpoint || ''}
          machineType="3d_printer"
        />
      </div>
    );
  }

  if (!machineData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">3D printer not found</p>
        </div>
        <EndpointManager 
          selectedMachineId={selectedMachineId}
          onEndpointSelect={onEndpointSelect || (() => {})}
          selectedEndpoint={selectedEndpoint || ''}
          machineType="3d_printer"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded"></div>
          </div>
          <h3 className="font-semibold text-gray-900">{machineData.name}</h3>
          <p className="text-sm text-gray-500">{machineData.model}</p>
          <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs inline-block">
            {machineData.status}
          </div>
          {machineData.max_build_volume_x && (
            <p className="text-xs text-gray-400 mt-1">
              Build Volume: {machineData.max_build_volume_x}×{machineData.max_build_volume_y}×{machineData.max_build_volume_z}mm
            </p>
          )}
          {selectedEndpoint && (
            <p className="text-xs text-blue-500 mt-1">Connected to: {selectedEndpoint}</p>
          )}
        </div>
      </div>
      
      <EndpointManager 
        selectedMachineId={selectedMachineId}
        onEndpointSelect={onEndpointSelect || (() => {})}
        selectedEndpoint={selectedEndpoint || ''}
        machineType="3d_printer"
      />
    </div>
  );
};
