
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Wrench, Zap, Printer, Bot, Eye, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComponentSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComponentSelected: (component: any) => void;
  componentType: string;
}

interface Component {
  id: string;
  name: string;
  model?: string;
  manufacturer?: string;
  status: string;
  type: string;
  ip_address?: string;
  endpoint_url?: string;
}

const componentTypeMapping = {
  cnc: { table: 'cnc_machines', icon: Wrench, label: 'CNC Machines' },
  laser: { table: 'laser_machines', icon: Zap, label: 'Laser Systems' },
  printer3d: { table: 'printer_3d', icon: Printer, label: '3D Printers' },
  robotic_arm: { table: 'robotic_arms', icon: Bot, label: 'Robotic Arms' },
  conveyor: { table: 'conveyor_belts', icon: Truck, label: 'Conveyor Belts' },
  vision_system: { table: 'hardware', icon: Eye, label: 'Vision Systems' },
};

export const ComponentSelectionDialog: React.FC<ComponentSelectionDialogProps> = ({
  open,
  onOpenChange,
  onComponentSelected,
  componentType,
}) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const componentConfig = componentTypeMapping[componentType as keyof typeof componentTypeMapping];

  useEffect(() => {
    if (open && componentConfig) {
      fetchComponents();
    }
  }, [open, componentType]);

  useEffect(() => {
    const filtered = components.filter(component =>
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (component.model && component.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (component.manufacturer && component.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredComponents(filtered);
  }, [components, searchTerm]);

  const fetchComponents = async () => {
    if (!componentConfig) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(componentConfig.table)
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching components:', error);
        toast({
          title: "Error",
          description: "Failed to load components",
          variant: "destructive",
        });
        return;
      }

      const mappedComponents = (data || []).map(item => ({
        ...item,
        type: componentType,
      }));

      setComponents(mappedComponents);
    } catch (error) {
      console.error('Error fetching components:', error);
      toast({
        title: "Error",
        description: "Failed to load components",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComponentSelect = (component: Component) => {
    onComponentSelected(component);
  };

  if (!componentConfig) {
    return null;
  }

  const Icon = componentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            Select {componentConfig.label}
          </DialogTitle>
          <DialogDescription>
            Choose an existing component to add to your workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-96">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredComponents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {components.length === 0 
                  ? `No ${componentConfig.label.toLowerCase()} found`
                  : 'No components match your search'
                }
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredComponents.map((component) => (
                  <Card
                    key={component.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleComponentSelect(component)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{component.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              {component.model && <span>{component.model}</span>}
                              {component.manufacturer && (
                                <>
                                  {component.model && <span>•</span>}
                                  <span>{component.manufacturer}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={component.status === 'active' || component.status === 'idle' ? 'default' : 'secondary'}
                          >
                            {component.status}
                          </Badge>
                          {(component.ip_address || component.endpoint_url) && (
                            <Badge variant="outline" className="text-xs">
                              Connected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
