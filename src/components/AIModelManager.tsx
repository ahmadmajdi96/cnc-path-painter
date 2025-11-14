
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Settings, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIModel {
  id: string;
  name: string;
  model_type: string;
  model_name: string;
  api_key?: string;
  endpoint_url?: string;
  system_prompt?: string;
  temperature: number;
  max_tokens: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface AIModelManagerProps {
  modelType: string;
  title: string;
  description: string;
  onModelSelect?: (model: AIModel) => void;
  selectedModelId?: string;
  projectId?: string;
}

export const AIModelManager: React.FC<AIModelManagerProps> = ({
  modelType,
  title,
  description,
  onModelSelect,
  selectedModelId,
  projectId
}) => {
  const { toast } = useToast();
  const [models, setModels] = useState<AIModel[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    model_name: '',
    api_key: '',
    endpoint_url: '',
    system_prompt: '',
    temperature: 0.7,
    max_tokens: 1000,
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadModels();
  }, [modelType, projectId]);

  const loadModels = async () => {
    setLoading(true);
    try {
      console.log('Loading models for type:', modelType);
      
      // Only fetch models for the current project
      if (!projectId) {
        setModels([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('model_type', modelType)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading models:', error);
        toast({
          title: "Error loading models",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Loaded models:', data);

      // Type cast the data to ensure proper typing
      const typedModels: AIModel[] = (data || []).map(item => ({
        ...item,
        status: (item.status === 'active' || item.status === 'inactive') ? item.status : 'active'
      }));

      setModels(typedModels);
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Error loading models", 
        description: "Failed to load models",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DEBUG: Model Creation ===');
    console.log('Original modelType prop:', modelType);
    console.log('Form data:', formData);
    
    // Validate model type before submission
    const validModelTypes = [
      'chatbot', 
      'nlp', 
      'computer_vision', 
      'face_recognition', 
      'object_detection', 
      'object_recognition', 
      'plate_recognition', 
      'quality_control', 
      'ocr',
      'vehicle_detection',
      'vehicle_recognition',
      'human_detection',
      'plate_detection',
      'plate_number_extraction',
      'speech_recognition',
      'speech_synthesis',
      'speaker_identification',
      'path_optimization',
      'cost_reduction',
      'business_analyzer',
      'decision_maker',
      'business'
    ];
    
    if (!validModelTypes.includes(modelType)) {
      console.error('Invalid model type detected:', modelType);
      toast({
        title: "Invalid model type",
        description: `Model type "${modelType}" is not supported. Valid types are: ${validModelTypes.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Ensure we're using the exact model type expected by the database
    const modelData = {
      name: formData.name,
      model_name: formData.model_name,
      model_type: modelType, // Use the modelType prop directly without any transformation
      api_key: formData.api_key || null,
      endpoint_url: formData.endpoint_url || null,
      system_prompt: formData.system_prompt || null,
      temperature: Number(formData.temperature),
      max_tokens: Number(formData.max_tokens),
      status: formData.status,
      description: description,
      project_id: projectId || null,
    };

    console.log('Final model data to submit:', modelData);
    console.log('Specifically model_type value:', modelData.model_type, 'Type:', typeof modelData.model_type);

    try {
      let savedModelId = editingModel?.id;
      
      if (editingModel) {
        console.log('Updating existing model:', editingModel.id);
        const { error } = await supabase
          .from('chatbots')
          .update(modelData)
          .eq('id', editingModel.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        toast({
          title: "Model updated",
          description: "AI model has been updated successfully"
        });
      } else {
        console.log('Creating new model with data:', modelData);
        const { error, data } = await supabase
          .from('chatbots')
          .insert([modelData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          throw error;
        }

        console.log('Model created successfully:', data);
        savedModelId = data[0]?.id;

        toast({
          title: "Model created",
          description: "New AI model has been created successfully"
        });
      }

      // Send complete model data to endpoint URL if provided
      if (formData.endpoint_url && savedModelId) {
        await sendModelDataToEndpoint(savedModelId, modelData);
      }

      setIsAddDialogOpen(false);
      setEditingModel(null);
      resetForm();
      loadModels();
    } catch (error) {
      console.error('Error saving model:', error);
      toast({
        title: "Error saving model",
        description: error instanceof Error ? error.message : "Failed to save model",
        variant: "destructive"
      });
    }
  };

  const sendModelDataToEndpoint = async (modelId: string, modelData: any) => {
    try {
      // Fetch all available datasets
      const { data: datasetsData, error: datasetsError } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      let datasets: any[] = [];
      
      if (datasetsData && datasetsData.length > 0) {
        // Fetch items for each dataset
        for (const dataset of datasetsData) {
          const { data: items } = await supabase
            .from('dataset_items')
            .select('*')
            .eq('dataset_id', dataset.id)
            .limit(100); // Limit items per dataset to avoid huge payloads
          
          datasets.push({
            ...dataset,
            items: items || []
          });
        }
      }

      // Construct the comprehensive model payload
      const payload = {
        model: {
          id: modelId,
          name: modelData.name,
          model_type: modelData.model_type,
          model_name: modelData.model_name,
          description: modelData.description,
          status: modelData.status,
          configuration: {
            temperature: modelData.temperature,
            max_tokens: modelData.max_tokens,
            system_prompt: modelData.system_prompt
          },
          credentials: {
            api_key: modelData.api_key,
            endpoint_url: modelData.endpoint_url
          },
          project_id: modelData.project_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        datasets: datasets.map(ds => ({
          id: ds.id,
          name: ds.name,
          description: ds.description,
          type: ds.type,
          mode: ds.mode,
          status: ds.status,
          item_count: ds.item_count,
          created_at: ds.created_at,
          updated_at: ds.updated_at,
          items: ds.items.map((item: any) => ({
            id: item.id,
            content: item.content,
            label: item.label,
            annotations: item.annotations,
            file_url: item.file_url,
            metadata: item.metadata,
            created_at: item.created_at
          }))
        })),
        metadata: {
          total_datasets: datasets.length,
          total_items: datasets.reduce((sum: number, ds: any) => sum + (ds.items?.length || 0), 0),
          project_id: modelData.project_id,
          timestamp: new Date().toISOString(),
          sync_version: "1.0"
        }
      };

      console.log('Sending model data to endpoint:', modelData.endpoint_url);
      console.log('Payload preview:', {
        model: payload.model.name,
        datasets_count: payload.datasets.length,
        total_items: payload.metadata.total_items
      });

      const response = await fetch(modelData.endpoint_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(modelData.api_key && { 'Authorization': `Bearer ${modelData.api_key}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Endpoint response:', result);

      toast({
        title: "Model data synced",
        description: "Model and dataset information sent to endpoint successfully"
      });
    } catch (error) {
      console.error('Error sending model data to endpoint:', error);
      toast({
        title: "Sync warning",
        description: "Model saved but failed to sync with endpoint: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
    }
  };

  const handleEdit = (model: AIModel) => {
    console.log('Editing model:', model);
    setFormData({
      name: model.name,
      model_name: model.model_name,
      api_key: model.api_key || '',
      endpoint_url: model.endpoint_url || '',
      system_prompt: model.system_prompt || '',
      temperature: model.temperature,
      max_tokens: model.max_tokens,
      status: model.status
    });
    setEditingModel(model);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      console.log('Deleting model:', id);
      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      toast({
        title: "Model deleted",
        description: "AI model has been deleted successfully"
      });
      
      loadModels();
    } catch (error) {
      console.error('Error deleting model:', error);
      toast({
        title: "Error deleting model",
        description: error instanceof Error ? error.message : "Failed to delete model",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      model_name: '',
      api_key: '',
      endpoint_url: '',
      system_prompt: '',
      temperature: 0.7,
      max_tokens: 1000,
      status: 'active'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {title} Models
          </span>
          <Button 
            size="sm" 
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Model
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading models...</div>
        ) : models.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No {title.toLowerCase()} models configured</p>
            <Button 
              className="mt-2" 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              Create your first model
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {models.map((model) => (
              <div 
                key={model.id} 
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  selectedModelId === model.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                } ${onModelSelect ? 'cursor-pointer' : ''}`}
                onClick={() => onModelSelect?.(model)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{model.name}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      model.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{model.model_name}</p>
                  {model.endpoint_url && (
                    <p className="text-xs text-gray-400">{model.endpoint_url}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(model);
                  }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(model.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen || !!editingModel} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingModel(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingModel ? 'Edit' : 'Add'} {title} Model
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Model Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My AI Model"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model_name">AI Model</Label>
                  <Select 
                    value={formData.model_name}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, model_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      <SelectItem value="llama-2">Llama 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingModel && (
                <>
                  <div>
                    <Label htmlFor="api_key">API Key</Label>
                    <Input
                      id="api_key"
                      type="password"
                      value={formData.api_key}
                      onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                      placeholder="Enter API key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endpoint_url">Endpoint URL</Label>
                    <Input
                      id="endpoint_url"
                      value={formData.endpoint_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, endpoint_url: e.target.value }))}
                      placeholder="https://api.openai.com/v1/chat/completions"
                    />
                  </div>
                </>
              )}

              {editingModel && (
                <div>
                  <Label htmlFor="system_prompt">System Prompt</Label>
                  <Input
                    id="system_prompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                    placeholder="You are a helpful AI assistant for..."
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    min="1"
                    max="8192"
                    value={formData.max_tokens}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingModel(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingModel ? 'Update' : 'Create'} Model
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
