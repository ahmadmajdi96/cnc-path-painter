
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Settings, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Integration } from './IntegrationControlSystem';

interface IntegrationTestPanelProps {
  integration: Integration | null;
  onClose: () => void;
}

export const IntegrationTestPanel: React.FC<IntegrationTestPanelProps> = ({
  integration,
  onClose
}) => {
  const [testData, setTestData] = useState('{\n  "timestamp": "2024-01-15T12:00:00Z",\n  "data": "test message"\n}');
  const [customTimeout, setCustomTimeout] = useState(integration?.parameters.timeout || 30000);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const runTest = async () => {
    if (!integration) return;
    
    setIsRunning(true);
    setTestResult(null);
    
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, customTimeout / 10)); // Simulate actual timeout/10 for demo
      
      const mockResult = {
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.3 ? 'success' : 'failure',
        sourceResponse: {
          statusCode: Math.random() > 0.3 ? 200 : 500,
          latency: Math.floor(Math.random() * 1000) + 50,
          data: Math.random() > 0.3 ? { message: 'Data received successfully' } : null
        },
        targetResponse: {
          statusCode: Math.random() > 0.3 ? 201 : 503,
          latency: Math.floor(Math.random() * 800) + 30,
          data: Math.random() > 0.3 ? { id: '12345', status: 'processed' } : null
        },
        error: Math.random() > 0.7 ? 'Connection timeout after ' + customTimeout + 'ms' : null
      };
      
      setTestResult(mockResult);
    } catch (error) {
      setTestResult({
        timestamp: new Date().toISOString(),
        status: 'failure',
        error: 'Test execution failed'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const stopTest = () => {
    setIsRunning(false);
    setTestResult({
      timestamp: new Date().toISOString(),
      status: 'cancelled',
      error: 'Test cancelled by user'
    });
  };

  if (!integration) {
    return (
      <div className="text-center py-8 text-gray-500">
        Select an integration to test
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Testing: {integration.name}</h3>
        <Button variant="outline" onClick={onClose}>
          Close Panel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="timeout">Custom Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={customTimeout}
                onChange={(e) => setCustomTimeout(parseInt(e.target.value))}
                min="1000"
                max="300000"
              />
            </div>
            
            <div>
              <Label htmlFor="testData">Test Data Payload</Label>
              <Textarea
                id="testData"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                rows={8}
                className="font-mono text-sm"
                placeholder="Enter test data in the configured format"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={runTest}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running Test...' : 'Start Test'}
              </Button>
              
              {isRunning && (
                <Button
                  onClick={stopTest}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop Test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Test Results
              {isRunning && <Badge className="bg-yellow-100 text-yellow-800">Running</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRunning ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-3">Testing integration...</span>
              </div>
            ) : testResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {testResult.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <Badge className={
                    testResult.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }>
                    {testResult.status?.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {new Date(testResult.timestamp).toLocaleString()}
                  </span>
                </div>
                
                {testResult.sourceResponse && (
                  <div className="border rounded p-3 bg-blue-50">
                    <h4 className="font-medium text-sm mb-2">Source Endpoint Response</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Status:</strong> {testResult.sourceResponse.statusCode}</div>
                      <div><strong>Latency:</strong> {testResult.sourceResponse.latency}ms</div>
                      {testResult.sourceResponse.data && (
                        <div><strong>Data:</strong> <pre className="text-xs bg-white p-2 rounded mt-1">{JSON.stringify(testResult.sourceResponse.data, null, 2)}</pre></div>
                      )}
                    </div>
                  </div>
                )}
                
                {testResult.targetResponse && (
                  <div className="border rounded p-3 bg-green-50">
                    <h4 className="font-medium text-sm mb-2">Target Endpoint Response</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Status:</strong> {testResult.targetResponse.statusCode}</div>
                      <div><strong>Latency:</strong> {testResult.targetResponse.latency}ms</div>
                      {testResult.targetResponse.data && (
                        <div><strong>Data:</strong> <pre className="text-xs bg-white p-2 rounded mt-1">{JSON.stringify(testResult.targetResponse.data, null, 2)}</pre></div>
                      )}
                    </div>
                  </div>
                )}
                
                {testResult.error && (
                  <div className="border rounded p-3 bg-red-50 text-red-800">
                    <h4 className="font-medium text-sm mb-2">Error Details</h4>
                    <p className="text-sm">{testResult.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click "Start Test" to begin integration testing
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Source: {integration.sourceEndpoint.protocol.replace(/_/g, ' ')}</h4>
              <div className="text-sm text-gray-600">
                {integration.sourceEndpoint.host}:{integration.sourceEndpoint.port}
                {integration.sourceEndpoint.path && integration.sourceEndpoint.path}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Target: {integration.targetEndpoint.protocol.replace(/_/g, ' ')}</h4>
              <div className="text-sm text-gray-600">
                {integration.targetEndpoint.host}:{integration.targetEndpoint.port}
                {integration.targetEndpoint.path && integration.targetEndpoint.path}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
