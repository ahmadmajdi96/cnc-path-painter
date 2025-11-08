
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Wrench, 
  Printer, 
  Bot, 
  Eye, 
  Truck, 
  MessageSquare,
  Cog,
  Database,
  User,
  Timer,
  GitBranch,
  Circle,
  RotateCcw,
  Square,
  Link,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowToolboxProps {
  onAddNode: (nodeType: string, componentType: string, specificType?: string) => void;
}

interface ComponentCount {
  total: number;
  active: number;
}

export const WorkflowToolbox: React.FC<WorkflowToolboxProps> = ({ onAddNode }) => {
  const [componentCounts, setComponentCounts] = useState<Record<string, ComponentCount>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const componentTypes = [
    { id: 'cnc', label: 'CNC Machine', icon: Wrench, color: 'bg-blue-500', table: 'cnc_machines' },
    { id: 'laser', label: 'Laser System', icon: Zap, color: 'bg-red-500', table: 'laser_machines' },
    { id: 'printer3d', label: '3D Printer', icon: Printer, color: 'bg-green-500', table: 'printer_3d' },
    { id: 'robotic_arm', label: 'Robotic Arm', icon: Bot, color: 'bg-purple-500', table: 'robotic_arms' },
    { id: 'conveyor', label: 'Conveyor Belt', icon: Truck, color: 'bg-orange-500', table: 'conveyor_belts' },
    { id: 'vision_system', label: 'Vision System', icon: Eye, color: 'bg-indigo-500', table: 'hardware', filter: { type: 'vision_system' } },
    { id: 'chatbot', label: 'Chatbot', icon: MessageSquare, color: 'bg-pink-500', table: 'chatbots' },
    { id: 'integration', label: 'Integration', icon: Database, color: 'bg-cyan-500', table: 'software' },
  ];

  const nodeTypes = [
    { id: 'trigger', label: 'Trigger', icon: Circle, description: 'Start workflow', color: 'bg-green-100 text-green-700' },
    { id: 'action', label: 'Action', icon: Square, description: 'Perform operation', color: 'bg-blue-100 text-blue-700' },
    { id: 'condition', label: 'Condition', icon: GitBranch, description: 'Branch logic', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'delay', label: 'Delay', icon: Timer, description: 'Wait period', color: 'bg-purple-100 text-purple-700' },
    { id: 'loop', label: 'Loop', icon: RotateCcw, description: 'Repeat operations', color: 'bg-indigo-100 text-indigo-700' },
    { id: 'end', label: 'End', icon: Circle, description: 'End workflow', color: 'bg-red-100 text-red-700' },
  ];

  const fetchComponentCounts = async () => {
    setLoading(true);
    const counts: Record<string, ComponentCount> = {};

    try {
      for (const component of componentTypes) {
        let count = 0;
        let activeCount = 0;

        try {
          if (component.table === 'cnc_machines') {
            const { data, count: totalCount } = await supabase.from('cnc_machines').select('id, status', { count: 'exact' });
            count = totalCount || 0;
            activeCount = data?.filter(item => item.status === 'active' || item.status === 'idle' || item.status === 'running').length || 0;
          } else if (component.table === 'laser_machines') {
            const { data, count: totalCount } = await supabase.from('laser_machines').select('id, status', { count: 'exact' });
            count = totalCount || 0;
            activeCount = data?.filter(item => item.status === 'active' || item.status === 'idle' || item.status === 'running').length || 0;
          } else if (component.table === 'printer_3d') {
            const { data, count: totalCount } = await supabase.from('printer_3d').select('id, status', { count: 'exact' });
            count = totalCount || 0;
            activeCount = data?.filter(item => item.status === 'active' || item.status === 'idle' || item.status === 'running').length || 0;
          } else if (component.table === 'robotic_arms') {
            const { data, count: totalCount } = await supabase.from('robotic_arms').select('id, status', { count: 'exact' });
            count = totalCount || 0;
            activeCount = data?.filter(item => item.status === 'active' || item.status === 'idle' || item.status === 'running').length || 0;
          } else if (component.table === 'conveyor_belts') {
            const { data, count: totalCount } = await supabase.from('conveyor_belts').select('id, status', { count: 'exact' });
            count = totalCount || 0;
            activeCount = data?.filter(item => item.status === 'stopped' || item.status === 'running').length || 0;
          } else if (component.table === 'hardware' && component.filter) {
            const { data, count: totalCount } = await supabase.from('hardware').select('id, status', { count: 'exact' }).eq('type', 'vision_system');
            count = totalCount || 0;
            activeCount = data?.filter(item => item.status === 'active').length || 0;
          } else if (component.table === 'chatbots') {
            const { data, count: totalCount } = await supabase.from('chatbots').select('id, status', { count: 'exact' });
            count = totalCount || 0;
            activeCount = data?.filter(item => item.status === 'active').length || 0;
          } else if (component.table === 'software') {
            const { data, count: totalCount } = await supabase.from('software').select('id, status', { count: 'exact' });
            count = totalCount || 0;
            activeCount = data?.filter(item => item.status === 'active').length || 0;
          }

          counts[component.id] = {
            total: count,
            active: activeCount
          };
        } catch (err) {
          counts[component.id] = { total: 0, active: 0 };
        }
      }

      setComponentCounts(counts);
    } catch (error) {
      console.error('Error fetching component counts:', error);
      toast({
        title: "Warning",
        description: "Could not load component statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponentCounts();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-foreground">Workflow Toolbox</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={fetchComponentCounts}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Drag components to build your workflow
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-2 mt-0">
            {componentTypes.map((component) => {
              const Icon = component.icon;
              const count = componentCounts[component.id];
              const hasComponents = count && count.total > 0;

              return (
                <Card 
                  key={component.id} 
                  className="overflow-hidden hover:shadow-md transition-all duration-200 group border-l-4"
                  style={{ borderLeftColor: component.color.replace('bg-', '#') }}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <div className={`p-1.5 ${component.color} text-white rounded-md`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-foreground truncate">
                              {component.label}
                            </h3>
                            {loading ? (
                              <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {count?.total || 0} available
                              </p>
                            )}
                          </div>
                        </div>
                        {!loading && count && count.active > 0 && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {count.active} active
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddNode('action', component.id)}
                          className="h-7 text-xs"
                        >
                          New
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddNode('action', 'existing', component.id)}
                          disabled={!hasComponents}
                          className="h-7 text-xs"
                        >
                          <Link className="w-3 h-3 mr-1" />
                          Existing
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="nodes" className="space-y-2 mt-0">
            {nodeTypes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <Card
                  key={nodeType.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary group"
                  onClick={() => onAddNode(nodeType.id, 'manual')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${nodeType.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {nodeType.label}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {nodeType.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        {/* Manual Task Option */}
        <Card className="mt-3 border-dashed">
          <CardContent className="p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onAddNode('action', 'manual')}
            >
              <User className="w-4 h-4 mr-2" />
              Add Manual Task
            </Button>
          </CardContent>
        </Card>

        {/* Quick Help */}
        <Card className="mt-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-3">
            <div className="text-xs space-y-1.5 text-foreground/80">
              <p className="font-semibold text-foreground">Quick Tips:</p>
              <p>• <kbd className="px-1.5 py-0.5 text-xs bg-background rounded border">Delete</kbd> to remove nodes</p>
              <p>• <kbd className="px-1.5 py-0.5 text-xs bg-background rounded border">Shift</kbd> for multi-select</p>
              <p>• Drag from handles to connect</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};