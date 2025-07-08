
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Machine {
  id: string;
  name: string;
  model: string;
  manufacturer?: string;
  status: 'active' | 'idle' | 'offline';
  work_area?: string;
  max_spindle_speed?: number;
  max_feed_rate?: number;
  plunge_rate?: number;
  safe_height?: number;
  work_height?: number;
  ip_address?: string;
  port?: number;
  protocol?: string;
}

interface EditMachineDialogProps {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditMachineDialog = ({ machine, open, onOpenChange }: EditMachineDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    work_area: '',
    max_spindle_speed: '',
    max_feed_rate: '',
    plunge_rate: '',
    safe_height: '',
    work_height: '',
    ip_address: '',
    port: '',
    protocol: 'modbus',
    status: 'idle'
  });

  const queryClient = useQueryClient();

  // Update machine mutation
  const updateMachineMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!machine) return;
      
      const { error } = await (supabase as any)
        .from('cnc_machines')
        .update({
          name: data.name,
          model: data.model,
          manufacturer: data.manufacturer,
          work_area: data.work_area,
          max_spindle_speed: data.max_spindle_speed ? Number(data.max_spindle_speed) : null,
          max_feed_rate: data.max_feed_rate ? Number(data.max_feed_rate) : null,
          plunge_rate: data.plunge_rate ? Number(data.plunge_rate) : null,
          safe_height: data.safe_height ? Number(data.safe_height) : null,
          work_height: data.work_height ? Number(data.work_height) : null,
          ip_address: data.ip_address,
          port: data.port ? Number(data.port) : null,
          protocol: data.protocol,
          status: data.status
        })
        .eq('id', machine.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cnc-machines'] });
      onOpenChange(false);
    }
  });

  // Load machine data when dialog opens
  useEffect(() => {
    if (machine && open) {
      setFormData({
        name: machine.name || '',
        model: machine.model || '',
        manufacturer: machine.manufacturer || '',
        work_area: machine.work_area || '',
        max_spindle_speed: machine.max_spindle_speed?.toString() || '',
        max_feed_rate: machine.max_feed_rate?.toString() || '',
        plunge_rate: machine.plunge_rate?.toString() || '',
        safe_height: machine.safe_height?.toString() || '',
        work_height: machine.work_height?.toString() || '',
        ip_address: machine.ip_address || '',
        port: machine.port?.toString() || '',
        protocol: machine.protocol || 'modbus',
        status: machine.status || 'idle'
      });
    }
  }, [machine, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMachineMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!machine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit CNC Machine</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter machine name"
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Enter model"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              placeholder="Enter manufacturer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="work_area">Work Area</Label>
              <Input
                id="work_area"
                value={formData.work_area}
                onChange={(e) => handleChange('work_area', e.target.value)}
                placeholder="e.g., 800x600x200mm"
              />
            </div>
            <div>
              <Label htmlFor="max_spindle_speed">Max Spindle Speed (RPM)</Label>
              <Input
                id="max_spindle_speed"
                type="number"
                value={formData.max_spindle_speed}
                onChange={(e) => handleChange('max_spindle_speed', e.target.value)}
                placeholder="15000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_feed_rate">Max Feed Rate (mm/min)</Label>
              <Input
                id="max_feed_rate"
                type="number"
                value={formData.max_feed_rate}
                onChange={(e) => handleChange('max_feed_rate', e.target.value)}
                placeholder="3000"
              />
            </div>
            <div>
              <Label htmlFor="plunge_rate">Plunge Rate (mm/min)</Label>
              <Input
                id="plunge_rate"
                type="number"
                value={formData.plunge_rate}
                onChange={(e) => handleChange('plunge_rate', e.target.value)}
                placeholder="300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="safe_height">Safe Height (mm)</Label>
              <Input
                id="safe_height"
                type="number"
                step="0.1"
                value={formData.safe_height}
                onChange={(e) => handleChange('safe_height', e.target.value)}
                placeholder="5.0"
              />
            </div>
            <div>
              <Label htmlFor="work_height">Work Height (mm)</Label>
              <Input
                id="work_height"
                type="number"
                step="0.1"
                value={formData.work_height}
                onChange={(e) => handleChange('work_height', e.target.value)}
                placeholder="-2.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ip_address">IP Address</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => handleChange('ip_address', e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => handleChange('port', e.target.value)}
                placeholder="502"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={formData.protocol} onValueChange={(value) => handleChange('protocol', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modbus">Modbus TCP</SelectItem>
                  <SelectItem value="ethernet">Ethernet/IP</SelectItem>
                  <SelectItem value="serial">Serial RS-232</SelectItem>
                  <SelectItem value="usb">USB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updateMachineMutation.isPending}
            >
              {updateMachineMutation.isPending ? 'Updating...' : 'Update Machine'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
