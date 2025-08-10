
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Globe, Wifi, WifiOff, RefreshCw, Search, Filter, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface SoftwareEndpoint {
  id: string;
  name: string;
  url: string;
  type: 'automation' | 'integration' | 'application';
  source: string; // Name of the automation/integration/app that created it
  status: 'online' | 'offline' | 'error' | 'checking';
  lastChecked: Date;
  responseTime?: number;
  createdAt: Date;
  description?: string;
}

const mockEndpoints: SoftwareEndpoint[] = [
  {
    id: '1',
    name: 'Production Data API',
    url: 'https://api.company.com/production',
    type: 'integration',
    source: 'MES Integration',
    status: 'online',
    lastChecked: new Date(),
    responseTime: 245,
    createdAt: new Date('2024-01-15'),
    description: 'Real-time production data endpoint'
  },
  {
    id: '2',
    name: 'Quality Control Webhook',
    url: 'https://webhooks.company.com/quality',
    type: 'automation',
    source: 'QC Automation Flow',
    status: 'online',
    lastChecked: new Date(),
    responseTime: 156,
    createdAt: new Date('2024-02-20'),
    description: 'Automated quality control notifications'
  },
  {
    id: '3',
    name: 'Inventory App API',
    url: 'https://app.company.com/api/inventory',
    type: 'application',
    source: 'Inventory Management App',
    status: 'error',
    lastChecked: new Date(),
    createdAt: new Date('2024-03-10'),
    description: 'Custom inventory application endpoint'
  }
];

export const SoftwareEndpointManager = () => {
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<SoftwareEndpoint[]>(mockEndpoints);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter endpoints based on search and filters
  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || endpoint.status === statusFilter;
    const matchesType = typeFilter === 'all' || endpoint.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Mock status check function
  const checkEndpointStatus = async (endpoint: SoftwareEndpoint): Promise<SoftwareEndpoint> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock response - randomly assign status
    const statuses: ('online' | 'offline' | 'error')[] = ['online', 'offline', 'error'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      ...endpoint,
      status: randomStatus,
      lastChecked: new Date(),
      responseTime: randomStatus === 'online' ? Math.floor(Math.random() * 500) + 100 : undefined
    };
  };

  const refreshEndpointStatus = async (endpointId: string) => {
    setEndpoints(prev => prev.map(ep => 
      ep.id === endpointId ? { ...ep, status: 'checking' } : ep
    ));

    const endpoint = endpoints.find(ep => ep.id === endpointId);
    if (!endpoint) return;

    try {
      const updatedEndpoint = await checkEndpointStatus(endpoint);
      setEndpoints(prev => prev.map(ep => 
        ep.id === endpointId ? updatedEndpoint : ep
      ));
      
      toast({
        title: "Status Updated",
        description: `${endpoint.name} status: ${updatedEndpoint.status}`,
      });
    } catch (error) {
      setEndpoints(prev => prev.map(ep => 
        ep.id === endpointId ? { ...ep, status: 'error', lastChecked: new Date() } : ep
      ));
      
      toast({
        title: "Check Failed",
        description: `Failed to check status for ${endpoint.name}`,
        variant: "destructive"
      });
    }
  };

  const refreshAllEndpoints = async () => {
    setIsRefreshing(true);
    
    // Set all to checking status
    setEndpoints(prev => prev.map(ep => ({ ...ep, status: 'checking' as const })));
    
    try {
      const updatedEndpoints = await Promise.all(
        endpoints.map(endpoint => checkEndpointStatus(endpoint))
      );
      
      setEndpoints(updatedEndpoints);
      toast({
        title: "All Endpoints Refreshed",
        description: "Status check completed for all endpoints",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh some endpoints",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'checking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'automation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'integration':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'application':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllEndpoints();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [endpoints]);

  const stats = {
    total: endpoints.length,
    online: endpoints.filter(ep => ep.status === 'online').length,
    offline: endpoints.filter(ep => ep.status === 'offline').length,
    error: endpoints.filter(ep => ep.status === 'error').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Endpoint Management</h1>
          <p className="text-gray-600">Monitor and manage all software endpoints</p>
        </div>
        <Button onClick={refreshAllEndpoints} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-2xl font-bold text-green-600">{stats.online}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-gray-600">{stats.offline}</p>
              </div>
              <WifiOff className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error</p>
                <p className="text-2xl font-bold text-red-600">{stats.error}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="application">Application</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints List */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints ({filteredEndpoints.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEndpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(endpoint.status)}
                    <h3 className="font-medium">{endpoint.name}</h3>
                    <Badge className={getStatusColor(endpoint.status)}>
                      {endpoint.status}
                    </Badge>
                    <Badge className={getTypeColor(endpoint.type)}>
                      {endpoint.type}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">URL:</span> {endpoint.url}</p>
                    <p><span className="font-medium">Source:</span> {endpoint.source}</p>
                    {endpoint.description && (
                      <p><span className="font-medium">Description:</span> {endpoint.description}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <span><span className="font-medium">Last Checked:</span> {endpoint.lastChecked.toLocaleString()}</span>
                      {endpoint.responseTime && (
                        <span><span className="font-medium">Response Time:</span> {endpoint.responseTime}ms</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refreshEndpointStatus(endpoint.id)}
                    disabled={endpoint.status === 'checking'}
                  >
                    <RefreshCw className={`w-4 h-4 ${endpoint.status === 'checking' ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredEndpoints.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No endpoints found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
