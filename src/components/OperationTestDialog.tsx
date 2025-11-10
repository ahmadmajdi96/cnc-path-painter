import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import type { AutomationOperation } from './AutomationControlSystem';

interface OperationTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: AutomationOperation | null;
  onValidationComplete: (operationId: string, isValid: boolean, message: string) => void;
}

export const OperationTestDialog: React.FC<OperationTestDialogProps> = ({
  open,
  onOpenChange,
  operation,
  onValidationComplete,
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const runTest = async () => {
    if (!operation) return;

    setTesting(true);
    setTestResult(null);

    // Simulate testing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Perform validation based on operation type
    let isValid = true;
    let message = '';

    switch (operation.type) {
      case 'crud_operation':
        if (!operation.config.database || !operation.config.table || !operation.config.operation) {
          isValid = false;
          message = 'Missing required fields: database, table, or operation type';
        } else {
          message = `CRUD operation validated: ${operation.config.operation} on ${operation.config.database}.${operation.config.table}`;
        }
        break;

      case 'file_operation':
        if (!operation.config.fileOperation) {
          isValid = false;
          message = 'Missing file operation type';
        } else if (operation.config.fileOperation === 'download' && !operation.config.downloadProtocol) {
          isValid = false;
          message = 'Missing download protocol for file download operation';
        } else {
          message = `File operation validated: ${operation.config.fileOperation}`;
        }
        break;

      case 'http_request':
        if (!operation.config.httpRequestUrl || !operation.config.httpRequestMethod) {
          isValid = false;
          message = 'Missing required fields: URL or HTTP method';
        } else {
          try {
            new URL(operation.config.httpRequestUrl);
            message = `HTTP request validated: ${operation.config.httpRequestMethod} ${operation.config.httpRequestUrl}`;
          } catch {
            isValid = false;
            message = 'Invalid URL format';
          }
        }
        break;

      case 'run_script':
        if (!operation.config.scriptLanguage || !operation.config.scriptContent) {
          isValid = false;
          message = 'Missing script language or content';
        } else {
          message = `Script validated: ${operation.config.scriptLanguage} script with ${operation.config.scriptContent.length} characters`;
        }
        break;


      case 'delay':
        if (!operation.config.delayDuration || !operation.config.delayUnit) {
          isValid = false;
          message = 'Missing delay duration or unit';
        } else {
          message = `Delay operation validated: ${operation.config.delayDuration} ${operation.config.delayUnit}`;
        }
        break;

      case 'manual_operation':
        message = 'Manual operation - requires human intervention';
        break;

      default:
        message = `Operation type "${operation.type}" validated`;
    }

    setTestResult({ success: isValid, message });
    setTesting(false);
    onValidationComplete(operation.id, isValid, message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Test Operation</DialogTitle>
        </DialogHeader>
        
        {operation && (
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold mb-1">{operation.name}</div>
              <Badge variant="outline">{operation.type.replace('_', ' ')}</Badge>
            </div>

            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                <div className="flex items-start gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5" />
                  )}
                  <AlertDescription className="flex-1">
                    {testResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {!testResult && !testing && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click "Run Test" to validate this operation's configuration.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={runTest} disabled={testing}>
                {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {testing ? 'Testing...' : 'Run Test'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
