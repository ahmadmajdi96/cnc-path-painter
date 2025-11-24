import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const priorities = ['low', 'normal', 'high'];

export const FunctionPerformanceSection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    if (functionId) {
      fetchPerformance();
    }
  }, [functionId]);

  const fetchPerformance = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_performance')
      .select('*')
      .eq('function_id', functionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching performance:', error);
      return;
    }

    setPerformance(data || {
      timeout_limit: 30000,
      max_payload_size: 1048576,
      concurrency_limit: 10,
      rate_limit: 100,
      priority: 'normal'
    });
  };

  const handleSave = async () => {
    if (!functionId || !performance) return;

    if (performance.id) {
      const { error } = await supabase
        .from('function_performance')
        .update(performance)
        .eq('id', performance.id);

      if (error) {
        console.error('Error updating performance:', error);
        toast.error('Failed to update performance settings');
        return;
      }
    } else {
      const { error } = await supabase
        .from('function_performance')
        .insert([{ ...performance, function_id: functionId }]);

      if (error) {
        console.error('Error creating performance:', error);
        toast.error('Failed to create performance settings');
        return;
      }
    }

    toast.success('Performance settings saved');
    fetchPerformance();
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to configure performance.</p>;
  }

  if (!performance) {
    return <p className="text-muted-foreground">Loading performance settings...</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Performance Settings</h4>
        <div className="space-y-4">
          <div>
            <Label>Timeout Limit (ms)</Label>
            <Input
              type="number"
              value={performance.timeout_limit}
              onChange={(e) => setPerformance({ ...performance, timeout_limit: parseInt(e.target.value) })}
              disabled={disabled}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Maximum execution time in milliseconds</p>
          </div>

          <div>
            <Label>Max Payload Size (bytes)</Label>
            <Input
              type="number"
              value={performance.max_payload_size}
              onChange={(e) => setPerformance({ ...performance, max_payload_size: parseInt(e.target.value) })}
              disabled={disabled}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Maximum size of request/response payload</p>
          </div>

          <div>
            <Label>Concurrency Limit</Label>
            <Input
              type="number"
              value={performance.concurrency_limit}
              onChange={(e) => setPerformance({ ...performance, concurrency_limit: parseInt(e.target.value) })}
              disabled={disabled}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Maximum number of concurrent executions</p>
          </div>

          <div>
            <Label>Rate Limit (requests/min)</Label>
            <Input
              type="number"
              value={performance.rate_limit}
              onChange={(e) => setPerformance({ ...performance, rate_limit: parseInt(e.target.value) })}
              disabled={disabled}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Maximum requests per minute</p>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={performance.priority}
              onValueChange={(value) => setPerformance({ ...performance, priority: value })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {!disabled && (
        <Button onClick={handleSave}>Save Performance Settings</Button>
      )}
    </div>
  );
};
