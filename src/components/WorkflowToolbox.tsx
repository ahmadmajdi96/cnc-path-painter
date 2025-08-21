
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Square
} from 'lucide-react';

interface WorkflowToolboxProps {
  onAddNode: (nodeType: string, componentType: string) => void;
}

export const WorkflowToolbox: React.FC<WorkflowToolboxProps> = ({ onAddNode }) => {
  const componentTypes = [
    { id: 'cnc', label: 'CNC Machine', icon: Wrench, color: 'bg-blue-100 text-blue-700' },
    { id: 'laser', label: 'Laser System', icon: Zap, color: 'bg-red-100 text-red-700' },
    { id: 'printer3d', label: '3D Printer', icon: Printer, color: 'bg-green-100 text-green-700' },
    { id: 'robotic_arm', label: 'Robotic Arm', icon: Bot, color: 'bg-purple-100 text-purple-700' },
    { id: 'conveyor', label: 'Conveyor Belt', icon: Truck, color: 'bg-orange-100 text-orange-700' },
    { id: 'vision_system', label: 'Vision System', icon: Eye, color: 'bg-indigo-100 text-indigo-700' },
    { id: 'chatbot', label: 'Chatbot', icon: MessageSquare, color: 'bg-pink-100 text-pink-700' },
    { id: 'automation', label: 'Automation', icon: Cog, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'integration', label: 'Integration', icon: Database, color: 'bg-cyan-100 text-cyan-700' },
    { id: 'manual', label: 'Manual Task', icon: User, color: 'bg-gray-100 text-gray-700' },
  ];

  const nodeTypes = [
    { id: 'trigger', label: 'Trigger', icon: Circle, description: 'Start the workflow' },
    { id: 'action', label: 'Action', icon: Square, description: 'Perform an operation' },
    { id: 'condition', label: 'Condition', icon: GitBranch, description: 'Branch based on logic' },
    { id: 'delay', label: 'Delay', icon: Timer, description: 'Wait for a time period' },
    { id: 'loop', label: 'Loop', icon: RotateCcw, description: 'Repeat operations' },
    { id: 'end', label: 'End', icon: Circle, description: 'End the workflow' },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Workflow Designer</h2>
        <p className="text-sm text-gray-600 mb-4">
          Drag components to the canvas to build your automated workflow
        </p>
      </div>

      {/* Node Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Node Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <div
                key={nodeType.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onAddNode(nodeType.id, 'manual')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-sm">{nodeType.label}</span>
                </div>
                <p className="text-xs text-gray-500">{nodeType.description}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Component Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {componentTypes.map((component) => {
            const Icon = component.icon;
            return (
              <div
                key={component.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onAddNode('action', component.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-sm">{component.label}</span>
                  </div>
                  <Badge className={`text-xs ${component.color} border-0`}>
                    {component.id}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Add</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onAddNode('trigger', 'manual')}
          >
            <Circle className="w-4 h-4 mr-2" />
            Add Trigger
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onAddNode('condition', 'manual')}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Add Condition
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onAddNode('end', 'manual')}
          >
            <Circle className="w-4 h-4 mr-2" />
            Add End Node
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
