
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Clock, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StatusCardsProps {
  machineType?: 'laser' | 'cnc' | '3d_printer';
}

export const StatusCards = ({ machineType }: StatusCardsProps) => {
  // Fetch laser machines data
  const { data: laserMachines = [] } = useQuery({
    queryKey: ['laser-machines-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laser_machines')
        .select('*');
      if (error) throw error;
      return data;
    },
    enabled: !machineType || machineType === 'laser'
  });

  // Fetch CNC machines data
  const { data: cncMachines = [] } = useQuery({
    queryKey: ['cnc-machines-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cnc_machines')
        .select('*');
      if (error) throw error;
      return data;
    },
    enabled: !machineType || machineType === 'cnc'
  });

  // Fetch 3D printer data
  const { data: printer3DMachines = [] } = useQuery({
    queryKey: ['3d-printer-machines-stats'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('printer_3d')
        .select('*');
      if (error) throw error;
      return data;
    },
    enabled: !machineType || machineType === '3d_printer'
  });

  // Filter machines based on type
  let machines = [];
  if (machineType === 'laser') {
    machines = laserMachines;
  } else if (machineType === 'cnc') {
    machines = cncMachines;
  } else if (machineType === '3d_printer') {
    machines = printer3DMachines;
  } else {
    // Show all machines if no specific type
    machines = [...laserMachines, ...cncMachines, ...printer3DMachines];
  }

  // Calculate statistics
  const totalMachines = machines.length;
  const activeMachines = machines.filter(m => m.status === 'running').length;
  const idleMachines = machines.filter(m => m.status === 'idle').length;
  const errorMachines = machines.filter(m => m.status === 'error').length;

  const stats = [
    {
      title: 'Total Machines',
      value: totalMachines,
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Active Machines',
      value: activeMachines,
      icon: Zap,
      color: 'text-green-600'
    },
    {
      title: 'Idle Machines',
      value: idleMachines,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Error Machines',
      value: errorMachines,
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
