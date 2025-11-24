import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FunctionInput {
  id?: string;
  name: string;
  data_type: string;
  required: boolean;
  default_value: any;
  source: string;
  constraints: any;
}

const dataTypes = ['string', 'number', 'boolean', 'date', 'file', 'binary', 'list', 'object', 'enum', 'json'];
const sources = ['user_input', 'database', 'file', 'http_request', 'environment_variable', 'message_queue'];

export const FunctionInputsSection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [inputs, setInputs] = useState<FunctionInput[]>([]);
  const [newInput, setNewInput] = useState<FunctionInput>({
    name: '',
    data_type: 'string',
    required: false,
    default_value: null,
    source: 'user_input',
    constraints: {}
  });

  useEffect(() => {
    if (functionId) {
      fetchInputs();
    }
  }, [functionId]);

  const fetchInputs = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_inputs')
      .select('*')
      .eq('function_id', functionId)
      .order('position');

    if (error) {
      console.error('Error fetching inputs:', error);
      return;
    }

    setInputs(data || []);
  };

  const handleAdd = async () => {
    if (!functionId || !newInput.name) {
      toast.error('Function ID and input name are required');
      return;
    }

    const { error } = await supabase
      .from('function_inputs')
      .insert([{ ...newInput, function_id: functionId, position: inputs.length }]);

    if (error) {
      console.error('Error adding input:', error);
      toast.error('Failed to add input');
      return;
    }

    toast.success('Input added');
    fetchInputs();
    setNewInput({
      name: '',
      data_type: 'string',
      required: false,
      default_value: null,
      source: 'user_input',
      constraints: {}
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('function_inputs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting input:', error);
      toast.error('Failed to delete input');
      return;
    }

    toast.success('Input deleted');
    fetchInputs();
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to add inputs.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {inputs.map((input) => (
          <Card key={input.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{input.name}</p>
                  <p className="text-xs text-muted-foreground">{input.data_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-sm text-foreground">{input.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Required</p>
                  <p className="text-sm text-foreground">{input.required ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(input.id!)}
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
          <h4 className="font-medium mb-4 text-foreground">Add New Input</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newInput.name}
                onChange={(e) => setNewInput({ ...newInput, name: e.target.value })}
                placeholder="input_name"
              />
            </div>
            <div>
              <Label>Data Type</Label>
              <Select
                value={newInput.data_type}
                onValueChange={(value) => setNewInput({ ...newInput, data_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select
                value={newInput.source}
                onValueChange={(value) => setNewInput({ ...newInput, source: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newInput.required}
                onCheckedChange={(checked) => setNewInput({ ...newInput, required: checked })}
              />
              <Label>Required</Label>
            </div>
          </div>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Input
          </Button>
        </Card>
      )}
    </div>
  );
};
