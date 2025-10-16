
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface VisionSystem {
  id: string;
  name: string;
  endpoint: string;
  cameraType: string;
  resolution: string;
  communicationType: 'low-latency' | 'http' | 'ftp' | 's3';
  status: 'online' | 'offline';
}

interface AddVisionSystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSystem: (system: Omit<VisionSystem, 'id' | 'status'>) => void;
}

export const AddVisionSystemDialog = ({ 
  open, 
  onOpenChange,
  onAddSystem 
}: AddVisionSystemDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    cameraType: '',
    resolution: '',
    communicationType: 'low-latency' as 'low-latency' | 'http' | 'ftp' | 's3'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.endpoint || !formData.cameraType || !formData.resolution) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onAddSystem(formData);
    setFormData({
      name: '',
      endpoint: '',
      cameraType: '',
      resolution: '',
      communicationType: 'low-latency'
    });
    
    toast({
      title: "Vision system added",
      description: "New vision system has been configured successfully"
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Vision System</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">System Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Vision System 1" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="camera-type">Camera Type</Label>
            <Select 
              value={formData.cameraType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, cameraType: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select camera type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Industrial CCD">Industrial CCD</SelectItem>
                <SelectItem value="CMOS Sensor">CMOS Sensor</SelectItem>
                <SelectItem value="Line Scan Camera">Line Scan Camera</SelectItem>
                <SelectItem value="Thermal Camera">Thermal Camera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select 
              value={formData.resolution}
              onValueChange={(value) => setFormData(prev => ({ ...prev, resolution: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                <SelectItem value="2592x1944">2592x1944 (5MP)</SelectItem>
                <SelectItem value="4096x3072">4096x3072 (12MP)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication-type">Communication Type</Label>
            <Select 
              value={formData.communicationType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, communicationType: value as any }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select communication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low-latency">Low Latency</SelectItem>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="ftp">FTP</SelectItem>
                <SelectItem value="s3">S3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">API Endpoint</Label>
            <Input 
              id="endpoint" 
              type="url" 
              value={formData.endpoint}
              onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder="http://192.168.1.100:8080/api" 
              required 
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Vision System</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
