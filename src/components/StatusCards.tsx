import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Metric } from './Metric';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StatusCardsProps {
  machineType: 'cnc' | 'laser' | '3d_printer' | 'robotic_arms';
}

interface Machine {
  id: string;
  name: string;
  status: string;
}

export const StatusCards = ({ machineType }: StatusCardsProps) => {
  const getMachineQuery = () => {
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

  const { data: machines = [], isLoading } = useQuery({
    queryKey: [getMachineQuery()],
    queryFn: async () => {
      const tableName = getMachineQuery();
      console.log(`Fetching machines from table: ${tableName}`);
      
      let query: any;
      if (tableName === 'printer_3d') {
        query = (supabase as any).from(tableName).select('*');
      } else {
        query = supabase.from(tableName).select('*');
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      console.log(`Fetched ${data?.length || 0} machines from ${tableName}`);
      return data as Machine[];
    }
  });

  const totalMachines = machines?.length || 0;
  const runningMachines = machines?.filter(machine => machine.status === 'running').length || 0;
  const idleMachines = machines?.filter(machine => machine.status === 'idle').length || 0;
  const errorMachines = machines?.filter(machine => machine.status === 'error').length || 0;
  const maintenanceMachines = machines?.filter(machine => machine.status === 'maintenance').length || 0;

  const getMachineTypeLabel = () => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total {getMachineTypeLabel()} Machines</CardTitle>
          <CardDescription>Total number of {machineType} machines</CardDescription>
        </CardHeader>
        <CardContent>
          <Metric value={totalMachines.toString()} delta="+5% vs last month" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Running {getMachineTypeLabel()} Machines</CardTitle>
          <CardDescription>Number of machines currently running</CardDescription>
        </CardHeader>
        <CardContent>
          <Metric value={runningMachines.toString()} delta="+10% vs last month" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Idle {getMachineTypeLabel()} Machines</CardTitle>
          <CardDescription>Number of machines currently idle</CardDescription>
        </CardHeader>
        <CardContent>
          <Metric value={idleMachines.toString()} delta="-3% vs last month" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error {getMachineTypeLabel()} Machines</CardTitle>
          <CardDescription>Number of machines with errors</CardDescription>
        </CardHeader>
        <CardContent>
          <Metric value={errorMachines.toString()} delta="+15% vs last month" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance {getMachineTypeLabel()} Machines</CardTitle>
          <CardDescription>Number of machines under maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <Metric value={maintenanceMachines.toString()} delta="+2% vs last month" />
        </CardContent>
      </Card>
    </div>
  );
};
