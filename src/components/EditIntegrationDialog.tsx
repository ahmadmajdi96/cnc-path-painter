import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Integration } from './IntegrationControlSystem';

interface EditIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration;
  onEdit: (integration: Integration) => void;
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

export const EditIntegrationDialog: React.FC<EditIntegrationDialogProps> = ({
  open,
  onOpenChange,
  integration,
  onEdit
}) => {
  const [formData, setFormData] = useState<Integration>(integration);
  const [receiveDataType, setReceiveDataType] = useState<'json' | 'xml' | 'binary' | 'text'>('json');
  const [sendDataType, setSendDataType] = useState<'json' | 'xml' | 'binary' | 'text'>('json');
  const [expectedParameters, setExpectedParameters] = useState<Parameter[]>([]);
  const [variableMappings, setVariableMappings] = useState<VariableMapping[]>([]);

  useEffect(() => {
    setFormData(integration);
    if (integration.dataConfiguration) {
      setReceiveDataType(integration.dataConfiguration.receiveDataType);
      setSendDataType(integration.dataConfiguration.sendDataType);
      setExpectedParameters(integration.dataConfiguration.expectedParameters || []);
      setVariableMappings(integration.dataConfiguration.variableMappings || []);
    } else {
      setReceiveDataType('json');
      setSendDataType('json');
      setExpectedParameters([]);
      setVariableMappings([]);
    }
  }, [integration]);

  const protocols = [
    'REST_API', 'SOAP', 'GraphQL', 'MQTT', 'AMQP', 'WebSocket',
    'OPC_UA', 'Modbus_TCP', 'Modbus_RTU', 'EtherNet_IP', 'PROFINET',
    'HTTP', 'HTTPS', 'FTP', 'SFTP', 'TCP', 'UDP', 'gRPC',
    'Kafka', 'RabbitMQ', 'Redis', 'CoAP', 'LoRaWAN'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedIntegration = {
      ...formData,
      dataConfiguration: {
        receiveDataType,
        sendDataType,
        expectedParameters,
        variableMappings
      }
    };
    
    onEdit(updatedIntegration);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Integration</DialogTitle>
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
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive' | 'testing' | 'error') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Source Endpoint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Protocol</Label>
                  <Select
                    value={formData.sourceEndpoint.protocol}
                    onValueChange={(value) => {
                      const defaults = getProtocolDefaults(value);
                      setFormData({
                        ...formData,
                        sourceEndpoint: { 
                          ...formData.sourceEndpoint, 
                          protocol: value,
                          port: defaults.port,
                          auth: { type: defaults.auth as any, credentials: {} }
                        }
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Host</Label>
                  <Input
                    value={formData.sourceEndpoint.host}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceEndpoint: { ...formData.sourceEndpoint, host: e.target.value }
                    })}
                    required
                  />
                </div>
                
                <div>
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={formData.sourceEndpoint.port}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceEndpoint: { ...formData.sourceEndpoint, port: parseInt(e.target.value) }
                    })}
                    required
                  />
                </div>
                
                <div>
                  <Label>Path (Optional)</Label>
                  <Input
                    value={formData.sourceEndpoint.path || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceEndpoint: { ...formData.sourceEndpoint, path: e.target.value }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

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
                      <SelectValue />
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
                  <Label>Host</Label>
                  <Input
                    value={formData.targetEndpoint.host}
                    onChange={(e) => setFormData({
                      ...formData,
                      targetEndpoint: { ...formData.targetEndpoint, host: e.target.value }
                    })}
                    required
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
                    required
                  />
                </div>
                
                <div>
                  <Label>Path (Optional)</Label>
                  <Input
                    value={formData.targetEndpoint.path || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      targetEndpoint: { ...formData.targetEndpoint, path: e.target.value }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

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
              Update Integration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
