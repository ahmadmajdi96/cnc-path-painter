import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const triggerTypes = [
  'http_request',
  'schedule',
  'database_change',
  'file_event',
  'queue_message',
  'ui_action',
  'webhook_callback'
];

export const FunctionTriggersSection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [triggers, setTriggers] = useState<any[]>([]);
  const [newTrigger, setNewTrigger] = useState({
    trigger_type: 'http_request',
    authentication_required: true
  });

  useEffect(() => {
    if (functionId) {
      fetchTriggers();
    }
  }, [functionId]);

  const fetchTriggers = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_triggers')
      .select('*')
      .eq('function_id', functionId);

    if (error) {
      console.error('Error fetching triggers:', error);
      return;
    }

    setTriggers(data || []);
  };

  const handleAdd = async () => {
    if (!functionId) {
      toast.error('Function ID is required');
      return;
    }

    const { error } = await supabase
      .from('function_triggers')
      .insert([{ ...newTrigger, function_id: functionId }]);

    if (error) {
      console.error('Error adding trigger:', error);
      toast.error('Failed to add trigger');
      return;
    }

    toast.success('Trigger added');
    fetchTriggers();
    setNewTrigger({
      trigger_type: 'http_request',
      authentication_required: true
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('function_triggers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting trigger:', error);
      toast.error('Failed to delete trigger');
      return;
    }

    toast.success('Trigger deleted');
    fetchTriggers();
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to add triggers.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {triggers.map((trigger) => (
          <Card key={trigger.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{trigger.trigger_type}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Auth Required: {trigger.authentication_required ? 'Yes' : 'No'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(trigger.id)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!disabled && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-4 text-foreground">Add Trigger</h4>
          <div className="space-y-4">
            <div>
              <Label>Trigger Type</Label>
              <Select
                value={newTrigger.trigger_type}
                onValueChange={(value) => setNewTrigger({ ...newTrigger, trigger_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newTrigger.authentication_required}
                onCheckedChange={(checked) => setNewTrigger({ ...newTrigger, authentication_required: checked })}
              />
              <Label>Require Authentication</Label>
            </div>
          </div>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Trigger
          </Button>
        </Card>
      )}
    </div>
  );
};
