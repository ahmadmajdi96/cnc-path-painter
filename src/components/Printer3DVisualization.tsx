
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EndpointManager } from './EndpointManager';
import { Model3DViewer } from './Model3DViewer';

interface Printer3DData {
  id: string;
  name: string;
  model: string;
  manufacturer?: string;
  status: string;
  endpoint_url?: string;
  ip_address?: string;
  port?: number;
  protocol?: string;
  max_build_volume_x?: number;
  max_build_volume_y?: number;
  max_build_volume_z?: number;
  nozzle_diameter?: number;
  max_hotend_temp?: number;
  max_bed_temp?: number;
  created_at: string;
  updated_at: string;
}

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
  // Fetch machine data query with proper typing
  const { data: machineData, isLoading } = useQuery({
    queryKey: ['3d_printer', selectedMachineId],
    queryFn: async (): Promise<Printer3DData | null> => {
      if (!selectedMachineId) return null;
      
      // Use any type to bypass TypeScript checking for the table name
      const { data, error } = await (supabase as any)
        .from('printer_3d')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      
      if (error) throw error;
      return data as Printer3DData;
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
      <Model3DViewer 
        buildVolumeX={machineData.max_build_volume_x || 200}
        buildVolumeY={machineData.max_build_volume_y || 200}
        buildVolumeZ={machineData.max_build_volume_z || 200}
        selectedMachineId={selectedMachineId}
        selectedEndpoint={selectedEndpoint}
      />
      
      <EndpointManager 
        selectedMachineId={selectedMachineId}
        onEndpointSelect={onEndpointSelect || (() => {})}
        selectedEndpoint={selectedEndpoint || ''}
        machineType="3d_printer"
      />
    </div>
  );
};
