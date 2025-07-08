
import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Machine = Tables<'cnc_machines'>;

export const StatusCards = () => {
  const { data: machines = [], isLoading } = useQuery({
    queryKey: ['cnc-machines-status'],
    queryFn: async () => {
      console.log('Fetching CNC machines for status cards...');
      const { data, error } = await supabase
        .from('cnc_machines')
        .select('*');
      
      if (error) {
        console.error('Error fetching machines:', error);
        throw error;
      }
      
      console.log('Fetched machines for status:', data);
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-4 bg-white border border-gray-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const totalMachines = machines.length;
  const activeMachines = machines.filter(m => m.status === 'active').length;
  const connectedMachines = machines.filter(m => m.ip_address && m.ip_address.trim() !== '').length;
  const errorMachines = machines.filter(m => m.status === 'offline' || m.status === 'error').length;

  const statusData = [
    {
      label: 'Total Machines',
      value: totalMachines.toString(),
      icon: '🔧',
      color: 'blue'
    },
    {
      label: 'Active',
      value: activeMachines.toString(),
      icon: '⚡',
      color: 'green'
    },
    {
      label: 'Connected',
      value: connectedMachines.toString(),
      icon: '📡',
      color: 'blue'
    },
    {
      label: 'Errors',
      value: errorMachines.toString(),
      icon: '⚠️',
      color: 'red'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {statusData.map((item, index) => (
        <Card key={index} className="p-4 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
            <div className="text-2xl">{item.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
};
