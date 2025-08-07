
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Play, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Integration } from './IntegrationControlSystem';

interface IntegrationListProps {
  integrations: Integration[];
  onEdit: (integration: Integration) => void;
  onDelete: (id: string) => void;
  onTest: (integration: Integration) => void;
}

export const IntegrationList: React.FC<IntegrationListProps> = ({
  integrations,
  onEdit,
  onDelete,
  onTest
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'testing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      testing: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (integrations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No integrations found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(integration.status)}
                  {integration.name}
                  <Badge className={getStatusBadge(integration.status)}>
                    {integration.status}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {integration.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTest(integration)}
                  className="flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(integration)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(integration.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Source Endpoint</h4>
                <div className="text-sm text-gray-600">
                  <div><strong>Protocol:</strong> {integration.sourceEndpoint.protocol.replace(/_/g, ' ')}</div>
                  <div><strong>Host:</strong> {integration.sourceEndpoint.host}:{integration.sourceEndpoint.port}</div>
                  {integration.sourceEndpoint.path && (
                    <div><strong>Path:</strong> {integration.sourceEndpoint.path}</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Target Endpoint</h4>
                <div className="text-sm text-gray-600">
                  <div><strong>Protocol:</strong> {integration.targetEndpoint.protocol.replace(/_/g, ' ')}</div>
                  <div><strong>Host:</strong> {integration.targetEndpoint.host}:{integration.targetEndpoint.port}</div>
                  {integration.targetEndpoint.path && (
                    <div><strong>Path:</strong> {integration.targetEndpoint.path}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t flex justify-between text-xs text-gray-500">
              <div>
                <strong>Timeout:</strong> {integration.parameters.timeout}ms | 
                <strong> Format:</strong> {integration.parameters.dataFormat.toUpperCase()}
              </div>
              {integration.lastTest && (
                <div className="flex items-center gap-1">
                  {integration.lastTest.status === 'success' ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  Last test: {new Date(integration.lastTest.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
