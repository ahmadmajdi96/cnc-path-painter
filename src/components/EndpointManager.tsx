import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Endpoint {
  id: string;
  name: string;
  url: string;
}

interface EndpointManagerProps {
  selectedMachineId?: string;
  onEndpointSelect: (endpoint: string) => void;
  selectedEndpoint: string;
  machineType: 'cnc' | 'laser' | '3d_printer' | 'printer_3d';
}

export const EndpointManager = ({ selectedMachineId, onEndpointSelect, selectedEndpoint, machineType }: EndpointManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEndpoint, setNewEndpoint] = useState({ name: '', url: '' });
  const [editEndpoint, setEditEndpoint] = useState({ name: '', url: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch machine data based on machine type
  const { data: machineData } = useQuery({
    queryKey: [machineType, selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      
      if (machineType === 'cnc') {
        const { data, error } = await supabase.from('cnc_machines').select('*').eq('id', selectedMachineId).single();
        if (error) throw error;
        return data;
      } else if (machineType === 'laser') {
        const { data, error } = await supabase.from('laser_machines').select('*').eq('id', selectedMachineId).single();
        if (error) throw error;
        return data;
      } else if (machineType === '3d_printer') {
        const { data, error } = await (supabase as any).from('printer_3d').select('*').eq('id', selectedMachineId).single();
        if (error) throw error;
        return data;
      } else if (machineType === 'printer_3d') {
        const { data, error } = await (supabase as any).from('printer_3d').select('*').eq('id', selectedMachineId).single();
        if (error) throw error;
        return data;
      }
      
      throw new Error('Invalid machine type');
    },
    enabled: !!selectedMachineId
  });

  // Create a mock endpoints array from the machine's endpoint_url
  const endpoints: Endpoint[] = machineData?.endpoint_url ? [{
    id: selectedMachineId || '',
    name: `${machineData.name} Endpoint`,
    url: machineData.endpoint_url
  }] : [];

  // Update machine endpoint mutation
  const updateEndpointMutation = useMutation({
    mutationFn: async (endpoint: { name: string; url: string }) => {
      if (!selectedMachineId) return;
      
      if (machineType === 'cnc') {
        const { error } = await supabase.from('cnc_machines').update({ endpoint_url: endpoint.url }).eq('id', selectedMachineId);
        if (error) throw error;
      } else if (machineType === 'laser') {
        const { error } = await supabase.from('laser_machines').update({ endpoint_url: endpoint.url }).eq('id', selectedMachineId);
        if (error) throw error;
      } else if (machineType === '3d_printer') {
        const { error } = await (supabase as any).from('printer_3d').update({ endpoint_url: endpoint.url }).eq('id', selectedMachineId);
        if (error) throw error;
      } else if (machineType === 'printer_3d') {
        const { error } = await (supabase as any).from('printer_3d').update({ endpoint_url: endpoint.url }).eq('id', selectedMachineId);
        if (error) throw error;
      } else {
        throw new Error('Invalid machine type');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [machineType, selectedMachineId] });
      setIsAdding(false);
      setEditingId(null);
      setNewEndpoint({ name: '', url: '' });
      toast({
        title: "Success",
        description: "Endpoint updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update endpoint",
        variant: "destructive"
      });
    }
  });

  // Delete endpoint mutation (sets endpoint_url to null)
  const deleteEndpointMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMachineId) return;
      
      if (machineType === 'cnc') {
        const { error } = await supabase.from('cnc_machines').update({ endpoint_url: null }).eq('id', selectedMachineId);
        if (error) throw error;
      } else if (machineType === 'laser') {
        const { error } = await supabase.from('laser_machines').update({ endpoint_url: null }).eq('id', selectedMachineId);
        if (error) throw error;
      } else if (machineType === '3d_printer') {
        const { error } = await (supabase as any).from('printer_3d').update({ endpoint_url: null }).eq('id', selectedMachineId);
        if (error) throw error;
      } else if (machineType === 'printer_3d') {
        const { error } = await (supabase as any).from('printer_3d').update({ endpoint_url: null }).eq('id', selectedMachineId);
        if (error) throw error;
      } else {
        throw new Error('Invalid machine type');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [machineType, selectedMachineId] });
      onEndpointSelect(''); // Clear selected endpoint
      toast({
        title: "Success",
        description: "Endpoint removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove endpoint",
        variant: "destructive"
      });
    }
  });

  function handleAddEndpoint() {
    updateEndpointMutation.mutate(newEndpoint);
  }

  function handleUpdateEndpoint() {
    updateEndpointMutation.mutate(editEndpoint);
  }

  function handleDeleteEndpoint() {
    deleteEndpointMutation.mutate();
  }

  function startEditing(endpoint: Endpoint) {
    setEditingId(endpoint.id);
    setEditEndpoint({ name: endpoint.name, url: endpoint.url });
  }

  function getPlaceholderUrl() {
    switch (machineType) {
      case 'cnc':
        return 'http://machine-ip:port/gcode';
      case 'laser':
        return 'http://machine-ip:port/laser';
      case '3d_printer':
      case 'printer_3d':
        return 'http://machine-ip:port/print';
      default:
        return 'http://machine-ip:port/api';
    }
  }

  function getMachineTypeLabel() {
    switch (machineType) {
      case 'cnc':
        return 'CNC';
      case 'laser':
        return 'Laser';
      case '3d_printer':
      case 'printer_3d':
        return '3D Printer';
      default:
        return 'Machine';
    }
  };

  if (!selectedMachineId) {
    return (
      <Card className="p-4 bg-white border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Machine Endpoints</h4>
        <p className="text-gray-500 text-sm">Select a machine to manage its endpoints</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">
          {getMachineTypeLabel()} Machine Endpoints
        </h4>
        {!endpoints.length && !isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Endpoint
          </Button>
        )}
      </div>

      {/* Add new endpoint form */}
      {isAdding && (
        <div className="border border-gray-200 rounded p-4 mb-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                value={newEndpoint.name}
                onChange={(e) => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Endpoint name"
              />
            </div>
            <div>
              <Label htmlFor="new-url">URL</Label>
              <Input
                id="new-url"
                value={newEndpoint.url}
                onChange={(e) => setNewEndpoint(prev => ({ ...prev, url: e.target.value }))}
                placeholder={getPlaceholderUrl()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddEndpoint}
                disabled={!newEndpoint.name || !newEndpoint.url || updateEndpointMutation.isPending}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setNewEndpoint({ name: '', url: '' });
                }}
                size="sm"
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Endpoints list */}
      <div className="space-y-2">
        {endpoints.length === 0 && !isAdding ? (
          <p className="text-gray-500 text-sm">No endpoint configured for this machine</p>
        ) : (
          endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                selectedEndpoint === endpoint.url
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onEndpointSelect(endpoint.url)}
            >
              {editingId === endpoint.id ? (
                <div className="space-y-2">
                  <Input
                    value={editEndpoint.name}
                    onChange={(e) => setEditEndpoint(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Endpoint name"
                  />
                  <Input
                    value={editEndpoint.url}
                    onChange={(e) => setEditEndpoint(prev => ({ ...prev, url: e.target.value }))}
                    placeholder={getPlaceholderUrl()}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateEndpoint}
                      disabled={updateEndpointMutation.isPending}
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setEditingId(null)}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{endpoint.name}</div>
                    <div className="text-xs text-gray-500">{endpoint.url}</div>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => startEditing(endpoint)}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleDeleteEndpoint}
                      size="sm"
                      variant="ghost"
                      disabled={deleteEndpointMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
