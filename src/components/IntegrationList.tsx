
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Play, Activity } from 'lucide-react';
import { Integration } from './IntegrationControlSystem';

interface IntegrationListProps {
  integrations: Integration[];
  onEdit: (integration: Integration) => void;
  onDelete: (id: string) => void;
  onTest: (integration: Integration) => void;
  onViewLiveData: (integration: Integration) => void;
}

export const IntegrationList: React.FC<IntegrationListProps> = ({
  integrations,
  onEdit,
  onDelete,
  onTest,
  onViewLiveData
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (integrations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 mb-4">No integrations found</p>
          <p className="text-sm text-gray-400">Create your first integration to get started</p>
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
              <div>
                <CardTitle className="flex items-center gap-2">
                  {integration.name}
                  <Badge className={getStatusColor(integration.status)}>
                    {integration.status}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewLiveData(integration)}
                  className="flex items-center gap-1"
                >
                  <Activity className="w-4 h-4" />
                  Live Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTest(integration)}
                  className="flex items-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(integration)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(integration.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Source</h4>
                <div className="text-sm text-gray-600">
                  <div><strong>Protocol:</strong> {integration.sourceEndpoint.protocol}</div>
                  <div><strong>Mode:</strong> {integration.sourceEndpoint.mode}</div>
                  <div><strong>Host:</strong> {integration.sourceEndpoint.host}:{integration.sourceEndpoint.port}</div>
                  {integration.sourceEndpoint.path && (
                    <div><strong>Path:</strong> {integration.sourceEndpoint.path}</div>
                  )}
                  {integration.sourceEndpoint.auth && integration.sourceEndpoint.auth.type !== 'none' && (
                    <div><strong>Auth:</strong> {integration.sourceEndpoint.auth.type}</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Target</h4>
                <div className="text-sm text-gray-600">
                  <div><strong>Protocol:</strong> {integration.targetEndpoint.protocol}</div>
                  <div><strong>Mode:</strong> {integration.targetEndpoint.mode}</div>
                  <div><strong>Host:</strong> {integration.targetEndpoint.host}:{integration.targetEndpoint.port}</div>
                  {integration.targetEndpoint.path && (
                    <div><strong>Path:</strong> {integration.targetEndpoint.path}</div>
                  )}
                  {integration.targetEndpoint.auth && integration.targetEndpoint.auth.type !== 'none' && (
                    <div><strong>Auth:</strong> {integration.targetEndpoint.auth.type}</div>
                  )}
                </div>
              </div>
            </div>

            {integration.automationSteps && integration.automationSteps.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-sm mb-2">Automation Steps ({integration.automationSteps.length})</h4>
                <div className="space-y-2">
                  {integration.automationSteps.map((step) => (
                    <div key={step.id} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Step {step.order}</Badge>
                        <span className="font-medium">{step.automationName}</span>
                      </div>
                      {step.variableMappings.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {step.variableMappings.length} variable mapping(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {integration.liveData && (
              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Received:</span>
                  <span className="ml-2 font-medium text-blue-600">{integration.liveData.receivedCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Sent:</span>
                  <span className="ml-2 font-medium text-green-600">{integration.liveData.sentCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Errors:</span>
                  <span className="ml-2 font-medium text-red-600">{integration.liveData.errors?.length || 0}</span>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-400">
              Created: {new Date(integration.createdAt).toLocaleDateString()} | 
              Updated: {new Date(integration.updatedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
