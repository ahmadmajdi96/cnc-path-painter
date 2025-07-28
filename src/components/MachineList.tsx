import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Edit2, Trash2, Plus, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EditMachineDialog } from './EditMachineDialog';

interface MachineListProps {
  selectedMachine: string;
  onMachineSelect: (id: string) => void;
  machineType: 'cnc' | 'laser' | '3d_printer' | 'robotic_arms';
}

interface Machine {
  id: string;
  name: string;
  model: string;
  manufacturer?: string;
  status: string;
  endpoint_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const MachineList = ({ selectedMachine, onMachineSelect, machineType }: MachineListProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    manufacturer: '',
    model: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch machines based on type
  const { data: machines = [], isLoading } = useQuery({
    queryKey: [machineType, filters],
    queryFn: async () => {
      console.log('Fetching machines for type:', machineType);
      let query: any;
      
      if (machineType === 'cnc') {
        query = supabase.from('cnc_machines').select('*');
      } else if (machineType === 'laser') {
        query = supabase.from('laser_machines').select('*');
      } else if (machineType === '3d_printer') {
        console.log('Fetching 3D printers...');
        query = (supabase as any).from('printer_3d').select('*');
      } else if (machineType === 'robotic_arms') {
        console.log('Fetching robotic arms...');
        query = supabase.from('robotic_arms').select('*');
      } else {
        throw new Error('Invalid machine type');
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.manufacturer) {
        query = query.ilike('manufacturer', `%${filters.manufacturer}%`);
      }
      if (filters.model) {
        query = query.ilike('model', `%${filters.model}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      console.log('Fetched machines:', data);
      return data as Machine[];
    }
  });

  // Delete machine mutation
  const deleteMachineMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting machine:', id, 'type:', machineType);
      
      if (machineType === 'cnc') {
        const { error } = await supabase.from('cnc_machines').delete().eq('id', id);
        if (error) throw error;
      } else if (machineType === 'laser') {
        const { error } = await supabase.from('laser_machines').delete().eq('id', id);
        if (error) throw error;
      } else if (machineType === '3d_printer') {
        console.log('Deleting 3D printer with ID:', id);
        const { error } = await (supabase as any)
          .from('printer_3d')
          .delete()
          .eq('id', id);
        if (error) {
          console.error('Delete error:', error);
          throw error;
        }
      } else if (machineType === 'robotic_arms') {
        console.log('Deleting robotic arm with ID:', id);
        const { error } = await supabase
          .from('robotic_arms')
          .delete()
          .eq('id', id);
        if (error) {
          console.error('Delete error:', error);
          throw error;
        }
      } else {
        throw new Error('Invalid machine type');
      }
    },
    onSuccess: () => {
      console.log('Machine deleted successfully');
      queryClient.invalidateQueries({ queryKey: [machineType] });
      if (selectedMachine === editingMachine?.id) {
        onMachineSelect('');
      }
      toast({
        title: "Success",
        description: "Machine deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete machine",
        variant: "destructive"
      });
    }
  });

  const handleDeleteMachine = (machine: Machine) => {
    if (confirm(`Are you sure you want to delete ${machine.name}?`)) {
      deleteMachineMutation.mutate(machine.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMachineTypeLabel = () => {
    switch (machineType) {
      case 'cnc':
        return 'CNC Machines';
      case 'laser':
        return 'Laser Machines';
      case '3d_printer':
        return '3D Printers';
      case 'robotic_arms':
        return 'Robotic Arms';
      default:
        return 'Machines';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-white border border-gray-200">
        <div className="text-center text-gray-500">Loading machines...</div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{getMachineTypeLabel()}</h3>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          size="sm"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="mb-4 p-3 bg-gray-50 rounded border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border rounded"
              >
                <option value="">All</option>
                <option value="idle">Idle</option>
                <option value="running">Running</option>
                <option value="error">Error</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Manufacturer</label>
              <input
                type="text"
                value={filters.manufacturer}
                onChange={(e) => setFilters(prev => ({ ...prev, manufacturer: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Filter by manufacturer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                type="text"
                value={filters.model}
                onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Filter by model"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className={`p-3 border rounded cursor-pointer transition-colors ${
              selectedMachine === machine.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onMachineSelect(machine.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{machine.name}</h4>
                  <Badge className={getStatusColor(machine.status)}>
                    {machine.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">{machine.model}</p>
                {machine.manufacturer && (
                  <p className="text-xs text-gray-400">{machine.manufacturer}</p>
                )}
                {machine.endpoint_url && (
                  <p className="text-xs text-blue-600 mt-1">Endpoint configured</p>
                )}
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={() => setEditingMachine(machine)}
                  size="sm"
                  variant="ghost"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteMachine(machine)}
                  size="sm"
                  variant="ghost"
                  disabled={deleteMachineMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {machines.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No machines found</p>
          <p className="text-sm">Add a machine to get started</p>
        </div>
      )}

      {editingMachine && (
        <EditMachineDialog
          machine={editingMachine as any}
          open={!!editingMachine}
          onOpenChange={(open) => !open && setEditingMachine(null)}
          machineType={machineType}
        />
      )}
    </Card>
  );
};
