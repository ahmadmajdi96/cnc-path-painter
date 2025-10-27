import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Database, Code, FileCode } from 'lucide-react';
import { Automation } from './AutomationControlSystem';
import { Switch } from '@/components/ui/switch';

interface AutomationListProps {
  automations: Automation[];
  onEdit: (automation: Automation) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const AutomationList = ({ automations, onEdit, onDelete, onToggle }: AutomationListProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database_retrieve':
        return <Database className="w-4 h-4" />;
      case 'crud_operation':
        return <Code className="w-4 h-4" />;
      case 'run_script':
        return <FileCode className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'database_retrieve':
        return 'Database Retrieve';
      case 'crud_operation':
        return 'CRUD Operation';
      case 'run_script':
        return 'Run Script';
      default:
        return type;
    }
  };

  if (automations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No automations found. Create your first automation function.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {automations.map(automation => (
        <Card key={automation.id}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-lg">{automation.name}</CardTitle>
                  <Switch
                    checked={automation.enabled}
                    onCheckedChange={() => onToggle(automation.id)}
                  />
                  <Badge variant={automation.enabled ? 'default' : 'secondary'}>
                    {automation.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{automation.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(automation.type)}
                    {getTypeLabel(automation.type)}
                  </Badge>
                  
                  {automation.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
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
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700 mb-2">Input Parameters</div>
                {automation.inputParameters.length > 0 ? (
                  <div className="space-y-1">
                    {automation.inputParameters.map(param => (
                      <div key={param.id} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {param.type}
                        </Badge>
                        <span className="text-gray-600">{param.name}</span>
                        {param.required && <span className="text-red-500">*</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">No input parameters</span>
                )}
              </div>
              
              <div>
                <div className="font-medium text-gray-700 mb-2">Output Parameters</div>
                {automation.outputParameters.length > 0 ? (
                  <div className="space-y-1">
                    {automation.outputParameters.map(param => (
                      <div key={param.id} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {param.type}
                        </Badge>
                        <span className="text-gray-600">{param.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">No output parameters</span>
                )}
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="font-medium text-gray-700 mb-2">Configuration</div>
              <div className="text-sm text-gray-600">
                {automation.type === 'database_retrieve' && (
                  <>
                    <div><strong>Database:</strong> {automation.config.database || 'Not specified'}</div>
                    <div><strong>Query:</strong> <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{automation.config.query?.substring(0, 80)}...</code></div>
                  </>
                )}
                {automation.type === 'crud_operation' && (
                  <>
                    <div><strong>Operation:</strong> {automation.config.operation?.toUpperCase()}</div>
                    <div><strong>Table:</strong> {automation.config.table}</div>
                    {automation.config.fields && (
                      <div><strong>Fields:</strong> {automation.config.fields.join(', ')}</div>
                    )}
                  </>
                )}
                {automation.type === 'run_script' && (
                  <>
                    <div><strong>Script:</strong> {automation.config.scriptFileName || 'No file uploaded'}</div>
                    <div><strong>Language:</strong> Python</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
