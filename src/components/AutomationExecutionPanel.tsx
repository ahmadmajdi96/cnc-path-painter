
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Automation } from './AutomationControlSystem';

interface ExecutionLog {
  id: string;
  timestamp: Date;
  status: 'success' | 'error' | 'running' | 'cancelled';
  duration: number;
  message: string;
  details?: string;
}

interface AutomationExecutionPanelProps {
  automation: Automation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AutomationExecutionPanel = ({ automation, open, onOpenChange }: AutomationExecutionPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs] = useState<ExecutionLog[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'success',
      duration: 2300,
      message: 'Automation completed successfully',
      details: 'Processed 15 files, sent 3 API requests'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      status: 'error',
      duration: 1800,
      message: 'Failed to connect to target API',
      details: 'Connection timeout after 30 seconds'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      status: 'success',
      duration: 1500,
      message: 'Automation completed successfully',
      details: 'Processed 8 files, sent 2 API requests'
    }
  ]);

  if (!automation) return null;

  const handleManualExecution = () => {
    setIsRunning(true);
    // Simulate execution
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const successRate = automation.executionCount > 0 
    ? (automation.successCount / automation.executionCount) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Execution Panel - {automation.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={automation.enabled ? "default" : "secondary"}>
                {automation.enabled ? 'Active' : 'Inactive'}
              </Badge>
              <div className="text-sm text-gray-600">
                Last executed: {automation.lastExecuted?.toLocaleString() || 'Never'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleManualExecution}
                disabled={isRunning || !automation.enabled}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Square className="w-4 h-4" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute Now
                  </>
                )}
              </Button>
            </div>
          </div>

          {isRunning && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Execution in progress...</span>
                    <span>Step 2 of 3</span>
                  </div>
                  <Progress value={66} className="w-full" />
                  <div className="text-xs text-gray-500">
                    Processing files and preparing API requests
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{automation.executionCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Success Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{automation.successCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Error Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{automation.errorCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${successRate >= 90 ? 'text-green-600' : successRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {Math.round(successRate)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="logs" className="w-full">
            <TabsList>
              <TabsTrigger value="logs">Execution Logs</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {executionLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{log.message}</div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(log.status)}>
                                {log.status.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {log.duration}ms
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {log.timestamp.toLocaleString()}
                          </div>
                          {log.details && (
                            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                              {log.details}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Automation Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Trigger</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm">
                          <div><strong>Type:</strong> {automation.trigger.type.replace('_', ' ')}</div>
                          {automation.trigger.config.endpoint && (
                            <div><strong>Endpoint:</strong> {automation.trigger.config.endpoint}</div>
                          )}
                          {automation.trigger.config.cronExpression && (
                            <div><strong>Schedule:</strong> {automation.trigger.config.cronExpression}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Actions ({automation.actions.length})</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm space-y-1">
                          {automation.actions.map((action, index) => (
                            <div key={index}>
                              <strong>Action {index + 1}:</strong> {action.type.replace('_', ' ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Retry Policy</h4>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div>Max Retries: {automation.retryPolicy.maxRetries}</div>
                        <div>Delay: {automation.retryPolicy.retryDelay}ms</div>
                        <div>Backoff: {automation.retryPolicy.backoffMultiplier}x</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Timeout</h4>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        {automation.timeout / 1000}s
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {automation.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm text-gray-600">{Math.round(successRate)}%</span>
                      </div>
                      <Progress value={successRate} className="w-full" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="font-medium">Average Duration</div>
                        <div className="text-2xl font-bold">1.8s</div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium">Executions This Week</div>
                        <div className="text-2xl font-bold">24</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
