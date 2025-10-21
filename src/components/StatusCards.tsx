
import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Metric } from './Metric';

interface StatusCardsProps {
  machineType: 'cnc' | 'laser' | '3d_printer' | 'robotic_arms' | 'vision_systems';
}

export const StatusCards = ({ machineType }: StatusCardsProps) => {
  // Get the correct table name based on machine type
  const getTableName = () => {
    switch (machineType) {
      case 'cnc':
        return 'cnc_machines';
      case 'laser':
        return 'laser_machines';
      case '3d_printer':
        return 'printer_3d';
      case 'robotic_arms':
        return 'robotic_arms';
      case 'vision_systems':
        return 'vision_systems';
      default:
        return 'cnc_machines';
    }
  };

  const { data: machines = [] } = useQuery({
    queryKey: [`${machineType}_machines`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(getTableName())
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Calculate metrics based on machine data
  const totalMachines = machines.length;
  const runningMachines = machines.filter(m => m.status === 'running').length;
  const onlineMachines = machines.filter(m => m.status === 'online').length;
  const idleMachines = machines.filter(m => m.status === 'idle').length;
  const offlineMachines = machines.filter(m => m.status === 'offline').length;
  const errorMachines = machines.filter(m => m.status === 'error').length;
  const maintenanceMachines = machines.filter(m => m.status === 'maintenance').length;

  // For vision systems, use online/offline status
  const isVisionSystem = machineType === 'vision_systems';
  const activeCount = isVisionSystem ? onlineMachines : runningMachines;
  const inactiveCount = isVisionSystem ? offlineMachines : idleMachines;

  // Get machine type display name
  const getMachineTypeDisplay = () => {
    switch (machineType) {
      case 'cnc':
        return 'CNC';
      case 'laser':
        return 'Laser';
      case '3d_printer':
        return '3D Printer';
      case 'robotic_arms':
        return 'Robotic Arm';
      case 'vision_systems':
        return 'Vision System';
      default:
        return 'Machine';
    }
  };

  const machineTypeDisplay = getMachineTypeDisplay();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Total {machineTypeDisplay}s</h3>
        <p className="text-xs text-gray-500 mb-2">Total number of {machineType.replace('_', ' ')}s</p>
        <Metric value={totalMachines.toString()} delta="" />
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">{isVisionSystem ? 'Online' : 'Running'} {machineTypeDisplay}s</h3>
        <p className="text-xs text-gray-500 mb-2">Number of systems currently {isVisionSystem ? 'online' : 'running'}</p>
        <Metric value={activeCount.toString()} delta="" />
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">{isVisionSystem ? 'Offline' : 'Idle'} {machineTypeDisplay}s</h3>
        <p className="text-xs text-gray-500 mb-2">Number of systems currently {isVisionSystem ? 'offline' : 'idle'}</p>
        <Metric value={inactiveCount.toString()} delta="" />
      </Card>

      {!isVisionSystem && (
        <>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Error {machineTypeDisplay}s</h3>
            <p className="text-xs text-gray-500 mb-2">Number of machines with errors</p>
            <Metric value={errorMachines.toString()} delta="" />
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Maintenance {machineTypeDisplay}s</h3>
            <p className="text-xs text-gray-500 mb-2">Number of machines under maintenance</p>
            <Metric value={maintenanceMachines.toString()} delta="" />
          </Card>
        </>
      )}
    </div>
  );
};
