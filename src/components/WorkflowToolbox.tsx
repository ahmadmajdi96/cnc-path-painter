
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
  Database,
  Link,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowToolboxProps {
  onAddNode: (nodeType: string, componentType: string, specificType?: string, filterType?: string) => void;
}

interface ComponentCount {
  total: number;
  active: number;
}

interface AIModelFilter {
  type: string;
  count: number;
}

export const WorkflowToolbox: React.FC<WorkflowToolboxProps> = ({ onAddNode }) => {
  const [componentCounts, setComponentCounts] = useState<Record<string, ComponentCount>>({});
  const [aiModelFilters, setAiModelFilters] = useState<AIModelFilter[]>([]);
  const [selectedAIModelType, setSelectedAIModelType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const componentTypes = [
    { id: 'cnc', label: 'CNC Machine', icon: Wrench, color: 'bg-blue-500', table: 'cnc_machines', portal: 'hardware' },
    { id: 'laser', label: 'Laser System', icon: Zap, color: 'bg-red-500', table: 'laser_machines', portal: 'hardware' },
    { id: 'printer3d', label: '3D Printer', icon: Printer, color: 'bg-green-500', table: 'printer_3d', portal: 'hardware' },
    { id: 'robotic_arm', label: 'Robotic Arm', icon: Bot, color: 'bg-purple-500', table: 'robotic_arms', portal: 'hardware' },
    { id: 'conveyor', label: 'Conveyor Belt', icon: Truck, color: 'bg-orange-500', table: 'conveyor_belts', portal: 'hardware' },
    { id: 'vision_system', label: 'Vision System', icon: Eye, color: 'bg-indigo-500', table: 'hardware', filter: { type: 'vision_system' }, portal: 'hardware' },
    { id: 'chatbot', label: 'Chatbot', icon: MessageSquare, color: 'bg-pink-500', table: 'chatbots', portal: 'ai' },
    { id: 'ai_model', label: 'AI Model', icon: MessageSquare, color: 'bg-violet-500', table: 'datasets', portal: 'ai' },
    { id: 'integration', label: 'Integration', icon: Database, color: 'bg-cyan-500', table: 'software', portal: 'software' },
  ];

  const [selectedPortal, setSelectedPortal] = useState<'hardware' | 'software' | 'ai'>('hardware');

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
          } else if (component.table === 'datasets') {
            const { data, count: totalCount } = await supabase.from('datasets').select('id, name, type', { count: 'exact' });
            count = totalCount || 0;
            activeCount = count; // All datasets are considered active for now
            
            // Get AI model type filters based on actual type field from datasets
            if (data) {
              const typeGroups = data.reduce((acc, item) => {
                const type = item.type || 'other';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              const filters = Object.entries(typeGroups)
                .map(([type, count]) => ({
                  type,
                  count
                }))
                .sort((a, b) => b.count - a.count); // Sort by count descending
              
              setAiModelFilters(filters);
            }
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

  const filteredComponents = componentTypes.filter(comp => comp.portal === selectedPortal);

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
        {/* Portal Filter */}
        <div className="mb-4">
          <Tabs value={selectedPortal} onValueChange={(value) => setSelectedPortal(value as 'hardware' | 'software' | 'ai')} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hardware">Hardware</TabsTrigger>
              <TabsTrigger value="software">Software</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* AI Model Type Filter */}
        {selectedPortal === 'ai' && aiModelFilters.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">AI Model Type</label>
            <select 
              value={selectedAIModelType}
              onChange={(e) => setSelectedAIModelType(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Types ({componentCounts.ai_model?.total || 0})</option>
              <option value="computer_vision">Computer Vision</option>
              <option value="ocr">OCR</option>
              <option value="quality_control">Quality Control</option>
              <option value="object_detection">Object Detection</option>
              <option value="object_recognition">Object Recognition</option>
              <option value="face_recognition">Face Recognition</option>
              <option value="plate_recognition">Plate Recognition</option>
              <option value="nlp">NLP</option>
              <option value="chatbots">Chat Bots</option>
            </select>
          </div>
        )}

        {/* Components List */}
        <div className="space-y-2">
          {filteredComponents.map((component) => {
              const Icon = component.icon;
              const count = componentCounts[component.id];
              const hasComponents = count && count.total > 0;
              
              // Skip AI model filter display if it's the generic ai_model entry
              if (component.id === 'ai_model' && selectedPortal === 'ai') {
                return null;
              }

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

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddNode('action', 'existing', component.id)}
                        disabled={!hasComponents}
                        className="h-7 text-xs w-full"
                      >
                        <Link className="w-3 h-3 mr-1" />
                        Add to Workflow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          
          {/* AI Models Card when portal is AI */}
          {selectedPortal === 'ai' && (
            <Card 
              className="overflow-hidden hover:shadow-md transition-all duration-200 group border-l-4 border-l-violet-500"
            >
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="p-1.5 bg-violet-500 text-white rounded-md">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          AI Models
                        </h3>
                        {loading ? (
                          <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {selectedAIModelType === 'all' 
                              ? `${componentCounts.ai_model?.total || 0} available`
                              : `${aiModelFilters.find(f => f.type === selectedAIModelType)?.count || 0} available`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    {!loading && componentCounts.ai_model && componentCounts.ai_model.active > 0 && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        {componentCounts.ai_model.active} active
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddNode('action', 'existing', 'ai_model', selectedAIModelType)}
                    disabled={!componentCounts.ai_model || componentCounts.ai_model.total === 0}
                    className="h-7 text-xs w-full"
                  >
                    <Link className="w-3 h-3 mr-1" />
                    Add to Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Help */}
        <Card className="mt-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-3">
            <div className="text-xs space-y-1.5 text-foreground/80">
              <p className="font-semibold text-foreground">Quick Tips:</p>
              <p>• Select components from {selectedPortal} portal</p>
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