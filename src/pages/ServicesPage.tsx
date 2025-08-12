
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Mail, MessageSquare, Search, Globe, Settings, Trash2, Edit } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'search' | 'notification' | 'payment' | 'analytics';
  provider: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  createdAt: string;
}

const serviceTemplates = [
  {
    type: 'email',
    name: 'Email Service',
    icon: Mail,
    providers: ['SendGrid', 'Mailgun', 'AWS SES', 'Resend', 'Nodemailer'],
    description: 'Send transactional and marketing emails',
    configFields: {
      SendGrid: ['apiKey', 'fromEmail', 'fromName'],
      Mailgun: ['apiKey', 'domain', 'fromEmail'],
      'AWS SES': ['accessKeyId', 'secretAccessKey', 'region'],
      Resend: ['apiKey', 'fromEmail'],
      Nodemailer: ['host', 'port', 'username', 'password']
    }
  },
  {
    type: 'sms',
    name: 'SMS Service',
    icon: MessageSquare,
    providers: ['Twilio', 'AWS SNS', 'Vonage', 'MessageBird'],
    description: 'Send SMS messages and notifications',
    configFields: {
      Twilio: ['accountSid', 'authToken', 'fromNumber'],
      'AWS SNS': ['accessKeyId', 'secretAccessKey', 'region'],
      Vonage: ['apiKey', 'apiSecret', 'fromNumber'],
      MessageBird: ['apiKey', 'fromNumber']
    }
  },
  {
    type: 'search',
    name: 'Search Service',
    icon: Search,
    providers: ['Elasticsearch', 'Algolia', 'Azure Search', 'Google Search'],
    description: 'Full-text search and indexing',
    configFields: {
      Elasticsearch: ['host', 'port', 'username', 'password'],
      Algolia: ['applicationId', 'apiKey', 'indexName'],
      'Azure Search': ['serviceName', 'apiKey', 'indexName'],
      'Google Search': ['apiKey', 'searchEngineId']
    }
  }
];

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    type: '',
    provider: '',
    name: '',
    config: {} as Record<string, string>
  });

  const handleCreateService = () => {
    const service: Service = {
      id: Date.now().toString(),
      name: newService.name,
      type: newService.type as any,
      provider: newService.provider,
      status: 'inactive',
      config: newService.config,
      createdAt: new Date().toISOString(),
    };

    setServices([...services, service]);
    setIsCreating(false);
    setNewService({ type: '', provider: '', name: '', config: {} });
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(services.filter(s => s.id !== serviceId));
  };

  const selectedTemplate = serviceTemplates.find(t => t.type === newService.type);
  const configFields = selectedTemplate?.configFields[newService.provider as keyof typeof selectedTemplate.configFields] || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Services</h1>
          <p className="text-gray-600">Manage email, SMS, search and other external services</p>
        </div>

        {/* Create New Service */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isCreating ? (
              <Button onClick={() => setIsCreating(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                New Service
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Select
                      value={newService.type}
                      onValueChange={(value) => setNewService({ ...newService, type: value, provider: '', config: {} })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTemplates.map((template) => (
                          <SelectItem key={template.type} value={template.type}>
                            <div className="flex items-center gap-2">
                              <template.icon className="w-4 h-4" />
                              {template.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newService.type && (
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Select
                        value={newService.provider}
                        onValueChange={(value) => setNewService({ ...newService, provider: value, config: {} })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTemplate?.providers.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Service Name</Label>
                    <Input
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="Enter service name"
                    />
                  </div>
                </div>

                {configFields.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {configFields.map((field) => (
                        <div key={field} className="space-y-2">
                          <Label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                          <Input
                            type={field.toLowerCase().includes('password') || field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                            value={newService.config[field] || ''}
                            onChange={(e) => setNewService({
                              ...newService,
                              config: { ...newService.config, [field]: e.target.value }
                            })}
                            placeholder={`Enter ${field}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateService}
                    disabled={!newService.name || !newService.type || !newService.provider}
                  >
                    Create Service
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const template = serviceTemplates.find(t => t.type === service.type);
            const Icon = template?.icon || Globe;

            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <p className="text-sm text-gray-600">{service.provider}</p>
                      </div>
                    </div>
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{template?.description}</p>
                    
                    <Separator />
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Created: {new Date(service.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {services.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Globe className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services configured</h3>
              <p>Add your first service to get started with external integrations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
