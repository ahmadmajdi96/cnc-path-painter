
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Machine {
  id: string;
  name: string;
  model: string;
  status: 'active' | 'idle' | 'offline';
  workArea: string;
  spindle: string;
  feedRate: string;
}

export const MachineList = () => {
  const [selectedMachine, setSelectedMachine] = useState<string>('cnc-001');
  
  const machines: Machine[] = [
    {
      id: 'cnc-001',
      name: 'Precision Miller CNC',
      model: 'HAAS VF-2SS',
      status: 'active',
      workArea: '762x406mm',
      spindle: '15000 RPM',
      feedRate: '1016 mm/min'
    },
    {
      id: 'cnc-002',
      name: 'Heavy Duty Router',
      model: 'FANUC 0i-MF',
      status: 'idle',
      workArea: '1200x800mm',
      spindle: '24000 RPM',
      feedRate: '2000 mm/min'
    },
    {
      id: 'cnc-003',
      name: 'Plasma Cutter CNC',
      model: 'HYPERTHERM XPR300',
      status: 'active',
      workArea: '1500x3000mm',
      spindle: 'N/A',
      feedRate: '12000 mm/min'
    },
    {
      id: 'cnc-004',
      name: 'Lathe CNC',
      model: 'MAZAK QT-250MSY',
      status: 'offline',
      workArea: 'Ø254x330mm',
      spindle: '5000 RPM',
      feedRate: '500 mm/min'
    }
  ];

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Machines</h3>
        <div className="flex gap-2 mb-4">
          <Select defaultValue="all">
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mill">Mill</SelectItem>
              <SelectItem value="router">Router</SelectItem>
              <SelectItem value="plasma">Plasma</SelectItem>
              <SelectItem value="lathe">Lathe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedMachine === machine.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMachine(machine.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{machine.name}</h4>
              <Badge className={getStatusColor(machine.status)}>
                {machine.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">Model: {machine.model}</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Work Area: {machine.workArea}</div>
              <div>Spindle: {machine.spindle}</div>
              <div>Feed Rate: {machine.feedRate}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
