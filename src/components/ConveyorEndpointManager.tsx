
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Globe, Wifi, WifiOff } from 'lucide-react';

interface ConveyorEndpoint {
  id: string;
  name: string;
  url: string;
  type: string;
  status: 'active' | 'inactive';
  systemId: string;
}

interface ConveyorEndpointManagerProps {
  selectedSystemId?: string;
  endpoints: ConveyorEndpoint[];
  selectedEndpoint?: string;
  onEndpointSelect: (endpointUrl: string) => void;
  onAddEndpoint: (endpoint: Omit<ConveyorEndpoint, 'id'>) => void;
  onEditEndpoint: (id: string, endpoint: Omit<ConveyorEndpoint, 'id'>) => void;
  onDeleteEndpoint: (id: string) => void;
}

export const ConveyorEndpointManager = ({
  selectedSystemId,
  endpoints,
  selectedEndpoint,
  onEndpointSelect,
  onAddEndpoint,
  onEditEndpoint,
  onDeleteEndpoint
}: ConveyorEndpointManagerProps) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<ConveyorEndpoint | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'control',
    status: 'active' as 'active' | 'inactive',
    systemId: selectedSystemId || ''
  });

  const systemEndpoints = endpoints.filter(ep => ep.systemId === selectedSystemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSystemId) {
      toast({
        title: "No system selected",
        description: "Please select a conveyor belt first",
        variant: "destructive"
      });
      return;
    }

    const endpointData = { ...formData, systemId: selectedSystemId };
    
    if (editingEndpoint) {
      onEditEndpoint(editingEndpoint.id, endpointData);
      toast({ title: "Endpoint updated successfully" });
      setEditingEndpoint(null);
    } else {
      onAddEndpoint(endpointData);
      toast({ title: "Endpoint added successfully" });
      setIsAddDialogOpen(false);
    }
    
    setFormData({ name: '', url: '', type: 'control', status: 'active', systemId: selectedSystemId });
  };

  const handleEdit = (endpoint: ConveyorEndpoint) => {
    setFormData({
      name: endpoint.name,
      url: endpoint.url,
      type: endpoint.type,
      status: endpoint.status,
      systemId: endpoint.systemId
    });
    setEditingEndpoint(endpoint);
  };

  const handleDelete = (id: string) => {
    onDeleteEndpoint(id);
    toast({ title: "Endpoint deleted" });
  };

  if (!selectedSystemId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Select a conveyor belt to manage endpoints
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Endpoints
            </span>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Endpoint
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemEndpoints.map((endpoint) => (
              <div key={endpoint.id} className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedEndpoint === endpoint.url
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onEndpointSelect(endpoint.url)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{endpoint.name}</h4>
                    {endpoint.status === 'active' ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'}>
                      {endpoint.status}
                    </Badge>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(endpoint)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(endpoint.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-mono text-xs bg-muted px-2 py-1 rounded mb-1">
                    {endpoint.url}
                  </p>
                  <p>Type: {endpoint.type}</p>
                </div>
              </div>
            ))}
            {systemEndpoints.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No endpoints configured</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || !!editingEndpoint} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingEndpoint(null);
          setFormData({ name: '', url: '', type: 'control', status: 'active', systemId: selectedSystemId });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEndpoint ? 'Edit Endpoint' : 'Add Endpoint'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Endpoint Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Speed Control"
                required
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="http://192.168.1.100:8080/speed"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                placeholder="control"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingEndpoint(null);
                setFormData({ name: '', url: '', type: 'control', status: 'active', systemId: selectedSystemId });
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEndpoint ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
