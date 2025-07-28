
import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Metric } from './Metric';

interface StatusCardsProps {
  machineType: 'cnc' | 'laser' | '3d_printer' | 'robotic_arms';
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
  const idleMachines = machines.filter(m => m.status === 'idle').length;
  const errorMachines = machines.filter(m => m.status === 'error').length;
  const maintenanceMachines = machines.filter(m => m.status === 'maintenance').length;

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
      default:
        return 'Machine';
    }
  };

  const machineTypeDisplay = getMachineTypeDisplay();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Total {machineTypeDisplay} Machines</h3>
        <p className="text-xs text-gray-500 mb-2">Total number of {machineType.replace('_', ' ')} machines</p>
        <Metric value={totalMachines.toString()} delta="+5% vs last month" />
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Running {machineTypeDisplay} Machines</h3>
        <p className="text-xs text-gray-500 mb-2">Number of machines currently running</p>
        <Metric value={runningMachines.toString()} delta="+10% vs last month" />
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Idle {machineTypeDisplay} Machines</h3>
        <p className="text-xs text-gray-500 mb-2">Number of machines currently idle</p>
        <Metric value={idleMachines.toString()} delta="-3% vs last month" />
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Error {machineTypeDisplay} Machines</h3>
        <p className="text-xs text-gray-500 mb-2">Number of machines with errors</p>
        <Metric value={errorMachines.toString()} delta="+15% vs last month" />
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Maintenance {machineTypeDisplay} Machines</h3>
        <p className="text-xs text-gray-500 mb-2">Number of machines under maintenance</p>
        <Metric value={maintenanceMachines.toString()} delta="+2% vs last month" />
      </Card>
    </div>
  );
};
