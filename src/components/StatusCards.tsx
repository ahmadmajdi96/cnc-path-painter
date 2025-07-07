
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const StatusCards = () => {
  const statusData = [
    {
      label: 'Total Machines',
      value: '4',
      icon: '🔧',
      color: 'blue'
    },
    {
      label: 'Active',
      value: '2',
      icon: '⚡',
      color: 'green'
    },
    {
      label: 'Connected',
      value: '3',
      icon: '📡',
      color: 'blue'
    },
    {
      label: 'Errors',
      value: '0',
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
