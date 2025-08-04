
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddVisionSystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddVisionSystemDialog = ({ open, onOpenChange }: AddVisionSystemDialogProps) => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <Input id="name" placeholder="Vision System 1" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="camera-type">Camera Type</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Select camera type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industrial-ccd">Industrial CCD</SelectItem>
                <SelectItem value="cmos">CMOS Sensor</SelectItem>
                <SelectItem value="line-scan">Line Scan Camera</SelectItem>
                <SelectItem value="thermal">Thermal Camera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select required>
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
            <Label htmlFor="endpoint">API Endpoint</Label>
            <Input 
              id="endpoint" 
              type="url" 
              placeholder="http://192.168.1.100:8080/api" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ip">IP Address</Label>
              <Input id="ip" placeholder="192.168.1.100" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input id="port" type="number" placeholder="8080" required />
            </div>
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
