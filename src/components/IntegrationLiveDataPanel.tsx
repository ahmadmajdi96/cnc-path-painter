
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowDown, ArrowUp, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Integration } from './IntegrationControlSystem';

interface IntegrationLiveDataPanelProps {
  integration: Integration | null;
  onClose: () => void;
}

export const IntegrationLiveDataPanel: React.FC<IntegrationLiveDataPanelProps> = ({
  integration,
  onClose
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [liveData, setLiveData] = useState(integration?.liveData);

  // Simulate live data updates
  useEffect(() => {
    if (!isMonitoring || !integration) return;

    const interval = setInterval(() => {
      // Simulate receiving new data
      if (Math.random() > 0.7) {
        const newReceivedData = {
          timestamp: new Date().toISOString(),
          data: {
            sensor_id: `S${Math.floor(Math.random() * 100)}`,
            value: Math.round(Math.random() * 100),
            status: 'active'
          },
          size: Math.floor(Math.random() * 2000) + 512
        };

        setLiveData(prev => ({
          ...prev!,
          receivedCount: (prev?.receivedCount || 0) + 1,
          lastReceived: newReceivedData
        }));
      }

      // Simulate sending data
      if (Math.random() > 0.8) {
        const newSentData = {
          timestamp: new Date().toISOString(),
          data: {
            processed_id: `P${Math.floor(Math.random() * 100)}`,
            result: 'processed',
            timestamp: new Date().toISOString()
          },
          size: Math.floor(Math.random() * 1500) + 256
        };

        setLiveData(prev => ({
          ...prev!,
          sentCount: (prev?.sentCount || 0) + 1,
          lastSent: newSentData
        }));
      }

      // Occasionally simulate errors
      if (Math.random() > 0.95) {
        const error = {
          timestamp: new Date().toISOString(),
          type: Math.random() > 0.5 ? 'receive' as const : 'send' as const,
          message: 'Connection timeout - retrying...'
        };

        setLiveData(prev => ({
          ...prev!,
          errors: [...(prev?.errors || []), error].slice(-10) // Keep last 10 errors
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring, integration]);

  if (!integration) {
    return (
      <div className="text-center py-8 text-gray-500">
        Select an integration to monitor live data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Live Data Monitor: {integration.name}</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isMonitoring ? 'animate-spin' : ''}`} />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowDown className="w-5 h-5 text-blue-500" />
              Received Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold text-blue-600">
                {liveData?.receivedCount || 0}
              </div>
              <div className="text-sm text-gray-600">Total messages received</div>
              
              {liveData?.lastReceived && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">Last Received:</div>
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(liveData.lastReceived.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs">
                    <strong>Size:</strong> {liveData.lastReceived.size} bytes
                  </div>
                  <ScrollArea className="h-24 mt-2 p-2 bg-gray-50 rounded">
                    <pre className="text-xs">
                      {JSON.stringify(liveData.lastReceived.data, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowUp className="w-5 h-5 text-green-500" />
              Sent Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold text-green-600">
                {liveData?.sentCount || 0}
              </div>
              <div className="text-sm text-gray-600">Total messages sent</div>
              
              {liveData?.lastSent && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">Last Sent:</div>
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(liveData.lastSent.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs">
                    <strong>Size:</strong> {liveData.lastSent.size} bytes
                  </div>
                  <ScrollArea className="h-24 mt-2 p-2 bg-gray-50 rounded">
                    <pre className="text-xs">
                      {JSON.stringify(liveData.lastSent.data, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Errors & Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold text-red-600">
                {liveData?.errors?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Recent errors</div>
              
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {liveData?.errors?.map((error, index) => (
                    <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={error.type === 'receive' ? 'secondary' : 'outline'} className="text-xs">
                          {error.type}
                        </Badge>
                        <span className="text-gray-500">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-red-700">{error.message}</div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-4">
                      No errors recorded
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Source Endpoint</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Protocol:</strong> {integration.sourceEndpoint.protocol}</div>
                {integration.sourceEndpoint.auth && integration.sourceEndpoint.auth.type !== 'none' && (
                  <div><strong>Auth:</strong> {integration.sourceEndpoint.auth.type}</div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Target Endpoint</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Protocol:</strong> {integration.targetEndpoint.protocol}</div>
                <div><strong>Host:</strong> {integration.targetEndpoint.host}:{integration.targetEndpoint.port}</div>
                {integration.targetEndpoint.auth && integration.targetEndpoint.auth.type !== 'none' && (
                  <div><strong>Auth:</strong> {integration.targetEndpoint.auth.type}</div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Configuration</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Protocol:</strong> {integration.configuration.protocol}</div>
                <div><strong>Host:</strong> {integration.configuration.host}:{integration.configuration.port}</div>
                <div><strong>Result:</strong> {integration.resultDestination === 'client' ? 'Return to Client' : 'Forward to Target'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
