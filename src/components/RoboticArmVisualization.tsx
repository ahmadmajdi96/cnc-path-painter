
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EndpointManager } from './EndpointManager';
import { RoboticArm3DViewer } from './RoboticArm3DViewer';

interface RoboticArmData {
  id: string;
  name: string;
  model: string;
  manufacturer?: string;
  status: string;
  endpoint_url?: string;
  ip_address?: string;
  port?: number;
  protocol?: string;
  joints: number;
  degrees_of_freedom: number;
  max_payload: number;
  max_reach: number;
  created_at: string;
  updated_at: string;
}

interface RoboticArmVisualizationProps {
  selectedMachineId?: string;
  selectedEndpoint?: string;
  roboticArmParams?: any;
  onEndpointSelect?: (endpoint: string) => void;
}

export const RoboticArmVisualization = ({ 
  selectedMachineId,
  selectedEndpoint,
  roboticArmParams,
  onEndpointSelect 
}: RoboticArmVisualizationProps) => {
  // Fetch machine data query
  const { data: machineData, isLoading } = useQuery({
    queryKey: ['robotic_arms', selectedMachineId],
    queryFn: async (): Promise<RoboticArmData | null> => {
      if (!selectedMachineId) return null;
      
      const { data, error } = await supabase
        .from('robotic_arms')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      
      if (error) throw error;
      return data as RoboticArmData;
    },
    enabled: !!selectedMachineId
  });

  if (!selectedMachineId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Select a robotic arm to view visualization</p>
        </div>
        <EndpointManager 
          selectedMachineId={selectedMachineId}
          onEndpointSelect={onEndpointSelect || (() => {})}
          selectedEndpoint={selectedEndpoint || ''}
          machineType="cnc"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Loading robotic arm data...</p>
        </div>
        <EndpointManager 
          selectedMachineId={selectedMachineId}
          onEndpointSelect={onEndpointSelect || (() => {})}
          selectedEndpoint={selectedEndpoint || ''}
          machineType="cnc"
        />
      </div>
    );
  }

  if (!machineData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Robotic arm not found</p>
        </div>
        <EndpointManager 
          selectedMachineId={selectedMachineId}
          onEndpointSelect={onEndpointSelect || (() => {})}
          selectedEndpoint={selectedEndpoint || ''}
          machineType="cnc"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoboticArm3DViewer 
        joints={machineData.joints}
        maxReach={machineData.max_reach}
        maxPayload={machineData.max_payload}
        selectedMachineId={selectedMachineId}
        selectedEndpoint={selectedEndpoint}
        roboticArmParams={roboticArmParams}
      />
      
      <EndpointManager 
        selectedMachineId={selectedMachineId}
        onEndpointSelect={onEndpointSelect || (() => {})}
        selectedEndpoint={selectedEndpoint || ''}
        machineType="cnc"
      />
    </div>
  );
};
