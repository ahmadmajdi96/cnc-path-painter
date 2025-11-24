import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { toast } from 'sonner';

const logicBlocks = [
  'condition',
  'loop',
  'variable_assignment',
  'calculation',
  'format',
  'transformation',
  'event_action',
  'wait_delay',
  'retry',
  'stop_function',
  'return_output'
];

export const FunctionLogicSection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [logicSteps, setLogicSteps] = useState<any[]>([]);
  const [newStep, setNewStep] = useState({
    step_id: '',
    step_type: 'condition',
    config: '{}',
    error_config: '{}'
  });

  useEffect(() => {
    if (functionId) {
      fetchLogicSteps();
    }
  }, [functionId]);

  const fetchLogicSteps = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_logic')
      .select('*')
      .eq('function_id', functionId)
      .order('position');

    if (error) {
      console.error('Error fetching logic steps:', error);
      return;
    }

    setLogicSteps(data || []);
  };

  const handleAdd = async () => {
    if (!functionId || !newStep.step_id) {
      toast.error('Function ID and step ID are required');
      return;
    }

    try {
      const config = JSON.parse(newStep.config);
      const errorConfig = JSON.parse(newStep.error_config);

      const { error } = await supabase
        .from('function_logic')
        .insert([{
          function_id: functionId,
          step_id: newStep.step_id,
          step_type: newStep.step_type,
          config,
          error_config: errorConfig,
          position: logicSteps.length
        }]);

      if (error) throw error;

      toast.success('Logic step added');
      fetchLogicSteps();
      setNewStep({
        step_id: '',
        step_type: 'condition',
        config: '{}',
        error_config: '{}'
      });
    } catch (error) {
      console.error('Error adding logic step:', error);
      toast.error('Failed to add logic step. Check JSON format.');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('function_logic')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting logic step:', error);
      toast.error('Failed to delete logic step');
      return;
    }

    toast.success('Logic step deleted');
    fetchLogicSteps();
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to add logic.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {logicSteps.map((step, index) => (
          <Card key={step.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={disabled || index === 0}>
                    <MoveUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={disabled || index === logicSteps.length - 1}>
                    <MoveDown className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{step.step_id}</p>
                  <p className="text-xs text-muted-foreground">{step.step_type}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(step.id)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Configuration</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(step.config, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!disabled && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-4 text-foreground">Add Logic Step</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Step ID</Label>
                <Input
                  value={newStep.step_id}
                  onChange={(e) => setNewStep({ ...newStep, step_id: e.target.value })}
                  placeholder="step_1"
                />
              </div>
              <div>
                <Label>Step Type</Label>
                <Select
                  value={newStep.step_type}
                  onValueChange={(value) => setNewStep({ ...newStep, step_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {logicBlocks.map((block) => (
                      <SelectItem key={block} value={block}>
                        {block.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Configuration (JSON)</Label>
              <Textarea
                value={newStep.config}
                onChange={(e) => setNewStep({ ...newStep, config: e.target.value })}
                placeholder='{"condition": "input.value > 10"}'
                rows={4}
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Logic Step
          </Button>
        </Card>
      )}
    </div>
  );
};
