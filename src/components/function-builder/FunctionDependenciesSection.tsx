import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const dependencyTypes = [
  'database_query',
  'file_operation',
  'environment_variable',
  'http_request',
  'message_queue',
  'storage_upload_download',
  'authentication_check',
  'cache_access'
];

export const FunctionDependenciesSection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [newDep, setNewDep] = useState({
    name: '',
    type: 'http_request',
    action: '',
    timeout: 30000
  });

  useEffect(() => {
    if (functionId) {
      fetchDependencies();
    }
  }, [functionId]);

  const fetchDependencies = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_dependencies')
      .select('*')
      .eq('function_id', functionId);

    if (error) {
      console.error('Error fetching dependencies:', error);
      return;
    }

    setDependencies(data || []);
  };

  const handleAdd = async () => {
    if (!functionId || !newDep.name) {
      toast.error('Function ID and dependency name are required');
      return;
    }

    const { error } = await supabase
      .from('function_dependencies')
      .insert([{ ...newDep, function_id: functionId }]);

    if (error) {
      console.error('Error adding dependency:', error);
      toast.error('Failed to add dependency');
      return;
    }

    toast.success('Dependency added');
    fetchDependencies();
    setNewDep({
      name: '',
      type: 'http_request',
      action: '',
      timeout: 30000
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('function_dependencies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dependency:', error);
      toast.error('Failed to delete dependency');
      return;
    }

    toast.success('Dependency deleted');
    fetchDependencies();
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to add dependencies.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {dependencies.map((dep) => (
          <Card key={dep.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{dep.name}</p>
                  <p className="text-xs text-muted-foreground">{dep.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Action</p>
                  <p className="text-sm text-foreground">{dep.action || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timeout</p>
                  <p className="text-sm text-foreground">{dep.timeout}ms</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(dep.id)}
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
          <h4 className="font-medium mb-4 text-foreground">Add Dependency</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newDep.name}
                onChange={(e) => setNewDep({ ...newDep, name: e.target.value })}
                placeholder="api_call"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newDep.type}
                onValueChange={(value) => setNewDep({ ...newDep, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dependencyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Action</Label>
              <Input
                value={newDep.action}
                onChange={(e) => setNewDep({ ...newDep, action: e.target.value })}
                placeholder="GET, POST, etc."
              />
            </div>
            <div>
              <Label>Timeout (ms)</Label>
              <Input
                type="number"
                value={newDep.timeout}
                onChange={(e) => setNewDep({ ...newDep, timeout: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Dependency
          </Button>
        </Card>
      )}
    </div>
  );
};
