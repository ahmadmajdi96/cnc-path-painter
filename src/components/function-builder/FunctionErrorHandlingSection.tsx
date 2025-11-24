import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const retryStrategies = ['none', 'fixed', 'exponential'];
const timeoutBehaviors = ['abort', 'retry', 'fallback'];

export const FunctionErrorHandlingSection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [errorHandling, setErrorHandling] = useState<any>(null);

  useEffect(() => {
    if (functionId) {
      fetchErrorHandling();
    }
  }, [functionId]);

  const fetchErrorHandling = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_error_handling')
      .select('*')
      .eq('function_id', functionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching error handling:', error);
      return;
    }

    setErrorHandling(data || {
      retry_strategy: 'none',
      max_retries: 0,
      timeout_behavior: 'abort',
      fallback_action: '',
      return_error_format: {},
      notification: ''
    });
  };

  const handleSave = async () => {
    if (!functionId || !errorHandling) return;

    if (errorHandling.id) {
      const { error } = await supabase
        .from('function_error_handling')
        .update(errorHandling)
        .eq('id', errorHandling.id);

      if (error) {
        console.error('Error updating error handling:', error);
        toast.error('Failed to update error handling');
        return;
      }
    } else {
      const { error } = await supabase
        .from('function_error_handling')
        .insert([{ ...errorHandling, function_id: functionId }]);

      if (error) {
        console.error('Error creating error handling:', error);
        toast.error('Failed to create error handling');
        return;
      }
    }

    toast.success('Error handling saved');
    fetchErrorHandling();
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to configure error handling.</p>;
  }

  if (!errorHandling) {
    return <p className="text-muted-foreground">Loading error handling settings...</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Retry Configuration</h4>
        <div className="space-y-4">
          <div>
            <Label>Retry Strategy</Label>
            <Select
              value={errorHandling.retry_strategy}
              onValueChange={(value) => setErrorHandling({ ...errorHandling, retry_strategy: value })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {retryStrategies.map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {strategy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Max Retries</Label>
            <Input
              type="number"
              value={errorHandling.max_retries}
              onChange={(e) => setErrorHandling({ ...errorHandling, max_retries: parseInt(e.target.value) })}
              disabled={disabled}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Timeout Behavior</h4>
        <div className="space-y-4">
          <div>
            <Label>Behavior</Label>
            <Select
              value={errorHandling.timeout_behavior}
              onValueChange={(value) => setErrorHandling({ ...errorHandling, timeout_behavior: value })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeoutBehaviors.map((behavior) => (
                  <SelectItem key={behavior} value={behavior}>
                    {behavior}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fallback Action</Label>
            <Input
              value={errorHandling.fallback_action}
              onChange={(e) => setErrorHandling({ ...errorHandling, fallback_action: e.target.value })}
              placeholder="function_to_call_on_failure"
              disabled={disabled}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Error Response Format</h4>
        <Textarea
          value={JSON.stringify(errorHandling.return_error_format, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setErrorHandling({ ...errorHandling, return_error_format: parsed });
            } catch {}
          }}
          placeholder='{"error": true, "message": "", "code": ""}'
          rows={6}
          disabled={disabled}
        />
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Notification</h4>
        <Input
          value={errorHandling.notification}
          onChange={(e) => setErrorHandling({ ...errorHandling, notification: e.target.value })}
          placeholder="email@example.com or webhook_url"
          disabled={disabled}
        />
      </Card>

      {!disabled && (
        <Button onClick={handleSave}>Save Error Handling</Button>
      )}
    </div>
  );
};
