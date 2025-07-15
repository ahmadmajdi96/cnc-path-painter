
import React from 'react';
import { Card } from '@/components/ui/card';
import { Wrench, Zap, Wifi, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const StatusCards = () => {
  // Fetch laser machines data
  const { data: laserMachines = [] } = useQuery({
    queryKey: ['laser-machines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laser_machines')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  // Calculate status counts
  const totalMachines = laserMachines.length;
  const activeMachines = laserMachines.filter(m => m.status === 'active').length;
  const connectedMachines = laserMachines.filter(m => m.endpoint_url && m.endpoint_url.trim() !== '').length;
  const errorMachines = laserMachines.filter(m => m.status === 'error').length;

  const statusCards = [
    {
      title: 'Total Machines',
      value: totalMachines,
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active',
      value: activeMachines,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Connected',
      value: connectedMachines,
      icon: Wifi,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Errors',
      value: errorMachines,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statusCards.map((card, index) => (
        <Card key={index} className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
