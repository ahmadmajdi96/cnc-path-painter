
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, Camera, Wifi, WifiOff, Edit, Trash2, Plus } from 'lucide-react';

interface VisionSystem {
  id: string;
  name: string;
  endpoint: string;
  cameraType: string;
  resolution: string;
  status: 'online' | 'offline';
}

interface VisionSystemListProps {
  selectedSystem: string;
  onSystemSelect: (systemId: string) => void;
  visionSystems: VisionSystem[];
  onAddSystem: (systemData: Omit<VisionSystem, 'id' | 'status'>) => void;
  onEditSystem: (id: string, systemData: Omit<VisionSystem, 'id' | 'status'>) => void;
  onDeleteSystem: (id: string) => void;
  allVisionSystems: VisionSystem[];
}

export const VisionSystemList = ({ 
  selectedSystem, 
  onSystemSelect, 
  visionSystems,
  onAddSystem,
  onEditSystem,
  onDeleteSystem,
  allVisionSystems
}: VisionSystemListProps) => {
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
    if (window.confirm('Are you sure you want to delete this vision system?')) {
      onDeleteSystem(id);
      toast({ title: "Vision system deleted" });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Vision Systems
            </span>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add System
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {visionSystems.map((system) => (
              <div
                key={system.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedSystem === system.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onSystemSelect(system.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{system.name}</h3>
                  <div className="flex items-center gap-2">
                    {system.status === 'online' ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <Badge variant={system.status === 'online' ? 'default' : 'destructive'}>
                      {system.status}
                    </Badge>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(system)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(system.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Camera className="w-3 h-3" />
                    <span>{system.cameraType}</span>
                  </div>
                  <div>Resolution: {system.resolution}</div>
                  <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {system.endpoint}
                  </div>
                </div>
              </div>
            ))}
            
            {visionSystems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No vision systems available</p>
                <p className="text-sm">Add a vision system to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                placeholder="Main Inspection Camera"
                required
              />
            </div>
            <div>
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="http://192.168.1.100:8080"
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
    </>
  );
};
