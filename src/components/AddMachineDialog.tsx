
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddMachineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMachineDialog = ({ open, onOpenChange }: AddMachineDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    workArea: '',
    maxSpindle: '',
    maxFeedRate: '',
    ipAddress: '',
    port: '',
    protocol: 'modbus',
    status: 'idle'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding machine:', formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      name: '',
      model: '',
      manufacturer: '',
      workArea: '',
      maxSpindle: '',
      maxFeedRate: '',
      ipAddress: '',
      port: '',
      protocol: 'modbus',
      status: 'idle'
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New CNC Machine</DialogTitle>
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
              <Label htmlFor="workArea">Work Area (mm)</Label>
              <Input
                id="workArea"
                value={formData.workArea}
                onChange={(e) => handleChange('workArea', e.target.value)}
                placeholder="e.g., 800x600x200"
              />
            </div>
            <div>
              <Label htmlFor="maxSpindle">Max Spindle Speed (RPM)</Label>
              <Input
                id="maxSpindle"
                type="number"
                value={formData.maxSpindle}
                onChange={(e) => handleChange('maxSpindle', e.target.value)}
                placeholder="15000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxFeedRate">Max Feed Rate (mm/min)</Label>
            <Input
              id="maxFeedRate"
              type="number"
              value={formData.maxFeedRate}
              onChange={(e) => handleChange('maxFeedRate', e.target.value)}
              placeholder="3000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) => handleChange('ipAddress', e.target.value)}
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add CNC Machine
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
