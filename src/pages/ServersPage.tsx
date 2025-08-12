
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Server, Globe, Shield, Database, Wifi, Trash2, Settings, Play, Stop } from 'lucide-react';

interface ServerConfig {
  id: string;
  name: string;
  protocol: 'HTTP' | 'HTTPS' | 'WebSocket' | 'TCP' | 'UDP' | 'MQTT' | 'CoAP' | 'gRPC' | 'REST' | 'GraphQL';
  host: string;
  port: number;
  status: 'running' | 'stopped' | 'error';
  authentication: {
    enabled: boolean;
    type: 'basic' | 'bearer' | 'apikey' | 'oauth2' | 'certificate';
    config: Record<string, any>;
  };
  ssl: {
    enabled: boolean;
    certificate?: string;
    privateKey?: string;
  };
  endpoints: Array<{
    path: string;
    method: string;
    description: string;
  }>;
  config: Record<string, any>;
  createdAt: string;
}

const protocolTemplates = {
  HTTP: {
    name: 'HTTP Server',
    icon: Globe,
    description: 'Standard HTTP web server',
    defaultPort: 80,
    configFields: ['maxConnections', 'timeout', 'keepAlive'],
    authTypes: ['basic', 'bearer', 'apikey']
  },
  HTTPS: {
    name: 'HTTPS Server',
    icon: Shield,
    description: 'Secure HTTP server with SSL/TLS',
    defaultPort: 443,
    configFields: ['maxConnections', 'timeout', 'keepAlive', 'cipherSuites'],
    authTypes: ['basic', 'bearer', 'apikey', 'certificate']
  },
  WebSocket: {
    name: 'WebSocket Server',
    icon: Wifi,
    description: 'Real-time bidirectional communication',
    defaultPort: 8080,
    configFields: ['maxConnections', 'pingInterval', 'compressionEnabled'],
    authTypes: ['basic', 'bearer', 'apikey']
  },
  TCP: {
    name: 'TCP Server',
    icon: Server,
    description: 'Transmission Control Protocol server',
    defaultPort: 8000,
    configFields: ['maxConnections', 'bufferSize', 'keepAlive'],
    authTypes: ['basic', 'certificate']
  },
  UDP: {
    name: 'UDP Server',
    icon: Server,
    description: 'User Datagram Protocol server',
    defaultPort: 8001,
    configFields: ['bufferSize', 'timeout'],
    authTypes: ['basic']
  },
  MQTT: {
    name: 'MQTT Broker',
    icon: Database,
    description: 'Message Queuing Telemetry Transport',
    defaultPort: 1883,
    configFields: ['maxConnections', 'retainedMessages', 'sessionExpiry'],
    authTypes: ['basic', 'certificate']
  },
  CoAP: {
    name: 'CoAP Server',
    icon: Wifi,
    description: 'Constrained Application Protocol',
    defaultPort: 5683,
    configFields: ['maxPayloadSize', 'ackTimeout', 'maxRetransmit'],
    authTypes: ['basic', 'certificate']
  },
  gRPC: {
    name: 'gRPC Server',
    icon: Server,
    description: 'High-performance RPC framework',
    defaultPort: 9090,
    configFields: ['maxMessageSize', 'maxConnections', 'keepAlive'],
    authTypes: ['basic', 'bearer', 'certificate']
  }
};

const ServersPage = () => {
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    protocol: '',
    host: 'localhost',
    port: 8080,
    authentication: {
      enabled: false,
      type: 'basic',
      config: {}
    },
    ssl: {
      enabled: false
    },
    config: {} as Record<string, string>
  });

  const handleCreateServer = () => {
    const server: ServerConfig = {
      id: Date.now().toString(),
      name: newServer.name,
      protocol: newServer.protocol as any,
      host: newServer.host,
      port: newServer.port,
      status: 'stopped',
      authentication: newServer.authentication,
      ssl: newServer.ssl,
      endpoints: [],
      config: newServer.config,
      createdAt: new Date().toISOString(),
    };

    setServers([...servers, server]);
    setIsCreating(false);
    setNewServer({
      name: '',
      protocol: '',
      host: 'localhost',
      port: 8080,
      authentication: { enabled: false, type: 'basic', config: {} },
      ssl: { enabled: false },
      config: {}
    });
  };

  const handleDeleteServer = (serverId: string) => {
    setServers(servers.filter(s => s.id !== serverId));
  };

  const toggleServerStatus = (serverId: string) => {
    setServers(servers.map(server => 
      server.id === serverId 
        ? { ...server, status: server.status === 'running' ? 'stopped' : 'running' }
        : server
    ));
  };

  const selectedTemplate = protocolTemplates[newServer.protocol as keyof typeof protocolTemplates];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Servers</h1>
          <p className="text-gray-600">Build and manage communication protocol servers</p>
        </div>

        {/* Create New Server */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isCreating ? (
              <Button onClick={() => setIsCreating(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                New Server
              </Button>
            ) : (
              <div className="space-y-6">
                {/* Basic Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium">Basic Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Server Name</Label>
                      <Input
                        value={newServer.name}
                        onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                        placeholder="Enter server name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Protocol</Label>
                      <Select
                        value={newServer.protocol}
                        onValueChange={(value) => setNewServer({ 
                          ...newServer, 
                          protocol: value,
                          port: protocolTemplates[value as keyof typeof protocolTemplates]?.defaultPort || 8080
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select protocol" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(protocolTemplates).map(([key, template]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <template.icon className="w-4 h-4" />
                                {template.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Host</Label>
                      <Input
                        value={newServer.host}
                        onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
                        placeholder="localhost"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input
                        type="number"
                        value={newServer.port}
                        onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
                        placeholder="8080"
                      />
                    </div>
                  </div>
                </div>

                {/* Protocol-specific Configuration */}
                {selectedTemplate && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Protocol Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTemplate.configFields.map((field) => (
                        <div key={field} className="space-y-2">
                          <Label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                          <Input
                            value={newServer.config[field] || ''}
                            onChange={(e) => setNewServer({
                              ...newServer,
                              config: { ...newServer.config, [field]: e.target.value }
                            })}
                            placeholder={`Enter ${field}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authentication */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Authentication</h4>
                    <Switch
                      checked={newServer.authentication.enabled}
                      onCheckedChange={(checked) => setNewServer({
                        ...newServer,
                        authentication: { ...newServer.authentication, enabled: checked }
                      })}
                    />
                  </div>

                  {newServer.authentication.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Authentication Type</Label>
                        <Select
                          value={newServer.authentication.type}
                          onValueChange={(value) => setNewServer({
                            ...newServer,
                            authentication: { ...newServer.authentication, type: value as any }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedTemplate?.authTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* SSL/TLS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">SSL/TLS</h4>
                    <Switch
                      checked={newServer.ssl.enabled}
                      onCheckedChange={(checked) => setNewServer({
                        ...newServer,
                        ssl: { ...newServer.ssl, enabled: checked }
                      })}
                    />
                  </div>

                  {newServer.ssl.enabled && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>SSL Certificate</Label>
                        <Textarea
                          placeholder="Paste your SSL certificate here"
                          className="h-20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Private Key</Label>
                        <Textarea
                          placeholder="Paste your private key here"
                          className="h-20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateServer}
                    disabled={!newServer.name || !newServer.protocol}
                  >
                    Create Server
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Servers List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {servers.map((server) => {
            const template = protocolTemplates[server.protocol];
            const Icon = template?.icon || Server;

            return (
              <Card key={server.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <div>
                        <CardTitle className="text-lg">{server.name}</CardTitle>
                        <p className="text-sm text-gray-600">{server.protocol} • {server.host}:{server.port}</p>
                      </div>
                    </div>
                    <Badge variant={server.status === 'running' ? 'default' : 'secondary'}>
                      {server.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{template?.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Auth: {server.authentication.enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>SSL: {server.ssl.enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleServerStatus(server.id)}
                        className="flex-1"
                      >
                        {server.status === 'running' ? (
                          <>
                            <Stop className="w-4 h-4 mr-2" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteServer(server.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Created: {new Date(server.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {servers.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Server className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No servers configured</h3>
              <p>Create your first server to start handling communication protocols</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServersPage;
