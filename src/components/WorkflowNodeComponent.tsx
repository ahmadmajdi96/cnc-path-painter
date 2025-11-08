
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
      case 'trigger': return 'border-[hsl(142,76%,36%)] bg-gradient-to-br from-[hsl(142,76%,96%)] to-[hsl(142,76%,92%)]';
      case 'action': return 'border-[hsl(221,83%,53%)] bg-gradient-to-br from-[hsl(221,83%,96%)] to-[hsl(221,83%,92%)]';
      case 'condition': return 'border-[hsl(48,96%,53%)] bg-gradient-to-br from-[hsl(48,96%,96%)] to-[hsl(48,96%,92%)]';
      case 'delay': return 'border-[hsl(271,76%,53%)] bg-gradient-to-br from-[hsl(271,76%,96%)] to-[hsl(271,76%,92%)]';
      case 'loop': return 'border-[hsl(239,84%,67%)] bg-gradient-to-br from-[hsl(239,84%,96%)] to-[hsl(239,84%,92%)]';
      case 'end': return 'border-[hsl(0,84%,60%)] bg-gradient-to-br from-[hsl(0,84%,96%)] to-[hsl(0,84%,92%)]';
      default: return 'border-border bg-background';
    }
  };

  const NodeIcon = getNodeIcon();
  const ComponentIcon = getComponentIcon();
  
  // Check if this is an integration node to show success/failure handles
  const isIntegrationNode = data.componentType === 'integration';

  return (
    <Card className={`min-w-[350px] max-w-[350px] ${getNodeColor()} border-2 shadow-md hover:shadow-xl transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-md bg-background/50 backdrop-blur-sm border">
              <NodeIcon className="w-4 h-4 text-foreground" />
            </div>
            <span className="font-semibold text-sm text-foreground break-words">{data.label}</span>
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
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
                  ? 'bg-[hsl(142,76%,50%)] animate-pulse' 
                  : 'bg-muted-foreground'
              }`} />
              <span className="text-xs font-medium text-foreground capitalize">{data.config.status}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Handles for connections - Integration nodes have success/failure, others have all handles */}
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 !bg-primary border-2 border-background shadow-md"
      />
      
      {/* Return/Loop Back Handle - positioned at bottom left */}
      <Handle 
        type="target" 
        position={Position.Bottom} 
        id="return"
        className="w-3 h-3 !bg-[hsl(48,96%,53%)] border-2 border-background shadow-md"
        style={{ left: '25%' }}
      />
      
      {/* Output Handles */}
      {data.nodeType !== 'end' && (
        isIntegrationNode ? (
          <>
            <Handle
              type="source"
              position={Position.Right}
              id="success"
              style={{ top: '35%' }}
              className="w-3 h-3 !bg-[hsl(142,76%,50%)] border-2 border-background shadow-md"
            />
            <div className="absolute right-[-48px] text-[10px] font-medium text-[hsl(142,76%,36%)]" style={{ top: 'calc(35% - 10px)' }}>
              Success
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id="failure"
              style={{ top: '65%' }}
              className="w-3 h-3 !bg-[hsl(0,84%,60%)] border-2 border-background shadow-md"
            />
            <div className="absolute right-[-45px] text-[10px] font-medium text-[hsl(0,84%,50%)]" style={{ top: 'calc(65% - 10px)' }}>
              Failure
            </div>
          </>
        ) : (
          <>
            {/* Main output */}
            <Handle
              type="source"
              position={Position.Right}
              id="output"
              className="w-3 h-3 !bg-primary border-2 border-background shadow-md"
            />
            
            {/* Return/Loop output - positioned at bottom right */}
            <Handle 
              type="source" 
              position={Position.Bottom} 
              id="return-output"
              className="w-3 h-3 !bg-[hsl(48,96%,53%)] border-2 border-background shadow-md"
              style={{ left: '75%' }}
            />
          </>
        )
      )}
    </Card>
  );
};
