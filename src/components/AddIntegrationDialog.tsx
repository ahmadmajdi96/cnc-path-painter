import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X, ArrowRight } from 'lucide-react';
import { Integration, AutomationStep } from './IntegrationControlSystem';
import { Badge } from '@/components/ui/badge';

interface AddIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) => void;
  projectId?: string;
}

interface Parameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
}

interface VariableMapping {
  id: string;
  sourceField: string;
  targetField: string;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  config: any;
  inputParameters: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
  }>;
  outputParameters: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
  }>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const AddIntegrationDialog: React.FC<AddIntegrationDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  projectId
}) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'inactive' as 'active' | 'inactive' | 'testing' | 'error',
    resultDestination: 'client' as 'client' | 'forward',
    configuration: {
      host: '',
      port: 80,
      protocol: '',
      auth: { type: 'none' as const, credentials: {} }
    },
    sourceEndpoint: {
      protocol: '',
      auth: { type: 'none' as const, credentials: {} }
    },
    targetEndpoint: {
      protocol: '',
      host: '',
      port: 80,
      path: '',
      auth: { type: 'none' as const, credentials: {} }
    },
    parameters: {
      timeout: 30000,
      retryAttempts: 3,
      dataFormat: 'json' as 'json' | 'xml' | 'binary' | 'text',
      mappingRules: []
    }
  });

  const [receiveDataType, setReceiveDataType] = useState<'json' | 'xml' | 'binary' | 'text'>('json');
  const [sendDataType, setSendDataType] = useState<'json' | 'xml' | 'binary' | 'text'>('json');
  const [expectedParameters, setExpectedParameters] = useState<Parameter[]>([]);
  const [variableMappings, setVariableMappings] = useState<VariableMapping[]>([]);
  const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([]);
  const [outputMappings, setOutputMappings] = useState<Array<{
    id: string;
    sourceType: 'integration' | 'step';
    sourceStepId?: string;
    sourceField: string;
    targetField: string;
  }>>([]);

  useEffect(() => {
    // Load mock automations - in production, fetch from your backend
    const mockAutomations: Automation[] = [
      {
        id: '1',
        name: 'Get User Data',
        description: 'Retrieve user information from database',
        type: 'database_retrieve',
        enabled: true,
        config: { query: 'SELECT * FROM users WHERE id = $1', database: 'main_db' },
        inputParameters: [{ id: 'p1', name: 'userId', type: 'string', required: true }],
        outputParameters: [{ id: 'o1', name: 'userData', type: 'object', required: true }],
        tags: ['database'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Update Product Status',
        description: 'Update product status in inventory',
        type: 'crud_operation',
        enabled: true,
        config: { operation: 'update', table: 'products', fields: ['status'] },
        inputParameters: [
          { id: 'p1', name: 'productId', type: 'string', required: true },
          { id: 'p2', name: 'status', type: 'string', required: true }
        ],
        outputParameters: [{ id: 'o1', name: 'success', type: 'boolean', required: true }],
        tags: ['crud'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setAutomations(mockAutomations);
  }, []);

  const protocols = [
    'REST_API', 'SOAP', 'GraphQL', 'MQTT', 'AMQP', 'WebSocket',
    'OPC_UA', 'Modbus_TCP', 'Modbus_RTU', 'EtherNet_IP', 'PROFINET',
    'HTTP', 'HTTPS', 'FTP', 'SFTP', 'TCP', 'UDP', 'gRPC',
    'Kafka', 'RabbitMQ', 'Redis', 'CoAP', 'LoRaWAN'
  ];

  const authTypes = [
    { value: 'none', label: 'None' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'api_key', label: 'API Key' },
    { value: 'certificate', label: 'Client Certificate' },
    { value: 'digest', label: 'Digest Auth' }
  ];

  const dataTypes = [
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'binary', label: 'Binary' },
    { value: 'text', label: 'Plain Text' }
  ];

  const parameterTypes = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'object', label: 'Object' },
    { value: 'array', label: 'Array' }
  ];

  const getProtocolDefaults = (protocol: string) => {
    const defaults: { port: number; auth: string } = { port: 80, auth: 'none' };
    
    switch (protocol) {
      case 'HTTP':
        defaults.port = 80;
        defaults.auth = 'basic';
        break;
      case 'HTTPS':
        defaults.port = 443;
        defaults.auth = 'bearer';
        break;
      case 'Modbus_TCP':
        defaults.port = 502;
        defaults.auth = 'none';
        break;
      case 'MQTT':
        defaults.port = 1883;
        defaults.auth = 'basic';
        break;
      case 'OPC_UA':
        defaults.port = 4840;
        defaults.auth = 'certificate';
        break;
      case 'SOAP':
        defaults.port = 80;
        defaults.auth = 'basic';
        break;
      case 'REST_API':
        defaults.port = 443;
        defaults.auth = 'bearer';
        break;
      case 'WebSocket':
        defaults.port = 443;
        defaults.auth = 'bearer';
        break;
      case 'FTP':
        defaults.port = 21;
        defaults.auth = 'basic';
        break;
      case 'SFTP':
        defaults.port = 22;
        defaults.auth = 'basic';
        break;
      case 'TCP':
        defaults.port = 8080;
        defaults.auth = 'none';
        break;
      case 'UDP':
        defaults.port = 8080;
        defaults.auth = 'none';
        break;
      case 'AMQP':
        defaults.port = 5672;
        defaults.auth = 'basic';
        break;
      case 'Kafka':
        defaults.port = 9092;
        defaults.auth = 'none';
        break;
      case 'RabbitMQ':
        defaults.port = 5672;
        defaults.auth = 'basic';
        break;
      case 'Redis':
        defaults.port = 6379;
        defaults.auth = 'basic';
        break;
      case 'CoAP':
        defaults.port = 5683;
        defaults.auth = 'none';
        break;
      case 'gRPC':
        defaults.port = 50051;
        defaults.auth = 'bearer';
        break;
      default:
        defaults.port = 80;
        defaults.auth = 'none';
    }
    
    return defaults;
  };

  const addParameter = () => {
    setExpectedParameters([
      ...expectedParameters,
      {
        id: Date.now().toString(),
        name: '',
        type: 'string',
        required: false,
        description: ''
      }
    ]);
  };

  const updateParameter = (id: string, field: keyof Parameter, value: any) => {
    setExpectedParameters(prev =>
      prev.map(param => param.id === id ? { ...param, [field]: value } : param)
    );
  };

  const removeParameter = (id: string) => {
    setExpectedParameters(prev => prev.filter(param => param.id !== id));
  };

  const addVariableMapping = () => {
    setVariableMappings([
      ...variableMappings,
      {
        id: Date.now().toString(),
        sourceField: '',
        targetField: ''
      }
    ]);
  };

  const updateVariableMapping = (id: string, field: keyof VariableMapping, value: string) => {
    setVariableMappings(prev =>
      prev.map(mapping => mapping.id === id ? { ...mapping, [field]: value } : mapping)
    );
  };

  const removeVariableMapping = (id: string) => {
    setVariableMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  const addAutomationStep = () => {
    const newStep: AutomationStep = {
      id: Date.now().toString(),
      automationId: '',
      automationName: '',
      order: automationSteps.length + 1,
      variableMappings: []
    };
    setAutomationSteps([...automationSteps, newStep]);
  };

  const updateAutomationStep = (id: string, field: string, value: any) => {
    setAutomationSteps(automationSteps.map(step => {
      if (step.id === id) {
        if (field === 'automationId') {
          const automation = automations.find(a => a.id === value);
          return { ...step, automationId: value, automationName: automation?.name || '' };
        }
        return { ...step, [field]: value };
      }
      return step;
    }));
  };

  const removeAutomationStep = (id: string) => {
    setAutomationSteps(automationSteps.filter(s => s.id !== id).map((step, index) => ({
      ...step,
      order: index + 1
    })));
  };

  const addStepVariableMapping = (stepId: string) => {
    const step = automationSteps.find(s => s.id === stepId);
    if (!step) return;
    
    const newMapping = {
      id: Date.now().toString(),
      sourceType: 'integration' as const,
      sourceField: '',
      targetParameter: ''
    };
    
    updateAutomationStep(stepId, 'variableMappings', [...step.variableMappings, newMapping]);
  };

  const updateStepVariableMapping = (stepId: string, mappingId: string, field: string, value: any) => {
    const step = automationSteps.find(s => s.id === stepId);
    if (!step) return;
    
    const updatedMappings = step.variableMappings.map(m => 
      m.id === mappingId ? { ...m, [field]: value } : m
    );
    
    updateAutomationStep(stepId, 'variableMappings', updatedMappings);
  };

  const removeStepVariableMapping = (stepId: string, mappingId: string) => {
    const step = automationSteps.find(s => s.id === stepId);
    if (!step) return;
    
    updateAutomationStep(stepId, 'variableMappings', step.variableMappings.filter(m => m.id !== mappingId));
  };

  const addOutputMapping = () => {
    const newMapping = {
      id: Date.now().toString(),
      sourceType: 'integration' as const,
      sourceField: '',
      targetField: ''
    };
    setOutputMappings([...outputMappings, newMapping]);
  };

  const updateOutputMapping = (id: string, field: string, value: any) => {
    setOutputMappings(outputMappings.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeOutputMapping = (id: string) => {
    setOutputMappings(outputMappings.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const integrationData = {
      ...formData,
      automationSteps,
      outputMappings,
      dataConfiguration: {
        receiveDataType,
        sendDataType,
        expectedParameters,
        variableMappings
      },
      liveData: {
        receivedCount: 0,
        sentCount: 0,
        errors: []
      }
    };
    
    onAdd(integrationData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      status: 'inactive',
      resultDestination: 'client',
      configuration: {
        host: '',
        port: 80,
        protocol: '',
        auth: { type: 'none', credentials: {} }
      },
      sourceEndpoint: {
        protocol: '',
        auth: { type: 'none', credentials: {} }
      },
      targetEndpoint: {
        protocol: '',
        host: '',
        port: 80,
        path: '',
        auth: { type: 'none', credentials: {} }
      },
      parameters: {
        timeout: 30000,
        retryAttempts: 3,
        dataFormat: 'json',
        mappingRules: []
      }
    });
    setReceiveDataType('json');
    setSendDataType('json');
    setExpectedParameters([]);
    setVariableMappings([]);
    setAutomationSteps([]);
    setOutputMappings([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Integration</DialogTitle>
          <DialogDescription>
            Create a new integration between two systems
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="resultDestination">Result Destination</Label>
                <Select
                  value={formData.resultDestination}
                  onValueChange={(value: 'client' | 'forward') => setFormData({ ...formData, resultDestination: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Return to Client</SelectItem>
                    <SelectItem value="forward">Forward to Target Endpoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Protocol</Label>
                  <Select
                    value={formData.configuration.protocol}
                    onValueChange={(value) => {
                      const defaults = getProtocolDefaults(value);
                      setFormData({
                        ...formData,
                        configuration: { 
                          ...formData.configuration, 
                          protocol: value,
                          port: defaults.port,
                          auth: { type: defaults.auth as any, credentials: {} }
                        }
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {protocols.map(protocol => (
                        <SelectItem key={protocol} value={protocol}>
                          {protocol.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Authentication</Label>
                  <Select
                    value={formData.configuration.auth.type}
                    onValueChange={(value: typeof formData.configuration.auth.type) => setFormData({
                      ...formData,
                      configuration: { 
                        ...formData.configuration, 
                        auth: { type: value, credentials: {} }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {authTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Host</Label>
                  <Input
                    value={formData.configuration.host}
                    onChange={(e) => setFormData({
                      ...formData,
                      configuration: { ...formData.configuration, host: e.target.value }
                    })}
                    placeholder="hostname or IP address"
                    required
                  />
                </div>
                
                <div>
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={formData.configuration.port}
                    onChange={(e) => setFormData({
                      ...formData,
                      configuration: { ...formData.configuration, port: parseInt(e.target.value) }
                    })}
                    required
                  />
                </div>
              </div>
              
              {formData.configuration.auth.type !== 'none' && (
                <div className="p-3 bg-gray-50 rounded">
                  <Label className="text-sm text-gray-600 mb-2 block">
                    Authentication credentials will be configured after creation
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          {formData.resultDestination === 'forward' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Target Endpoint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Protocol</Label>
                  <Select
                    value={formData.targetEndpoint.protocol}
                    onValueChange={(value) => {
                      const defaults = getProtocolDefaults(value);
                      setFormData({
                        ...formData,
                        targetEndpoint: { 
                          ...formData.targetEndpoint, 
                          protocol: value,
                          port: defaults.port,
                          auth: { type: defaults.auth as any, credentials: {} }
                        }
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {protocols.map(protocol => (
                        <SelectItem key={protocol} value={protocol}>
                          {protocol.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Host</Label>
                    <Input
                      value={formData.targetEndpoint.host}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetEndpoint: { ...formData.targetEndpoint, host: e.target.value }
                      })}
                      placeholder="hostname or IP address"
                      required={formData.resultDestination === 'forward'}
                    />
                  </div>
                  
                  <div>
                    <Label>Port</Label>
                    <Input
                      type="number"
                      value={formData.targetEndpoint.port}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetEndpoint: { ...formData.targetEndpoint, port: parseInt(e.target.value) }
                      })}
                      required={formData.resultDestination === 'forward'}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Authentication</Label>
                  <Select
                    value={formData.targetEndpoint.auth.type}
                    onValueChange={(value: typeof formData.targetEndpoint.auth.type) => setFormData({
                      ...formData,
                      targetEndpoint: { 
                        ...formData.targetEndpoint, 
                        auth: { type: value, credentials: {} }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {authTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.targetEndpoint.auth.type !== 'none' && (
                  <div className="p-3 bg-gray-50 rounded">
                    <Label className="text-sm text-gray-600 mb-2 block">
                      Authentication credentials will be configured after creation
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Configuration</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Receive Data Type</Label>
                <Select
                  value={receiveDataType}
                  onValueChange={(value: 'json' | 'xml' | 'binary' | 'text') => setReceiveDataType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Send Data Type</Label>
                <Select
                  value={sendDataType}
                  onValueChange={(value: 'json' | 'xml' | 'binary' | 'text') => setSendDataType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Expected Parameters</CardTitle>
                <Button type="button" onClick={addParameter} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Parameter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {expectedParameters.map((param) => (
                <div key={param.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={param.name}
                      onChange={(e) => updateParameter(param.id, 'name', e.target.value)}
                      placeholder="Parameter name"
                    />
                  </div>
                  
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={param.type}
                      onValueChange={(value: typeof param.type) => updateParameter(param.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {parameterTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) => updateParameter(param.id, 'required', e.target.checked)}
                      className="mr-2"
                    />
                    <Label>Required</Label>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={param.description || ''}
                      onChange={(e) => updateParameter(param.id, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeParameter(param.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {expectedParameters.length === 0 && (
                <p className="text-gray-500 text-center py-4">No parameters defined</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Variable Mappings</CardTitle>
                <Button type="button" onClick={addVariableMapping} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {variableMappings.map((mapping) => (
                <div key={mapping.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Source Field</Label>
                    <Select
                      value={mapping.sourceField}
                      onValueChange={(value) => updateVariableMapping(mapping.id, 'sourceField', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parameter" />
                      </SelectTrigger>
                      <SelectContent>
                        {expectedParameters.filter(p => p.name).map(param => (
                          <SelectItem key={param.id} value={param.name}>
                            {param.name} ({param.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Target Field</Label>
                    <Input
                      value={mapping.targetField}
                      onChange={(e) => updateVariableMapping(mapping.id, 'targetField', e.target.value)}
                      placeholder="Target field name"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVariableMapping(mapping.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {variableMappings.length === 0 && (
                <p className="text-gray-500 text-center py-4">No variable mappings defined</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Automation Steps</span>
                <Button type="button" onClick={addAutomationStep} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {automationSteps.length === 0 ? (
                <p className="text-sm text-gray-500">No automation steps configured. Click "Add Step" to begin.</p>
              ) : (
                automationSteps.map((step, stepIndex) => {
                  const selectedAutomation = automations.find(a => a.id === step.automationId);
                  const previousSteps = automationSteps.slice(0, stepIndex);
                  
                  return (
                    <Card key={step.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Step {step.order}</Badge>
                            {step.automationName && <span className="font-medium">{step.automationName}</span>}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAutomationStep(step.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Select Automation</Label>
                          <Select
                            value={step.automationId}
                            onValueChange={(value) => updateAutomationStep(step.id, 'automationId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an automation" />
                            </SelectTrigger>
                            <SelectContent>
                              {automations.filter(a => a.enabled).map(automation => (
                                <SelectItem key={automation.id} value={automation.id}>
                                  {automation.name} ({automation.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedAutomation && (
                            <p className="text-xs text-gray-500 mt-1">{selectedAutomation.description}</p>
                          )}
                        </div>

                        {selectedAutomation && selectedAutomation.inputParameters.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Input Variable Mappings</Label>
                              <Button
                                type="button"
                                onClick={() => addStepVariableMapping(step.id)}
                                size="sm"
                                variant="outline"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Mapping
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {step.variableMappings.map(mapping => (
                                <div key={mapping.id} className="flex gap-2 items-end">
                                  <div className="flex-1">
                                    <Label className="text-xs">Source Type</Label>
                                    <Select
                                      value={mapping.sourceType}
                                      onValueChange={(value) => 
                                        updateStepVariableMapping(step.id, mapping.id, 'sourceType', value)
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="integration">Integration Input</SelectItem>
                                        <SelectItem value="previous_step">Previous Step</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {mapping.sourceType === 'previous_step' && previousSteps.length > 0 && (
                                    <div className="flex-1">
                                      <Label className="text-xs">Source Step</Label>
                                      <Select
                                        value={mapping.sourceStepId || ''}
                                        onValueChange={(value) => 
                                          updateStepVariableMapping(step.id, mapping.id, 'sourceStepId', value)
                                        }
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue placeholder="Select step" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {previousSteps.map(prevStep => (
                                            <SelectItem key={prevStep.id} value={prevStep.id}>
                                              Step {prevStep.order}: {prevStep.automationName}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}

                                  <div className="flex-1">
                                    <Label className="text-xs">Source Field</Label>
                                    <Input
                                      className="h-8"
                                      value={mapping.sourceField}
                                      onChange={(e) => 
                                        updateStepVariableMapping(step.id, mapping.id, 'sourceField', e.target.value)
                                      }
                                      placeholder="Field name"
                                    />
                                  </div>

                                  <ArrowRight className="w-4 h-4 text-gray-400 mb-1" />

                                  <div className="flex-1">
                                    <Label className="text-xs">Target Parameter</Label>
                                    <Select
                                      value={mapping.targetParameter}
                                      onValueChange={(value) => 
                                        updateStepVariableMapping(step.id, mapping.id, 'targetParameter', value)
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select parameter" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {selectedAutomation.inputParameters.map(param => (
                                          <SelectItem key={param.id} value={param.name}>
                                            {param.name} ({param.type})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStepVariableMapping(step.id, mapping.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Output Mappings to Target Endpoint</span>
                <Button type="button" onClick={addOutputMapping} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Mapping
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {outputMappings.length === 0 ? (
                <p className="text-sm text-gray-500">No output mappings configured</p>
              ) : (
                outputMappings.map(mapping => (
                  <div key={mapping.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label className="text-xs">Source Type</Label>
                      <Select
                        value={mapping.sourceType}
                        onValueChange={(value) => updateOutputMapping(mapping.id, 'sourceType', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="integration">Integration Input</SelectItem>
                          <SelectItem value="step">Automation Step</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {mapping.sourceType === 'step' && automationSteps.length > 0 && (
                      <div className="flex-1">
                        <Label className="text-xs">Source Step</Label>
                        <Select
                          value={mapping.sourceStepId || ''}
                          onValueChange={(value) => updateOutputMapping(mapping.id, 'sourceStepId', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select step" />
                          </SelectTrigger>
                          <SelectContent>
                            {automationSteps.map(step => (
                              <SelectItem key={step.id} value={step.id}>
                                Step {step.order}: {step.automationName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex-1">
                      <Label className="text-xs">Source Field</Label>
                      <Input
                        className="h-8"
                        value={mapping.sourceField}
                        onChange={(e) => updateOutputMapping(mapping.id, 'sourceField', e.target.value)}
                        placeholder="Field name"
                      />
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-400 mb-1" />

                    <div className="flex-1">
                      <Label className="text-xs">Target Field</Label>
                      <Input
                        className="h-8"
                        value={mapping.targetField}
                        onChange={(e) => updateOutputMapping(mapping.id, 'targetField', e.target.value)}
                        placeholder="Target field name"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOutputMapping(mapping.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Parameters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Timeout (ms)</Label>
                <Input
                  type="number"
                  value={formData.parameters.timeout}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, timeout: parseInt(e.target.value) }
                  })}
                />
              </div>
              
              <div>
                <Label>Retry Attempts</Label>
                <Input
                  type="number"
                  value={formData.parameters.retryAttempts}
                  onChange={(e) => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, retryAttempts: parseInt(e.target.value) }
                  })}
                />
              </div>
              
              <div>
                <Label>Data Format</Label>
                <Select
                  value={formData.parameters.dataFormat}
                  onValueChange={(value: 'json' | 'xml' | 'binary' | 'text') => setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, dataFormat: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Integration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
