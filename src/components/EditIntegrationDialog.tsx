
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Integration } from './IntegrationControlSystem';

interface EditIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration;
  onEdit: (integration: Integration) => void;
}

export const EditIntegrationDialog: React.FC<EditIntegrationDialogProps> = ({
  open,
  onOpenChange,
  integration,
  onEdit
}) => {
  const [formData, setFormData] = useState<Integration>(integration);

  useEffect(() => {
    setFormData(integration);
  }, [integration]);

  const protocols = [
    'REST_API', 'SOAP', 'GraphQL', 'MQTT', 'AMQP', 'WebSocket',
    'OPC_UA', 'Modbus_TCP', 'Modbus_RTU', 'EtherNet_IP', 'PROFINET',
    'HTTP', 'HTTPS', 'FTP', 'SFTP', 'TCP', 'UDP', 'gRPC',
    'Kafka', 'RabbitMQ', 'Redis', 'CoAP', 'LoRaWAN'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    onValueChange={(value) => setFormData({
                      ...formData,
                      sourceEndpoint: { ...formData.sourceEndpoint, protocol: value }
                    })}
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
                    onValueChange={(value) => setFormData({
                      ...formData,
                      targetEndpoint: { ...formData.targetEndpoint, protocol: value }
                    })}
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
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="binary">Binary</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
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
