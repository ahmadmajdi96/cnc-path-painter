
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AddRoboticArmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddRoboticArmDialog = ({ open, onOpenChange }: AddRoboticArmDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    joints: 6,
    degrees_of_freedom: 6,
    max_payload: 10.0,
    max_reach: 1000.0,
    ip_address: '',
    port: 502,
    protocol: 'modbus',
    status: 'idle'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addRoboticArmMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('robotic_arms')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['robotic_arms'] });
      toast({
        title: "Success",
        description: "Robotic arm added successfully",
      });
      onOpenChange(false);
      setFormData({
        name: '',
        model: '',
        manufacturer: '',
        joints: 6,
        degrees_of_freedom: 6,
        max_payload: 10.0,
        max_reach: 1000.0,
        ip_address: '',
        port: 502,
        protocol: 'modbus',
        status: 'idle'
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add robotic arm",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRoboticArmMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Robotic Arm</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="joints">Number of Joints *</Label>
              <Select value={formData.joints.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, joints: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 Joints</SelectItem>
                  <SelectItem value="5">5 Joints</SelectItem>
                  <SelectItem value="6">6 Joints</SelectItem>
                  <SelectItem value="7">7 Joints</SelectItem>
                  <SelectItem value="8">8 Joints</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_payload">Max Payload (kg) *</Label>
              <Input
                id="max_payload"
                type="number"
                step="0.1"
                value={formData.max_payload}
                onChange={(e) => setFormData(prev => ({ ...prev, max_payload: parseFloat(e.target.value) }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="max_reach">Max Reach (mm) *</Label>
              <Input
                id="max_reach"
                type="number"
                value={formData.max_reach}
                onChange={(e) => setFormData(prev => ({ ...prev, max_reach: parseFloat(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ip_address">IP Address</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                placeholder="192.168.1.100"
              />
            </div>
            
            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={formData.protocol} onValueChange={(value) => setFormData(prev => ({ ...prev, protocol: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modbus">Modbus</SelectItem>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="http">HTTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addRoboticArmMutation.isPending}>
              {addRoboticArmMutation.isPending ? 'Adding...' : 'Add Robotic Arm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
