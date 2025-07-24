import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddMachineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineType: 'cnc' | 'laser' | '3d_printer';
}

export const AddMachineDialog = ({ open, onOpenChange, machineType }: AddMachineDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    status: 'idle',
    endpoint_url: '',
    ip_address: '',
    port: '',
    protocol: '',
    // CNC specific
    max_spindle_speed: '',
    max_feed_rate: '',
    plunge_rate: '',
    safe_height: '',
    work_height: '',
    work_area: '',
    // Laser specific
    max_power: '',
    max_frequency: '',
    max_speed: '',
    beam_diameter: '',
    // 3D Printer specific
    max_build_volume_x: '',
    max_build_volume_y: '',
    max_build_volume_z: '',
    nozzle_diameter: '',
    max_hotend_temp: '',
    max_bed_temp: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMachineMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Adding machine with data:', data);
      console.log('Machine type:', machineType);
      
      const baseData = {
        name: data.name,
        model: data.model,
        manufacturer: data.manufacturer,
        status: data.status,
        endpoint_url: data.endpoint_url,
        ip_address: data.ip_address,
        port: data.port ? parseInt(data.port) : null,
        protocol: data.protocol
      };

      if (machineType === 'cnc') {
        const insertData = {
          ...baseData,
          max_spindle_speed: data.max_spindle_speed ? parseInt(data.max_spindle_speed) : null,
          max_feed_rate: data.max_feed_rate ? parseInt(data.max_feed_rate) : null,
          plunge_rate: data.plunge_rate ? parseInt(data.plunge_rate) : null,
          safe_height: data.safe_height ? parseFloat(data.safe_height) : null,
          work_height: data.work_height ? parseFloat(data.work_height) : null,
          work_area: data.work_area
        };
        console.log('Inserting CNC data:', insertData);
        const { error } = await supabase.from('cnc_machines').insert([insertData]);
        if (error) {
          console.error('CNC insert error:', error);
          throw error;
        }
      } else if (machineType === 'laser') {
        const insertData = {
          ...baseData,
          max_power: data.max_power ? parseInt(data.max_power) : null,
          max_frequency: data.max_frequency ? parseInt(data.max_frequency) : null,
          max_speed: data.max_speed ? parseInt(data.max_speed) : null,
          beam_diameter: data.beam_diameter ? parseFloat(data.beam_diameter) : null
        };
        console.log('Inserting laser data:', insertData);
        const { error } = await supabase.from('laser_machines').insert([insertData]);
        if (error) {
          console.error('Laser insert error:', error);
          throw error;
        }
      } else if (machineType === '3d_printer') {
        const insertData = {
          ...baseData,
          max_build_volume_x: data.max_build_volume_x ? parseFloat(data.max_build_volume_x) : null,
          max_build_volume_y: data.max_build_volume_y ? parseFloat(data.max_build_volume_y) : null,
          max_build_volume_z: data.max_build_volume_z ? parseFloat(data.max_build_volume_z) : null,
          nozzle_diameter: data.nozzle_diameter ? parseFloat(data.nozzle_diameter) : null,
          max_hotend_temp: data.max_hotend_temp ? parseInt(data.max_hotend_temp) : null,
          max_bed_temp: data.max_bed_temp ? parseInt(data.max_bed_temp) : null
        };
        console.log('Inserting 3D printer data:', insertData);
        
        // Use direct SQL query to avoid TypeScript issues
        const { error } = await supabase.rpc('insert_3d_printer', insertData);
        
        // If RPC doesn't exist, fall back to direct table access
        if (error && error.message?.includes('function "insert_3d_printer" does not exist')) {
          console.log('RPC not found, using direct table access');
          const { error: directError } = await supabase
            .from('3d_printers' as any)
            .insert([insertData]);
          if (directError) {
            console.error('3D printer direct insert error:', directError);
            throw directError;
          }
        } else if (error) {
          console.error('3D printer RPC error:', error);
          throw error;
        }
      }
    },
    onSuccess: () => {
      console.log('Machine added successfully');
      queryClient.invalidateQueries({ queryKey: [machineType] });
      queryClient.invalidateQueries({ queryKey: ['3d_printer'] });
      onOpenChange(false);
      setFormData({
        name: '',
        model: '',
        manufacturer: '',
        status: 'idle',
        endpoint_url: '',
        ip_address: '',
        port: '',
        protocol: '',
        max_spindle_speed: '',
        max_feed_rate: '',
        plunge_rate: '',
        safe_height: '',
        work_height: '',
        work_area: '',
        max_power: '',
        max_frequency: '',
        max_speed: '',
        beam_diameter: '',
        max_build_volume_x: '',
        max_build_volume_y: '',
        max_build_volume_z: '',
        nozzle_diameter: '',
        max_hotend_temp: '',
        max_bed_temp: ''
      });
      toast({
        title: "Success",
        description: "Machine added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Machine add error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add machine",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with:', formData);
    addMachineMutation.mutate(formData);
  };

  const renderMachineSpecificFields = () => {
    if (machineType === 'cnc') {
      return (
        <>
          <div>
            <Label htmlFor="max_spindle_speed">Max Spindle Speed (RPM)</Label>
            <Input
              id="max_spindle_speed"
              type="number"
              value={formData.max_spindle_speed}
              onChange={(e) => setFormData(prev => ({ ...prev, max_spindle_speed: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="max_feed_rate">Max Feed Rate (mm/min)</Label>
            <Input
              id="max_feed_rate"
              type="number"
              value={formData.max_feed_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, max_feed_rate: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="plunge_rate">Plunge Rate (mm/min)</Label>
            <Input
              id="plunge_rate"
              type="number"
              value={formData.plunge_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, plunge_rate: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="safe_height">Safe Height (mm)</Label>
            <Input
              id="safe_height"
              type="number"
              step="0.1"
              value={formData.safe_height}
              onChange={(e) => setFormData(prev => ({ ...prev, safe_height: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="work_height">Work Height (mm)</Label>
            <Input
              id="work_height"
              type="number"
              step="0.1"
              value={formData.work_height}
              onChange={(e) => setFormData(prev => ({ ...prev, work_height: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="work_area">Work Area</Label>
            <Input
              id="work_area"
              value={formData.work_area}
              onChange={(e) => setFormData(prev => ({ ...prev, work_area: e.target.value }))}
              placeholder="e.g., 300x300x100"
            />
          </div>
        </>
      );
    } else if (machineType === 'laser') {
      return (
        <>
          <div>
            <Label htmlFor="max_power">Max Power (%)</Label>
            <Input
              id="max_power"
              type="number"
              value={formData.max_power}
              onChange={(e) => setFormData(prev => ({ ...prev, max_power: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="max_frequency">Max Frequency (Hz)</Label>
            <Input
              id="max_frequency"
              type="number"
              value={formData.max_frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, max_frequency: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="max_speed">Max Speed (mm/min)</Label>
            <Input
              id="max_speed"
              type="number"
              value={formData.max_speed}
              onChange={(e) => setFormData(prev => ({ ...prev, max_speed: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="beam_diameter">Beam Diameter (mm)</Label>
            <Input
              id="beam_diameter"
              type="number"
              step="0.01"
              value={formData.beam_diameter}
              onChange={(e) => setFormData(prev => ({ ...prev, beam_diameter: e.target.value }))}
            />
          </div>
        </>
      );
    } else if (machineType === '3d_printer') {
      return (
        <>
          <div>
            <Label htmlFor="max_build_volume_x">Build Volume X (mm)</Label>
            <Input
              id="max_build_volume_x"
              type="number"
              value={formData.max_build_volume_x}
              onChange={(e) => setFormData(prev => ({ ...prev, max_build_volume_x: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="max_build_volume_y">Build Volume Y (mm)</Label>
            <Input
              id="max_build_volume_y"
              type="number"
              value={formData.max_build_volume_y}
              onChange={(e) => setFormData(prev => ({ ...prev, max_build_volume_y: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="max_build_volume_z">Build Volume Z (mm)</Label>
            <Input
              id="max_build_volume_z"
              type="number"
              value={formData.max_build_volume_z}
              onChange={(e) => setFormData(prev => ({ ...prev, max_build_volume_z: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="nozzle_diameter">Nozzle Diameter (mm)</Label>
            <Input
              id="nozzle_diameter"
              type="number"
              step="0.01"
              value={formData.nozzle_diameter}
              onChange={(e) => setFormData(prev => ({ ...prev, nozzle_diameter: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="max_hotend_temp">Max Hotend Temp (°C)</Label>
            <Input
              id="max_hotend_temp"
              type="number"
              value={formData.max_hotend_temp}
              onChange={(e) => setFormData(prev => ({ ...prev, max_hotend_temp: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="max_bed_temp">Max Bed Temp (°C)</Label>
            <Input
              id="max_bed_temp"
              type="number"
              value={formData.max_bed_temp}
              onChange={(e) => setFormData(prev => ({ ...prev, max_bed_temp: e.target.value }))}
            />
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New {machineType.toUpperCase()} Machine</DialogTitle>
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
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
              />
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
                onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="protocol">Protocol</Label>
              <Input
                id="protocol"
                value={formData.protocol}
                onChange={(e) => setFormData(prev => ({ ...prev, protocol: e.target.value }))}
                placeholder="http, modbus, usb"
              />
            </div>
            <div>
              <Label htmlFor="endpoint_url">Endpoint URL</Label>
              <Input
                id="endpoint_url"
                value={formData.endpoint_url}
                onChange={(e) => setFormData(prev => ({ ...prev, endpoint_url: e.target.value }))}
                placeholder="http://machine-ip:port/api"
              />
            </div>
          </div>

          {renderMachineSpecificFields()}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMachineMutation.isPending}>
              {addMachineMutation.isPending ? 'Adding...' : 'Add Machine'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
