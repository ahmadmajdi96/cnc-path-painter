
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Edit2, Trash2, Wrench, Zap, Printer, Bot } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EditMachineDialog } from './EditMachineDialog';

interface MachineListProps {
  selectedMachine: string;
  onMachineSelect: (id: string) => void;
  machineType: 'cnc' | 'laser' | '3d_printer' | 'robotic_arms';
  projectId?: string;
  externalFilters?: {
    searchTerm?: string;
    status?: string;
    manufacturer?: string;
  };
  hideFilters?: boolean;
  onMachinesLoaded?: (machines: Machine[]) => void;
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
  projectId,
  externalFilters,
  hideFilters = false,
  onMachinesLoaded
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
    queryKey: [machineType, projectId, activeFilters],
    queryFn: async () => {
      console.log('Fetching machines for type:', machineType);
      
      // Only fetch machines for the current project
      // If no projectId, return empty array (project context required)
      if (!projectId) {
        return [];
      }
      
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
      
      // Filter by project_id
      query = query.eq('project_id', projectId);
      
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

  // Call onMachinesLoaded when machines are loaded
  useEffect(() => {
    if (machines.length > 0 && onMachinesLoaded) {
      onMachinesLoaded(machines);
    }
  }, [machines, onMachinesLoaded]);

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
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
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

  const getMachineIcon = (type: string) => {
    switch (type) {
      case 'cnc':
        return Wrench;
      case 'laser':
        return Zap;
      case '3d_printer':
        return Printer;
      case 'robotic_arms':
        return Bot;
      default:
        return Settings;
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
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {getMachineTypeLabel()}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {machines.map((machine) => {
            const MachineIcon = getMachineIcon(machineType);
            return (
              <div
                key={machine.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMachine === machine.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onMachineSelect(machine.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MachineIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{machine.name}</h4>
                      <p className="text-sm text-muted-foreground">{machine.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getStatusColor(machine.status)} text-white`}>
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
                
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {machine.manufacturer && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Manufacturer:</span>
                      <span>{machine.manufacturer}</span>
                    </div>
                  )}
                  {machine.endpoint_url && (
                    <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {machine.endpoint_url}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {machines.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No machines found</p>
          )}
        </div>
      </CardContent>

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
