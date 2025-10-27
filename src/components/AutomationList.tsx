import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Database, Code, FileText, Calculator, GitBranch, ArrowRight, Tag } from 'lucide-react';
import type { Automation } from './AutomationControlSystem';
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
      case 'crud_operation':
        return <Database className="h-4 w-4" />;
      case 'file_operation':
        return <FileText className="h-4 w-4" />;
      case 'mathematical_operation':
        return <Calculator className="h-4 w-4" />;
      case 'logical_operation':
        return <GitBranch className="h-4 w-4" />;
      case 'run_script':
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      database_retrieve: 'Database Retrieve',
      crud_operation: 'CRUD Operation',
      file_operation: 'File Operation',
      logical_operation: 'Logical Operation',
      mathematical_operation: 'Mathematical Operation',
      run_script: 'Run Script'
    };
    return labels[type] || type;
  };

  if (automations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No automations found. Create your first automation function.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {automations.map(automation => (
        <Card key={automation.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-lg">{automation.name}</CardTitle>
                  <Switch checked={automation.enabled} onCheckedChange={() => onToggle(automation.id)} />
                  <Badge variant={automation.enabled ? 'default' : 'secondary'}>
                    {automation.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{automation.description}</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(automation)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(automation.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{automation.operations.length} Operation{automation.operations.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Operations Flow */}
            <div className="space-y-2">
              {automation.operations.map((operation, index) => (
                <div key={operation.id} className="text-xs bg-muted/50 p-3 rounded space-y-1">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(operation.type)}
                    <span className="font-medium">{getTypeLabel(operation.type)}</span>
                    {index < automation.operations.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />}
                  </div>
                  
                  <div className="text-muted-foreground space-y-0.5 pl-6">
                    {operation.config.database && <p>DB: {operation.config.database}</p>}
                    {operation.config.table && <p>Table: {operation.config.table}</p>}
                    {operation.config.operation && <p>Op: {operation.config.operation.toUpperCase()}</p>}
                    {operation.config.fileOperation && <p>Action: {operation.config.fileOperation}</p>}
                    {operation.config.logicalOperator && <p>Operator: {operation.config.logicalOperator.toUpperCase()}</p>}
                    {operation.config.mathOperator && <p>Operator: {operation.config.mathOperator}</p>}
                    {operation.config.scriptLanguage && <p>Lang: {operation.config.scriptLanguage}</p>}
                    {operation.outputParameters.length > 0 && <p>Outputs: {operation.outputParameters.length}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Parameters Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/30 p-2 rounded">
                <p className="font-medium mb-1">Automation Inputs: {automation.inputParameters.length}</p>
                {automation.inputParameters.slice(0, 2).map(param => (
                  <p key={param.id} className="text-muted-foreground truncate">• {param.name} ({param.type})</p>
                ))}
                {automation.inputParameters.length > 2 && <p className="text-muted-foreground">+{automation.inputParameters.length - 2} more</p>}
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <p className="font-medium mb-1">Automation Outputs: {automation.outputParameters.length}</p>
                {automation.outputParameters.slice(0, 2).map(param => (
                  <p key={param.id} className="text-muted-foreground truncate">• {param.name} ({param.type})</p>
                ))}
                {automation.outputParameters.length > 2 && <p className="text-muted-foreground">+{automation.outputParameters.length - 2} more</p>}
              </div>
            </div>

            {/* Tags */}
            {automation.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {automation.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
