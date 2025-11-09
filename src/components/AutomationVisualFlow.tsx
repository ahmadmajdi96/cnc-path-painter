import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, FileText, Calculator, GitBranch, Code, 
  Globe, Repeat, Mail, Brain, Clock, ArrowRight, 
  CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import type { AutomationOperation } from './AutomationControlSystem';

interface AutomationVisualFlowProps {
  operations: AutomationOperation[];
}

export const AutomationVisualFlow: React.FC<AutomationVisualFlowProps> = ({ operations }) => {
  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'crud_operation': return <Database className="h-4 w-4" />;
      case 'file_operation': return <FileText className="h-4 w-4" />;
      case 'logic_conditions': return <GitBranch className="h-4 w-4" />;
      case 'run_script': return <Code className="h-4 w-4" />;
      case 'http_request': return <Globe className="h-4 w-4" />;
      case 'data_transformation': return <Repeat className="h-4 w-4" />;
      case 'messaging': return <Mail className="h-4 w-4" />;
      case 'ai_model': return <Brain className="h-4 w-4" />;
      case 'delay': return <Clock className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'valid': return 'bg-green-500/20 border-green-500';
      case 'invalid': return 'bg-red-500/20 border-red-500';
      case 'testing': return 'bg-yellow-500/20 border-yellow-500';
      default: return 'bg-muted border-border';
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        {operations.map((operation, index) => (
          <div key={operation.id} className="relative">
            <Card className={`p-4 ${getStatusColor(operation.validationStatus)}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getOperationIcon(operation.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {index + 1}. {operation.name}
                    </span>
                    {operation.validationStatus === 'valid' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {operation.validationStatus === 'invalid' && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {operation.validationStatus === 'testing' && (
                      <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />
                    )}
                  </div>
                  {operation.description && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {operation.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {operation.type.replace('_', ' ')}
                    </Badge>
                    {operation.runCondition?.enabled && (
                      <Badge variant="secondary" className="text-xs">
                        Conditional
                      </Badge>
                    )}
                    {operation.iteration?.enabled && (
                      <Badge variant="secondary" className="text-xs">
                        Loop
                      </Badge>
                    )}
                    {operation.inputMappings.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {operation.inputMappings.length} inputs
                      </Badge>
                    )}
                    {operation.outputParameters.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {operation.outputParameters.length} outputs
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Success/Failure routing indicators */}
              <div className="mt-3 pt-3 border-t flex gap-4 text-xs">
                {operation.onSuccess && operation.onSuccess.action !== 'continue' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>
                      {operation.onSuccess.action === 'goto' && 'Go to operation'}
                      {operation.onSuccess.action === 'end' && 'End'}
                      {operation.onSuccess.action === 'label' && `Jump to ${operation.onSuccess.label}`}
                    </span>
                  </div>
                )}
                {operation.onFailure && operation.onFailure.action !== 'continue' && (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-3 w-3" />
                    <span>
                      {operation.onFailure.action === 'retry' && `Retry ${operation.onFailure.retryCount}x`}
                      {operation.onFailure.action === 'compensate' && 'Compensate'}
                      {operation.onFailure.action === 'alert' && 'Alert'}
                      {operation.onFailure.action === 'goto' && 'Go to operation'}
                      {operation.onFailure.action === 'end' && 'End'}
                    </span>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Connector arrow */}
            {index < operations.length - 1 && (
              <div className="flex justify-center my-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
