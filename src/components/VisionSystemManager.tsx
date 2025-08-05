
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';

interface VisionSystem {
  id: string;
  name: string;
  endpoint: string;
  cameraType: string;
  resolution: string;
  status: 'online' | 'offline';
}

interface VisionSystemManagerProps {
  visionSystems: VisionSystem[];
  onAddSystem: (system: Omit<VisionSystem, 'id' | 'status'>) => void;
  onEditSystem: (id: string, system: Omit<VisionSystem, 'id' | 'status'>) => void;
  onDeleteSystem: (id: string) => void;
}

export const VisionSystemManager = ({
  visionSystems,
  onAddSystem,
  onEditSystem,
  onDeleteSystem
}: VisionSystemManagerProps) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<VisionSystem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    cameraType: '',
    resolution: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSystem) {
      onEditSystem(editingSystem.id, formData);
      toast({ title: "Vision system updated successfully" });
      setEditingSystem(null);
    } else {
      onAddSystem(formData);
      toast({ title: "Vision system added successfully" });
      setIsAddDialogOpen(false);
    }
    
    setFormData({ name: '', endpoint: '', cameraType: '', resolution: '' });
  };

  const handleEdit = (system: VisionSystem) => {
    setFormData({
      name: system.name,
      endpoint: system.endpoint,
      cameraType: system.cameraType,
      resolution: system.resolution
    });
    setEditingSystem(system);
  };

  const handleDelete = (id: string) => {
    onDeleteSystem(id);
    toast({ title: "Vision system deleted" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Vision Systems
          </span>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add System
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visionSystems.map((system) => (
            <div key={system.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{system.name}</p>
                <p className="text-sm text-gray-500">{system.endpoint}</p>
                <p className="text-xs text-gray-400">{system.cameraType} - {system.resolution}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(system)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(system.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {visionSystems.length === 0 && (
            <p className="text-gray-500 text-center py-4">No vision systems configured</p>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen || !!editingSystem} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingSystem(null);
            setFormData({ name: '', endpoint: '', cameraType: '', resolution: '' });
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSystem ? 'Edit Vision System' : 'Add Vision System'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">System Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input
                  id="endpoint"
                  value={formData.endpoint}
                  onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                  placeholder="http://192.168.1.100:8080/api"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cameraType">Camera Type</Label>
                <Input
                  id="cameraType"
                  value={formData.cameraType}
                  onChange={(e) => setFormData(prev => ({ ...prev, cameraType: e.target.value }))}
                  placeholder="Industrial CCD"
                  required
                />
              </div>
              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Input
                  id="resolution"
                  value={formData.resolution}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                  placeholder="1920x1080"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingSystem(null);
                  setFormData({ name: '', endpoint: '', cameraType: '', resolution: '' });
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSystem ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
