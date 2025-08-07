
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';

interface IntegrationFiltersProps {
  onFilter: (searchTerm: string, statusFilter: string, protocolFilter: string) => void;
}

export const IntegrationFilters: React.FC<IntegrationFiltersProps> = ({ onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');

  const protocols = [
    'REST_API', 'SOAP', 'GraphQL', 'MQTT', 'AMQP', 'WebSocket',
    'OPC_UA', 'Modbus_TCP', 'Modbus_RTU', 'EtherNet_IP', 'PROFINET',
    'HTTP', 'HTTPS', 'FTP', 'SFTP', 'TCP', 'UDP', 'gRPC',
    'Kafka', 'RabbitMQ', 'Redis', 'CoAP', 'LoRaWAN'
  ];

  const applyFilters = () => {
    onFilter(searchTerm, statusFilter, protocolFilter);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setProtocolFilter('');
    onFilter('', '', '');
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, protocolFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <Label>Status</Label>
          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Protocol</Label>
          <Select value={protocolFilter || "all"} onValueChange={(value) => setProtocolFilter(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All protocols" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All protocols</SelectItem>
              {protocols.map(protocol => (
                <SelectItem key={protocol} value={protocol}>
                  {protocol.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={resetFilters}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
};
