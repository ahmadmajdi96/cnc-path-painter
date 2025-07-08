
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EditMachineDialog } from './EditMachineDialog';
import type { Tables } from '@/integrations/supabase/types';

type Machine = Tables<'cnc_machines'>;

interface MachineListProps {
  selectedMachine?: string;
  onMachineSelect: (machineId: string) => void;
}

export const MachineList = ({ selectedMachine, onMachineSelect }: MachineListProps) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch CNC machines from database
  const { data: machines = [], isLoading, error } = useQuery({
    queryKey: ['cnc-machines'],
    queryFn: async () => {
      console.log('Fetching CNC machines...');
      const { data, error } = await supabase
        .from('cnc_machines')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching machines:', error);
        throw error;
      }
      
      console.log('Fetched machines:', data);
      return data;
    }
  });

  // Delete machine mutation
  const deleteMachineMutation = useMutation({
    mutationFn: async (machineId: string) => {
      const { error } = await supabase
        .from('cnc_machines')
        .delete()
        .eq('id', machineId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cnc-machines'] });
    }
  });

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setEditDialogOpen(true);
  };

  const handleDelete = async (machineId: string) => {
    if (confirm('Are you sure you want to delete this machine?')) {
      deleteMachineMutation.mutate(machineId);
    }
  };

  const filteredMachines = machines.filter(machine => 
    statusFilter === 'all' || machine.status === statusFilter
  );

  if (isLoading) {
    return (
      <Card className="p-4 bg-white border border-gray-200 h-full">
        <div className="text-center">Loading machines...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-white border border-gray-200 h-full">
        <div className="text-center text-red-600">
          Error loading machines: {error.message}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 bg-white border border-gray-200 h-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CNC Machines</h3>
          <div className="flex gap-2 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          </div>
        </div>

        {machines.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No CNC machines found</p>
            <p className="text-sm text-gray-400">Click "Add Machine" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMachines.map((machine) => (
              <div
                key={machine.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMachine === machine.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onMachineSelect(machine.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{machine.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(machine.status)}>
                      {machine.status.toUpperCase()}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(machine);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(machine.id);
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        disabled={deleteMachineMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {machine.manufacturer} {machine.model}
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Work Area: {machine.work_area || 'Not specified'}</div>
                  <div>Spindle: {machine.max_spindle_speed || 0} RPM</div>
                  <div>Feed Rate: {machine.max_feed_rate || 0} mm/min</div>
                  {machine.ip_address && (
                    <div>IP: {machine.ip_address}:{machine.port || 502}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <EditMachineDialog
        machine={editingMachine}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};
