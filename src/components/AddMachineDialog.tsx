
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AddMachineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineType?: 'cnc' | 'laser';
}

export const AddMachineDialog = ({ open, onOpenChange, machineType = 'cnc' }: AddMachineDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    // CNC specific fields
    work_area: '',
    max_spindle_speed: '',
    max_feed_rate: '',
    plunge_rate: '',
    safe_height: '',
    work_height: '',
    // Laser specific fields
    max_power: '',
    max_frequency: '',
    max_speed: '',
    beam_diameter: '',
    // Common fields
    ip_address: '',
    port: '',
    protocol: machineType === 'cnc' ? 'modbus' : 'http',
    status: 'idle'
  });

  const queryClient = useQueryClient();

  // Add machine mutation
  const addMachineMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const tableName = machineType === 'cnc' ? 'cnc_machines' : 'laser_machines';
      
      let insertData: any = {
        name: data.name,
        model: data.model,
        manufacturer: data.manufacturer,
        ip_address: data.ip_address,
        port: data.port ? Number(data.port) : null,
        protocol: data.protocol,
        status: data.status
      };

      if (machineType === 'cnc') {
        insertData = {
          ...insertData,
          work_area: data.work_area,
          max_spindle_speed: data.max_spindle_speed ? Number(data.max_spindle_speed) : null,
          max_feed_rate: data.max_feed_rate ? Number(data.max_feed_rate) : null,
          plunge_rate: data.plunge_rate ? Number(data.plunge_rate) : null,
          safe_height: data.safe_height ? Number(data.safe_height) : null,
          work_height: data.work_height ? Number(data.work_height) : null,
        };
      } else {
        insertData = {
          ...insertData,
          max_power: data.max_power ? Number(data.max_power) : null,
          max_frequency: data.max_frequency ? Number(data.max_frequency) : null,
          max_speed: data.max_speed ? Number(data.max_speed) : null,
          beam_diameter: data.beam_diameter ? Number(data.beam_diameter) : null,
        };
      }

      const { error } = await supabase
        .from(tableName)
        .insert(insertData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      const queryKey = machineType === 'cnc' ? 'cnc-machines' : 'laser-machines';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        model: '',
        manufacturer: '',
        work_area: '',
        max_spindle_speed: '',
        max_feed_rate: '',
        plunge_rate: '',
        safe_height: '',
        work_height: '',
        max_power: '',
        max_frequency: '',
        max_speed: '',
        beam_diameter: '',
        ip_address: '',
        port: '',
        protocol: machineType === 'cnc' ? 'modbus' : 'http',
        status: 'idle'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMachineMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const machineTypeLabel = machineType === 'cnc' ? 'CNC' : 'Laser';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New {machineTypeLabel} Machine</DialogTitle>
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

          {machineType === 'cnc' ? (
            <>
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
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_power">Max Power (W)</Label>
                  <Input
                    id="max_power"
                    type="number"
                    value={formData.max_power}
                    onChange={(e) => handleChange('max_power', e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="max_frequency">Max Frequency (Hz)</Label>
                  <Input
                    id="max_frequency"
                    type="number"
                    value={formData.max_frequency}
                    onChange={(e) => handleChange('max_frequency', e.target.value)}
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_speed">Max Speed (mm/min)</Label>
                  <Input
                    id="max_speed"
                    type="number"
                    value={formData.max_speed}
                    onChange={(e) => handleChange('max_speed', e.target.value)}
                    placeholder="2000"
                  />
                </div>
                <div>
                  <Label htmlFor="beam_diameter">Beam Diameter (mm)</Label>
                  <Input
                    id="beam_diameter"
                    type="number"
                    step="0.01"
                    value={formData.beam_diameter}
                    onChange={(e) => handleChange('beam_diameter', e.target.value)}
                    placeholder="0.1"
                  />
                </div>
              </div>
            </>
          )}

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
                placeholder={machineType === 'cnc' ? '502' : '80'}
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
                  {machineType === 'cnc' ? (
                    <>
                      <SelectItem value="modbus">Modbus TCP</SelectItem>
                      <SelectItem value="ethernet">Ethernet/IP</SelectItem>
                      <SelectItem value="serial">Serial RS-232</SelectItem>
                      <SelectItem value="usb">USB</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="udp">UDP</SelectItem>
                      <SelectItem value="websocket">WebSocket</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Initial Status</Label>
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
              disabled={addMachineMutation.isPending}
            >
              {addMachineMutation.isPending ? 'Adding...' : `Add ${machineTypeLabel} Machine`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
