
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Wifi, WifiOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EndpointManagerProps {
  selectedMachineId?: string;
  onEndpointSelect: (endpoint: string) => void;
  selectedEndpoint: string;
  machineType: 'cnc' | 'laser' | '3d_printer' | 'robotic_arms';
}

interface Endpoint {
  id: string;
  machine_id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  description?: string;
  created_at: string;
  updated_at: string;
}

export const EndpointManager = ({ 
  selectedMachineId, 
  onEndpointSelect, 
  selectedEndpoint,
  machineType 
}: EndpointManagerProps) => {
  const [newEndpoint, setNewEndpoint] = useState({ name: '', url: '', description: '' });
  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: endpoints, isLoading, error } = useQuery({
    queryKey: ['endpoints', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return [];
      const { data, error } = await (supabase as any)
        .from('endpoints')
        .select('*')
        .eq('machine_id', selectedMachineId);

      if (error) {
        console.error('Error fetching endpoints:', error);
        throw error;
      }
      return data as Endpoint[];
    },
    enabled: !!selectedMachineId,
  });

  const addEndpointMutation = useMutation({
    mutationFn: async (endpoint: Omit<Endpoint, 'id' | 'created_at' | 'updated_at' | 'machine_id'>) => {
      if (!selectedMachineId) throw new Error('No machine selected');
      const { data, error } = await (supabase as any)
        .from('endpoints')
        .insert([{ 
          ...endpoint, 
          machine_id: selectedMachineId, 
          status: 'disconnected' 
        }]);

      if (error) {
        console.error('Error adding endpoint:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', selectedMachineId] });
      setNewEndpoint({ name: '', url: '', description: '' });
      setIsAddingEndpoint(false);
      toast({
        title: "Success",
        description: "Endpoint added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error adding endpoint:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add endpoint",
        variant: "destructive"
      });
    },
  });

  const deleteEndpointMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('endpoints')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting endpoint:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', selectedMachineId] });
      toast({
        title: "Success",
        description: "Endpoint deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting endpoint:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete endpoint",
        variant: "destructive"
      });
    },
  });

  const handleAddEndpoint = async () => {
    try {
      await addEndpointMutation.mutateAsync(newEndpoint);
    } catch (error) {
      console.error('Failed to add endpoint', error);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this endpoint?')) {
      try {
        await deleteEndpointMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete endpoint', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">Endpoint Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center">Loading endpoints...</div>
        ) : error ? (
          <div className="text-center text-red-500">Error: {error.message}</div>
        ) : (
          <div className="space-y-2">
            {endpoints?.map((endpoint) => (
              <div
                key={endpoint.id}
                className={`flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-gray-50 ${
                  selectedEndpoint === endpoint.url ? 'bg-purple-50 border-purple-500' : 'border-gray-200'
                }`}
                onClick={() => onEndpointSelect(endpoint.url)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{endpoint.name}</h4>
                    <Badge className={getStatusColor(endpoint.status)}>{endpoint.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{endpoint.url}</p>
                  {endpoint.description && <p className="text-xs text-gray-400">{endpoint.description}</p>}
                </div>
                <div className="flex gap-2">
                  {endpoint.status === 'connected' ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-gray-500" />
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEndpoint(endpoint.id);
                    }}
                    size="sm"
                    variant="ghost"
                    disabled={deleteEndpointMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {endpoints && endpoints.length === 0 && (
              <div className="text-center py-4 text-gray-500">No endpoints configured.</div>
            )}
          </div>
        )}

        {isAddingEndpoint ? (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Endpoint Name"
              value={newEndpoint.name}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
            />
            <Input
              type="url"
              placeholder="Endpoint URL"
              value={newEndpoint.url}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Description (optional)"
              value={newEndpoint.description}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, description: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAddingEndpoint(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEndpoint} disabled={addEndpointMutation.isPending}>
                Add Endpoint
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setIsAddingEndpoint(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Endpoint
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
