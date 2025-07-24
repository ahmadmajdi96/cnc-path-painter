
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Edit2, Trash2, Plus, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MachineFilters } from './MachineFilters';
import { EditMachineDialog } from './EditMachineDialog';

interface MachineListProps {
  selectedMachine: string;
  onMachineSelect: (id: string) => void;
  machineType: 'cnc' | 'laser' | '3d_printer';
}

interface Machine {
  id: string;
  name: string;
  model: string;
  manufacturer?: string;
  status: string;
  endpoint_url?: string;
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

  // Get table name based on machine type
  const getTableName = () => {
    switch (machineType) {
      case 'cnc':
        return 'cnc_machines';
      case 'laser':
        return 'laser_machines';
      case '3d_printer':
        return '3d_printers';
      default:
        return 'cnc_machines';
    }
  };

  const tableName = getTableName();

  // Fetch machines based on type
  const { data: machines = [], isLoading } = useQuery({
    queryKey: [tableName, filters],
    queryFn: async () => {
      let query = supabase.from(tableName).select('*');
      
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
      if (error) throw error;
      return data as Machine[];
    }
  });

  // Delete machine mutation
  const deleteMachineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      if (selectedMachine === editingMachine?.id) {
        onMachineSelect('');
      }
      toast({
        title: "Success",
        description: "Machine deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete machine",
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
        <MachineFilters
          filters={filters}
          onFiltersChange={setFilters}
          machineType={machineType}
        />
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
          machine={editingMachine}
          open={!!editingMachine}
          onOpenChange={(open) => !open && setEditingMachine(null)}
          machineType={machineType}
        />
      )}
    </Card>
  );
};
