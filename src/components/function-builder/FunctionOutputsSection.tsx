import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const outputTypes = ['string', 'number', 'boolean', 'date', 'file', 'binary', 'list', 'object', 'enum', 'json'];

export const FunctionOutputsSection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [outputs, setOutputs] = useState<any[]>([]);
  const [newOutput, setNewOutput] = useState({
    output_name: '',
    output_type: 'json',
    success_structure: '{}',
    failure_structure: '{}'
  });

  useEffect(() => {
    if (functionId) {
      fetchOutputs();
    }
  }, [functionId]);

  const fetchOutputs = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_outputs')
      .select('*')
      .eq('function_id', functionId);

    if (error) {
      console.error('Error fetching outputs:', error);
      return;
    }

    setOutputs(data || []);
  };

  const handleAdd = async () => {
    if (!functionId || !newOutput.output_name) {
      toast.error('Function ID and output name are required');
      return;
    }

    try {
      const successStructure = JSON.parse(newOutput.success_structure);
      const failureStructure = JSON.parse(newOutput.failure_structure);

      const { error } = await supabase
        .from('function_outputs')
        .insert([{
          function_id: functionId,
          output_name: newOutput.output_name,
          output_type: newOutput.output_type,
          success_structure: successStructure,
          failure_structure: failureStructure
        }]);

      if (error) throw error;

      toast.success('Output added');
      fetchOutputs();
      setNewOutput({
        output_name: '',
        output_type: 'json',
        success_structure: '{}',
        failure_structure: '{}'
      });
    } catch (error) {
      console.error('Error adding output:', error);
      toast.error('Failed to add output. Check JSON format.');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('function_outputs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting output:', error);
      toast.error('Failed to delete output');
      return;
    }

    toast.success('Output deleted');
    fetchOutputs();
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to define outputs.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {outputs.map((output) => (
          <Card key={output.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-foreground">{output.output_name}</p>
                <p className="text-xs text-muted-foreground">{output.output_type}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(output.id)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Success Structure</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(output.success_structure, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Failure Structure</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(output.failure_structure, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!disabled && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-4 text-foreground">Add New Output</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Output Name</Label>
                <Input
                  value={newOutput.output_name}
                  onChange={(e) => setNewOutput({ ...newOutput, output_name: e.target.value })}
                  placeholder="result"
                />
              </div>
              <div>
                <Label>Output Type</Label>
                <Select
                  value={newOutput.output_type}
                  onValueChange={(value) => setNewOutput({ ...newOutput, output_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Success Structure (JSON)</Label>
              <Textarea
                value={newOutput.success_structure}
                onChange={(e) => setNewOutput({ ...newOutput, success_structure: e.target.value })}
                placeholder='{"status": "success", "data": {}}'
                rows={4}
              />
            </div>
            <div>
              <Label>Failure Structure (JSON)</Label>
              <Textarea
                value={newOutput.failure_structure}
                onChange={(e) => setNewOutput({ ...newOutput, failure_structure: e.target.value })}
                placeholder='{"status": "error", "message": ""}'
                rows={4}
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Output
          </Button>
        </Card>
      )}
    </div>
  );
};
