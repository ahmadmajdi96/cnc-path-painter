
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
  externalFilters?: {
    searchTerm?: string;
    status?: string;
    manufacturer?: string;
  };
  hideFilters?: boolean;
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

export const MachineList = ({ 
  selectedMachine, 
  onMachineSelect, 
  machineType,
  externalFilters,
  hideFilters = false
}: MachineListProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    manufacturer: '',
    model: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use external filters if provided, otherwise use internal filters
  const activeFilters = externalFilters ? {
    status: externalFilters.status === 'all' ? '' : externalFilters.status || '',
    manufacturer: externalFilters.manufacturer || '',
    model: externalFilters.searchTerm || ''
  } : filters;

  const { data: machines = [], isLoading } = useQuery({
    queryKey: [machineType, activeFilters],
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
      
      if (activeFilters.status) {
        query = query.eq('status', activeFilters.status);
      }
      if (activeFilters.manufacturer) {
        query = query.ilike('manufacturer', `%${activeFilters.manufacturer}%`);
      }
      if (activeFilters.model) {
        query = query.or(`name.ilike.%${activeFilters.model}%,model.ilike.%${activeFilters.model}%`);
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
    <Card>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{getMachineTypeLabel()}</h3>
          {!hideFilters && (
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {!hideFilters && showFilters && (
        <div className="mb-4 p-3 bg-gray-50 rounded border">
...
        </div>
      )}

      <div className="p-4 space-y-2">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedMachine === machine.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onMachineSelect(machine.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{machine.name}</h4>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(machine.status)}>
                  {machine.status}
                </Badge>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={() => setEditingMachine(machine)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteMachine(machine)}
                    size="sm"
                    variant="outline"
                    disabled={deleteMachineMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div>Model: {machine.model}</div>
              {machine.manufacturer && (
                <div>Manufacturer: {machine.manufacturer}</div>
              )}
              {machine.endpoint_url && (
                <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-2">
                  {machine.endpoint_url}
                </div>
              )}
            </div>
          </div>
        ))}

        {machines.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No machines found</p>
            <p className="text-sm">Add a machine to get started</p>
          </div>
        )}
      </div>

      {editingMachine && (
        <EditMachineDialog
          machine={editingMachine as any}
          open={!!editingMachine}
          onOpenChange={(open) => !open && setEditingMachine(null)}
          machineType={machineType as 'cnc' | 'laser' | '3d_printer'}
        />
      )}
    </Card>
  );
};
