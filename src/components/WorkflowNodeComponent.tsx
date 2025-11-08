
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Circle, 
  Square, 
  GitBranch, 
  Timer, 
  RotateCcw,
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
  Link
} from 'lucide-react';

interface WorkflowNodeComponentProps {
  data: {
    label: string;
    nodeType: string;
    componentType: string;
    config?: any;
    description?: string;
    existingComponentId?: string;
  };
  selected?: boolean;
}

export const WorkflowNodeComponent: React.FC<WorkflowNodeComponentProps> = ({ data, selected }) => {
  const getNodeIcon = () => {
    switch (data.nodeType) {
      case 'trigger': return Circle;
      case 'action': return Square;
      case 'condition': return GitBranch;
      case 'delay': return Timer;
      case 'loop': return RotateCcw;
      case 'end': return Circle;
      default: return Square;
    }
  };

  const getComponentIcon = () => {
    switch (data.componentType) {
      case 'cnc': return Wrench;
      case 'laser': return Zap;
      case 'printer3d': return Printer;
      case 'robotic_arm': return Bot;
      case 'conveyor': return Truck;
      case 'vision_system': return Eye;
      case 'chatbot': return MessageSquare;
      case 'automation': return Cog;
      case 'integration': return Database;
      case 'manual': return User;
      default: return Square;
    }
  };

  const getNodeColor = () => {
    if (selected) {
      return 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20';
    }
    
    switch (data.nodeType) {
      case 'trigger': return 'border-green-400 bg-gradient-to-br from-green-50 to-green-100';
      case 'action': return 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100';
      case 'condition': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100';
      case 'delay': return 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100';
      case 'loop': return 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100';
      case 'end': return 'border-red-400 bg-gradient-to-br from-red-50 to-red-100';
      default: return 'border-border bg-background';
    }
  };

  const NodeIcon = getNodeIcon();
  const ComponentIcon = getComponentIcon();

  return (
    <Card className={`w-56 ${getNodeColor()} border-2 shadow-md hover:shadow-xl transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-md bg-background/50 backdrop-blur-sm border">
              <NodeIcon className="w-4 h-4 text-foreground" />
            </div>
            <span className="font-semibold text-sm truncate text-foreground">{data.label}</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <div className="p-1 rounded bg-background/50 backdrop-blur-sm border">
              <ComponentIcon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            {data.existingComponentId && (
              <div className="p-1 rounded bg-primary/10 backdrop-blur-sm border border-primary/20">
                <Link className="w-3 h-3 text-primary" />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
              {data.nodeType}
            </Badge>
            <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
              {data.componentType}
            </Badge>
            {data.existingComponentId && (
              <Badge className="text-xs bg-primary text-primary-foreground">
                Linked
              </Badge>
            )}
          </div>
          
          {data.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {data.description}
            </p>
          )}

          {data.config && data.config.status && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 backdrop-blur-sm border">
              <div className={`w-2 h-2 rounded-full ${
                data.config.status === 'active' || data.config.status === 'idle' 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-muted-foreground'
              }`} />
              <span className="text-xs font-medium text-foreground capitalize">{data.config.status}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Handles for connections */}
      {data.nodeType !== 'end' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-primary border-2 border-background shadow-md"
        />
      )}
      
      {data.nodeType !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-primary border-2 border-background shadow-md"
        />
      )}
    </Card>
  );
};
