
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
      return 'border-blue-500 bg-blue-50 shadow-md';
    }
    
    switch (data.nodeType) {
      case 'trigger': return 'border-green-300 bg-green-50';
      case 'action': return 'border-blue-300 bg-blue-50';
      case 'condition': return 'border-yellow-300 bg-yellow-50';
      case 'delay': return 'border-purple-300 bg-purple-50';
      case 'loop': return 'border-indigo-300 bg-indigo-50';
      case 'end': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const NodeIcon = getNodeIcon();
  const ComponentIcon = getComponentIcon();

  return (
    <Card className={`w-48 ${getNodeColor()} border-2 shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <NodeIcon className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-sm truncate">{data.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <ComponentIcon className="w-4 h-4 text-gray-500" />
            {data.existingComponentId && (
              <div className="w-3 h-3 text-blue-500">
                <Link className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {data.nodeType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.componentType}
            </Badge>
            {data.existingComponentId && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Linked
              </Badge>
            )}
          </div>
          
          {data.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {data.description}
            </p>
          )}

          {data.config && data.config.status && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                data.config.status === 'active' || data.config.status === 'idle' 
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-500">{data.config.status}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Handles for connections */}
      {data.nodeType !== 'end' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-blue-500 border-2 border-white"
        />
      )}
      
      {data.nodeType !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-blue-500 border-2 border-white"
        />
      )}
    </Card>
  );
};
