
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
}

export const EndpointManager = ({ selectedMachineId, onEndpointSelect, selectedEndpoint }: EndpointManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEndpoint, setNewEndpoint] = useState({ name: '', url: '' });
  const [editEndpoint, setEditEndpoint] = useState({ name: '', url: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch endpoints (using laser_machines table for now)
  const { data: endpoints = [] } = useQuery({
    queryKey: ['endpoints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laser_machines')
        .select('id, name, endpoint_url')
        .not('endpoint_url', 'is', null);
      if (error) throw error;
      return data.map(m => ({
        id: m.id,
        name: m.name,
        url: m.endpoint_url || ''
      }));
    }
  });

  // Add endpoint mutation
  const addEndpointMutation = useMutation({
    mutationFn: async (endpoint: { name: string; url: string }) => {
      // For now, we'll create a new laser machine entry
      const { error } = await supabase
        .from('laser_machines')
        .insert({
          name: endpoint.name,
          model: 'Endpoint',
          endpoint_url: endpoint.url,
          status: 'idle'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      setIsAdding(false);
      setNewEndpoint({ name: '', url: '' });
      toast({
        title: "Success",
        description: "Endpoint added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add endpoint",
        variant: "destructive"
      });
    }
  });

  // Update endpoint mutation
  const updateEndpointMutation = useMutation({
    mutationFn: async ({ id, endpoint }: { id: string; endpoint: { name: string; url: string } }) => {
      const { error } = await supabase
        .from('laser_machines')
        .update({
          name: endpoint.name,
          endpoint_url: endpoint.url
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      setEditingId(null);
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

  // Delete endpoint mutation
  const deleteEndpointMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('laser_machines')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      toast({
        title: "Success",
        description: "Endpoint deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete endpoint",
        variant: "destructive"
      });
    }
  });

  const handleAddEndpoint = () => {
    addEndpointMutation.mutate(newEndpoint);
  };

  const handleUpdateEndpoint = (id: string) => {
    updateEndpointMutation.mutate({ id, endpoint: editEndpoint });
  };

  const handleDeleteEndpoint = (id: string) => {
    deleteEndpointMutation.mutate(id);
  };

  const startEditing = (endpoint: Endpoint) => {
    setEditingId(endpoint.id);
    setEditEndpoint({ name: endpoint.name, url: endpoint.url });
  };

  return (
    <Card className="p-4 bg-white border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">G-Code Endpoints</h4>
        <Button
          onClick={() => setIsAdding(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Endpoint
        </Button>
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
                placeholder="http://machine-ip:port/gcode"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddEndpoint}
                disabled={!newEndpoint.name || !newEndpoint.url || addEndpointMutation.isPending}
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
        {endpoints.map((endpoint) => (
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
                  placeholder="http://machine-ip:port/gcode"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdateEndpoint(endpoint.id)}
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
                    onClick={() => handleDeleteEndpoint(endpoint.id)}
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
        ))}
      </div>
    </Card>
  );
};
