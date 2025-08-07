
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Edit, 
  Trash2, 
  Play, 
  Clock, 
  FileText, 
  Database, 
  Globe, 
  Calendar,
  Webhook,
  Hand
} from 'lucide-react';
import { Automation } from './AutomationControlSystem';

interface AutomationListProps {
  automations: Automation[];
  onEdit: (automation: Automation) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onViewExecution: (automation: Automation) => void;
}

const getTriggerIcon = (triggerType: string) => {
  switch (triggerType) {
    case 'request': return Globe;
    case 'file_change': return FileText;
    case 'schedule': return Calendar;
    case 'database_change': return Database;
    case 'webhook': return Webhook;
    case 'manual': return Hand;
    default: return Clock;
  }
};

const getTriggerColor = (triggerType: string) => {
  switch (triggerType) {
    case 'request': return 'bg-blue-100 text-blue-800';
    case 'file_change': return 'bg-green-100 text-green-800';
    case 'schedule': return 'bg-purple-100 text-purple-800';
    case 'database_change': return 'bg-orange-100 text-orange-800';
    case 'webhook': return 'bg-yellow-100 text-yellow-800';
    case 'manual': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const AutomationList = ({ 
  automations, 
  onEdit, 
  onDelete, 
  onToggle,
  onViewExecution 
}: AutomationListProps) => {
  if (automations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-500 mb-4">No automations found</div>
          <p className="text-sm text-gray-400">
            Create your first automation to get started with workflow automation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {automations.map((automation) => {
        const TriggerIcon = getTriggerIcon(automation.trigger.type);
        const successRate = automation.executionCount > 0 
          ? Math.round((automation.successCount / automation.executionCount) * 100)
          : 0;
        
        return (
          <Card key={automation.id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{automation.name}</CardTitle>
                    <Switch
                      checked={automation.enabled}
                      onCheckedChange={() => onToggle(automation.id)}
                      className="ml-2"
                    />
                  </div>
                  <p className="text-gray-600">{automation.description}</p>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={`flex items-center gap-1 ${getTriggerColor(automation.trigger.type)}`}>
                      <TriggerIcon className="w-3 h-3" />
                      {automation.trigger.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    
                    <Badge variant="outline">
                      {automation.actions.length} action{automation.actions.length !== 1 ? 's' : ''}
                    </Badge>
                    
                    {automation.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewExecution(automation)}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Execution
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(automation)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(automation.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Executions</div>
                  <div className="font-semibold">{automation.executionCount}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 mb-1">Success Rate</div>
                  <div className={`font-semibold ${successRate >= 90 ? 'text-green-600' : successRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {successRate}%
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-500 mb-1">Last Executed</div>
                  <div className="font-semibold">
                    {automation.lastExecuted 
                      ? automation.lastExecuted.toLocaleString()
                      : 'Never'
                    }
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-500 mb-1">Status</div>
                  <Badge variant={automation.enabled ? "default" : "secondary"}>
                    {automation.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <strong>Trigger:</strong> {automation.trigger.type.replace('_', ' ')}
                  {automation.trigger.config.endpoint && ` - ${automation.trigger.config.endpoint}`}
                  {automation.trigger.config.cronExpression && ` - ${automation.trigger.config.cronExpression}`}
                  {automation.trigger.config.watchPath && ` - ${automation.trigger.config.watchPath}`}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <strong>Actions:</strong> {automation.actions.map(action => 
                    action.type.replace('_', ' ')
                  ).join(', ')}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
