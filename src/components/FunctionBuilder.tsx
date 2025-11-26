import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProjectId } from '@/hooks/useProjectId';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Play, Settings, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { FunctionList } from './FunctionList';
import { FunctionInfoSection } from './function-builder/FunctionInfoSection';
import { FunctionInputsSection } from './function-builder/FunctionInputsSection';
import { FunctionOutputsSection } from './function-builder/FunctionOutputsSection';
import { FunctionLogicSection } from './function-builder/FunctionLogicSection';
import { FunctionErrorHandlingSection } from './function-builder/FunctionErrorHandlingSection';

export interface FunctionData {
  id?: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  is_locked: boolean;
  version_number: string;
  editable_by: string[];
}

export const FunctionBuilder = () => {
  const { projectId } = useProjectId();
  const [functions, setFunctions] = useState<any[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [functionData, setFunctionData] = useState<FunctionData>({
    name: '',
    category: 'data_processing',
    description: '',
    tags: [],
    is_locked: false,
    version_number: '1.0.0',
    editable_by: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFunctions();
  }, [projectId]);

  useEffect(() => {
    if (selectedFunction) {
      loadFunction(selectedFunction);
    }
  }, [selectedFunction]);

  const fetchFunctions = async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('functions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFunctions(data || []);
    } catch (error) {
      console.error('Error fetching functions:', error);
      toast.error('Failed to load functions');
    }
  };

  const loadFunction = async (functionId: string) => {
    try {
      const { data, error } = await supabase
        .from('functions')
        .select('*')
        .eq('id', functionId)
        .single();

      if (error) throw error;
      setFunctionData({
        ...data,
        tags: Array.isArray(data.tags) ? data.tags.map(t => String(t)) : [],
        editable_by: Array.isArray(data.editable_by) ? data.editable_by.map(e => String(e)) : []
      });
    } catch (error) {
      console.error('Error loading function:', error);
      toast.error('Failed to load function');
    }
  };

  const handleSave = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      if (selectedFunction) {
        // Update existing function
        const { error } = await supabase
          .from('functions')
          .update(functionData)
          .eq('id', selectedFunction);

        if (error) throw error;
        toast.success('Function updated successfully');
      } else {
        // Create new function
        const { data, error } = await supabase
          .from('functions')
          .insert([{ ...functionData, project_id: projectId }])
          .select()
          .single();

        if (error) throw error;
        setSelectedFunction(data.id);
        toast.success('Function created successfully');
      }
      
      fetchFunctions();
    } catch (error) {
      console.error('Error saving function:', error);
      toast.error('Failed to save function');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedFunction(null);
    setFunctionData({
      name: '',
      category: 'data_processing',
      description: '',
      tags: [],
      is_locked: false,
      version_number: '1.0.0',
      editable_by: []
    });
  };

  const handleToggleLock = async () => {
    if (!selectedFunction) return;
    
    const newLockState = !functionData.is_locked;
    setFunctionData({ ...functionData, is_locked: newLockState });
    
    try {
      const { error } = await supabase
        .from('functions')
        .update({ is_locked: newLockState })
        .eq('id', selectedFunction);

      if (error) throw error;
      toast.success(newLockState ? 'Function locked' : 'Function unlocked');
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast.error('Failed to toggle lock');
    }
  };

  const handleDelete = async (functionId: string) => {
    try {
      const { error } = await supabase
        .from('functions')
        .delete()
        .eq('id', functionId);

      if (error) throw error;
      
      if (selectedFunction === functionId) {
        handleNew();
      }
      
      fetchFunctions();
      toast.success('Function deleted successfully');
    } catch (error) {
      console.error('Error deleting function:', error);
      toast.error('Failed to delete function');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Function Builder</h1>
          <p className="text-muted-foreground mt-1">Zero-code automation builder</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNew} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Function
          </Button>
          {selectedFunction && (
            <>
              <Button onClick={handleToggleLock} variant="outline">
                {functionData.is_locked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                {functionData.is_locked ? 'Unlock' : 'Lock'}
              </Button>
              <Button onClick={handleSave} disabled={loading || functionData.is_locked}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
          {!selectedFunction && (
            <Button onClick={handleSave} disabled={loading || !functionData.name}>
              <Save className="h-4 w-4 mr-2" />
              Create
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <FunctionList
            functions={functions}
            selectedFunction={selectedFunction}
            onSelect={setSelectedFunction}
            onDelete={handleDelete}
          />
        </div>

        <div className="col-span-9">
          <Card className="p-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="outputs">Outputs</TabsTrigger>
                <TabsTrigger value="logic">Logic</TabsTrigger>
                <TabsTrigger value="errors">Error Handling</TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <FunctionInfoSection
                  data={functionData}
                  onChange={setFunctionData}
                  disabled={functionData.is_locked}
                />
              </TabsContent>

              <TabsContent value="inputs">
                <FunctionInputsSection
                  functionId={selectedFunction}
                  disabled={functionData.is_locked}
                />
              </TabsContent>

              <TabsContent value="outputs">
                <FunctionOutputsSection
                  functionId={selectedFunction}
                  disabled={functionData.is_locked}
                />
              </TabsContent>

              <TabsContent value="logic">
                <FunctionLogicSection
                  functionId={selectedFunction}
                  disabled={functionData.is_locked}
                />
              </TabsContent>

              <TabsContent value="errors">
                <FunctionErrorHandlingSection
                  functionId={selectedFunction}
                  disabled={functionData.is_locked}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};
