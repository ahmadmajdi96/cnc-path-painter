
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Slider } from '@/components/ui/slider';

const AI_PROVIDERS = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    models: [
      { id: 'gpt-4o', name: 'GPT-4O', description: 'Most capable model' },
      { id: 'gpt-4o-mini', name: 'GPT-4O Mini', description: 'Fast and efficient' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Cost effective' }
    ],
    apiKeyName: 'OPENAI_API_KEY'
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    models: [
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast responses' }
    ],
    apiKeyName: 'ANTHROPIC_API_KEY'
  },
  { 
    id: 'google', 
    name: 'Google AI', 
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Advanced reasoning' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Multimodal capabilities' }
    ],
    apiKeyName: 'GOOGLE_AI_API_KEY'
  },
  { 
    id: 'cohere', 
    name: 'Cohere', 
    models: [
      { id: 'command', name: 'Command', description: 'General purpose' },
      { id: 'command-light', name: 'Command Light', description: 'Lightweight' }
    ],
    apiKeyName: 'COHERE_API_KEY'
  },
  { 
    id: 'huggingface', 
    name: 'Hugging Face', 
    models: [
      { id: 'custom-model', name: 'Custom Model', description: 'Use any HF model' }
    ],
    apiKeyName: 'HUGGINGFACE_API_KEY'
  },
  { 
    id: 'custom', 
    name: 'Custom Model', 
    models: [
      { id: 'custom-endpoint', name: 'Custom Endpoint', description: 'Your own API' }
    ],
    apiKeyName: 'CUSTOM_API_KEY'
  }
];

interface CreateChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatbotCreated: () => void;
}

export const CreateChatbotDialog: React.FC<CreateChatbotDialogProps> = ({
  open,
  onOpenChange,
  onChatbotCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    welcome_message: 'Hello! How can I help you today?',
    model_provider: '',
    model_name: '',
    custom_endpoint: '',
    custom_headers: '{}',
    connection_type: 'http' as 'http' | 'websocket',
    api_key_name: '',
    temperature: 0.7,
    max_tokens: 150
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const selectedProvider = AI_PROVIDERS.find(p => p.id === formData.model_provider);
  const selectedModel = selectedProvider?.models.find(m => m.id === formData.model_name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.model_provider || !formData.model_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const chatbotData = {
        ...formData,
        custom_headers: formData.custom_headers ? JSON.parse(formData.custom_headers) : {},
        api_key_name: selectedProvider?.apiKeyName || formData.api_key_name
      };

      const { error } = await supabase
        .from('chatbots')
        .insert([chatbotData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chatbot created successfully",
      });

      onChatbotCreated();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        welcome_message: 'Hello! How can I help you today?',
        model_provider: '',
        model_name: '',
        custom_endpoint: '',
        custom_headers: '{}',
        connection_type: 'http',
        api_key_name: '',
        temperature: 0.7,
        max_tokens: 150
      });
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast({
        title: "Error",
        description: "Failed to create chatbot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chatbot</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Bot Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Customer Support Bot"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Handles customer inquiries and support tickets"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="welcome_message">Welcome Message</Label>
                  <Textarea
                    id="welcome_message"
                    value={formData.welcome_message}
                    onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Model Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>AI Provider *</Label>
                  <Select
                    value={formData.model_provider}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      model_provider: value, 
                      model_name: '',
                      api_key_name: AI_PROVIDERS.find(p => p.id === value)?.apiKeyName || ''
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center gap-2">
                            <span>{provider.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {provider.models.length} models
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProvider && (
                  <div>
                    <Label>Model *</Label>
                    <Select
                      value={formData.model_name}
                      onValueChange={(value) => setFormData({ ...formData, model_name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProvider.models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div>
                              <div className="font-medium">{model.name}</div>
                              <div className="text-xs text-gray-500">{model.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Connection Type</Label>
                  <Select
                    value={formData.connection_type}
                    onValueChange={(value: 'http' | 'websocket') => 
                      setFormData({ ...formData, connection_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http">HTTP REST API</SelectItem>
                      <SelectItem value="websocket">WebSocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {(formData.model_provider === 'custom' || formData.model_provider === 'huggingface') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom_endpoint">Custom Endpoint URL</Label>
                  <Input
                    id="custom_endpoint"
                    value={formData.custom_endpoint}
                    onChange={(e) => setFormData({ ...formData, custom_endpoint: e.target.value })}
                    placeholder="https://api.your-model.com/v1/chat"
                  />
                </div>

                <div>
                  <Label htmlFor="custom_headers">Custom Headers (JSON)</Label>
                  <Textarea
                    id="custom_headers"
                    value={formData.custom_headers}
                    onChange={(e) => setFormData({ ...formData, custom_headers: e.target.value })}
                    placeholder='{"Authorization": "Bearer your-token", "Content-Type": "application/json"}'
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="api_key_name">API Key Environment Variable Name</Label>
                  <Input
                    id="api_key_name"
                    value={formData.api_key_name}
                    onChange={(e) => setFormData({ ...formData, api_key_name: e.target.value })}
                    placeholder="CUSTOM_API_KEY"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Temperature: {formData.temperature}</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.temperature]}
                    onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Focused (0)</span>
                  <span>Balanced (1)</span>
                  <span>Creative (2)</span>
                </div>
              </div>

              <div>
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  value={formData.max_tokens}
                  onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                  min={1}
                  max={4000}
                />
              </div>
            </CardContent>
          </Card>

          {selectedProvider && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>API Key Required:</strong> Make sure to set the <code>{selectedProvider.apiKeyName}</code> 
                environment variable in your Supabase Edge Function secrets for this chatbot to work.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Chatbot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
