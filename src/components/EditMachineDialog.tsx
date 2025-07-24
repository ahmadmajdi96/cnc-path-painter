
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Machine = Tables<'cnc_machines'> | Tables<'laser_machines'> | any;

interface EditMachineDialogProps {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineType: 'cnc' | 'laser' | '3d_printer';
}

export const EditMachineDialog = ({ machine, open, onOpenChange, machineType }: EditMachineDialogProps) => {
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
    status: 'idle',
    // Laser specific
    max_power: '',
    max_frequency: '',
    max_speed: '',
    beam_diameter: '',
    // 3D printer specific
    max_build_volume_x: '',
    max_build_volume_y: '',
    max_build_volume_z: '',
    nozzle_diameter: '',
    max_hotend_temp: '',
    max_bed_temp: '',
    endpoint_url: ''
  });

  const queryClient = useQueryClient();

  // Update machine mutation
  const updateMachineMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!machine) return;
      
      let query;
      const baseData = {
        name: data.name,
        model: data.model,
        manufacturer: data.manufacturer,
        ip_address: data.ip_address,
        port: data.port ? Number(data.port) : null,
        protocol: data.protocol,
        status: data.status,
        endpoint_url: data.endpoint_url
      };

      if (machineType === 'cnc') {
        query = supabase
          .from('cnc_machines')
          .update({
            ...baseData,
            work_area: data.work_area,
            max_spindle_speed: data.max_spindle_speed ? Number(data.max_spindle_speed) : null,
            max_feed_rate: data.max_feed_rate ? Number(data.max_feed_rate) : null,
            plunge_rate: data.plunge_rate ? Number(data.plunge_rate) : null,
            safe_height: data.safe_height ? Number(data.safe_height) : null,
            work_height: data.work_height ? Number(data.work_height) : null,
          })
          .eq('id', machine.id);
      } else if (machineType === 'laser') {
        query = supabase
          .from('laser_machines')
          .update({
            ...baseData,
            max_power: data.max_power ? Number(data.max_power) : null,
            max_frequency: data.max_frequency ? Number(data.max_frequency) : null,
            max_speed: data.max_speed ? Number(data.max_speed) : null,
            beam_diameter: data.beam_diameter ? Number(data.beam_diameter) : null,
          })
          .eq('id', machine.id);
      } else if (machineType === '3d_printer') {
        query = (supabase as any)
          .from('3d_printers')
          .update({
            ...baseData,
            max_build_volume_x: data.max_build_volume_x ? Number(data.max_build_volume_x) : null,
            max_build_volume_y: data.max_build_volume_y ? Number(data.max_build_volume_y) : null,
            max_build_volume_z: data.max_build_volume_z ? Number(data.max_build_volume_z) : null,
            nozzle_diameter: data.nozzle_diameter ? Number(data.nozzle_diameter) : null,
            max_hotend_temp: data.max_hotend_temp ? Number(data.max_hotend_temp) : null,
            max_bed_temp: data.max_bed_temp ? Number(data.max_bed_temp) : null,
          })
          .eq('id', machine.id);
      }
      
      if (query) {
        const { error } = await query;
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [machineType] });
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
        status: machine.status || 'idle',
        // Laser specific
        max_power: machine.max_power?.toString() || '',
        max_frequency: machine.max_frequency?.toString() || '',
        max_speed: machine.max_speed?.toString() || '',
        beam_diameter: machine.beam_diameter?.toString() || '',
        // 3D printer specific
        max_build_volume_x: machine.max_build_volume_x?.toString() || '',
        max_build_volume_y: machine.max_build_volume_y?.toString() || '',
        max_build_volume_z: machine.max_build_volume_z?.toString() || '',
        nozzle_diameter: machine.nozzle_diameter?.toString() || '',
        max_hotend_temp: machine.max_hotend_temp?.toString() || '',
        max_bed_temp: machine.max_bed_temp?.toString() || '',
        endpoint_url: machine.endpoint_url || ''
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

  const getMachineTypeLabel = () => {
    switch (machineType) {
      case 'cnc':
        return 'CNC Machine';
      case 'laser':
        return 'Laser Machine';
      case '3d_printer':
        return '3D Printer';
      default:
        return 'Machine';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {getMachineTypeLabel()}</DialogTitle>
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

          {/* CNC specific fields */}
          {machineType === 'cnc' && (
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
          )}

          {/* Laser specific fields */}
          {machineType === 'laser' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_power">Max Power (%)</Label>
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

          {/* 3D printer specific fields */}
          {machineType === '3d_printer' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max_build_volume_x">Build Volume X (mm)</Label>
                  <Input
                    id="max_build_volume_x"
                    type="number"
                    value={formData.max_build_volume_x}
                    onChange={(e) => handleChange('max_build_volume_x', e.target.value)}
                    placeholder="200"
                  />
                </div>
                <div>
                  <Label htmlFor="max_build_volume_y">Build Volume Y (mm)</Label>
                  <Input
                    id="max_build_volume_y"
                    type="number"
                    value={formData.max_build_volume_y}
                    onChange={(e) => handleChange('max_build_volume_y', e.target.value)}
                    placeholder="200"
                  />
                </div>
                <div>
                  <Label htmlFor="max_build_volume_z">Build Volume Z (mm)</Label>
                  <Input
                    id="max_build_volume_z"
                    type="number"
                    value={formData.max_build_volume_z}
                    onChange={(e) => handleChange('max_build_volume_z', e.target.value)}
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nozzle_diameter">Nozzle Diameter (mm)</Label>
                  <Input
                    id="nozzle_diameter"
                    type="number"
                    step="0.01"
                    value={formData.nozzle_diameter}
                    onChange={(e) => handleChange('nozzle_diameter', e.target.value)}
                    placeholder="0.4"
                  />
                </div>
                <div>
                  <Label htmlFor="max_hotend_temp">Max Hotend Temp (°C)</Label>
                  <Input
                    id="max_hotend_temp"
                    type="number"
                    value={formData.max_hotend_temp}
                    onChange={(e) => handleChange('max_hotend_temp', e.target.value)}
                    placeholder="260"
                  />
                </div>
                <div>
                  <Label htmlFor="max_bed_temp">Max Bed Temp (°C)</Label>
                  <Input
                    id="max_bed_temp"
                    type="number"
                    value={formData.max_bed_temp}
                    onChange={(e) => handleChange('max_bed_temp', e.target.value)}
                    placeholder="80"
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
                  {machineType === 'cnc' && (
                    <>
                      <SelectItem value="modbus">Modbus TCP</SelectItem>
                      <SelectItem value="ethernet">Ethernet/IP</SelectItem>
                      <SelectItem value="serial">Serial RS-232</SelectItem>
                      <SelectItem value="usb">USB</SelectItem>
                    </>
                  )}
                  {machineType === 'laser' && (
                    <>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="serial">Serial</SelectItem>
                      <SelectItem value="usb">USB</SelectItem>
                    </>
                  )}
                  {machineType === '3d_printer' && (
                    <>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="serial">Serial</SelectItem>
                      <SelectItem value="usb">USB</SelectItem>
                    </>
                  )}
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
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="endpoint_url">Endpoint URL</Label>
            <Input
              id="endpoint_url"
              value={formData.endpoint_url}
              onChange={(e) => handleChange('endpoint_url', e.target.value)}
              placeholder="http://192.168.1.100:8080/api"
            />
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
