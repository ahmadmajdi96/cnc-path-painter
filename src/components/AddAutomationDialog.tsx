
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Automation, TriggerConfig, ActionConfig } from './AutomationControlSystem';

interface AddAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (automation: Omit<Automation, 'id' | 'createdAt' | 'executionCount' | 'successCount' | 'errorCount'>) => void;
}

export const AddAutomationDialog = ({ open, onOpenChange, onAdd }: AddAutomationDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [trigger, setTrigger] = useState<TriggerConfig>({
    type: 'request',
    config: {}
  });
  const [actions, setActions] = useState<ActionConfig[]>([]);
  const [timeout, setTimeout] = useState(30000);
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryDelay, setRetryDelay] = useState(1000);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;

    const automation: Omit<Automation, 'id' | 'createdAt' | 'executionCount' | 'successCount' | 'errorCount'> = {
      name: name.trim(),
      description: description.trim(),
      enabled,
      trigger,
      actions,
      retryPolicy: {
        maxRetries,
        retryDelay,
        backoffMultiplier: 2
      },
      timeout,
      tags,
      lastExecuted: undefined
    };

    onAdd(automation);
    
    // Reset form
    setName('');
    setDescription('');
    setEnabled(true);
    setTrigger({ type: 'request', config: {} });
    setActions([]);
    setTimeout(30000);
    setMaxRetries(3);
    setRetryDelay(1000);
    setTags([]);
    setNewTag('');
    onOpenChange(false);
  };

  const handleTriggerTypeChange = (type: string) => {
    setTrigger({ type: type as any, config: {} });
  };

  const handleTriggerConfigChange = (key: string, value: any) => {
    setTrigger(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const addAction = () => {
    setActions(prev => [...prev, { type: 'api_request', config: {} }]);
  };

  const updateAction = (index: number, field: string, value: any) => {
    setActions(prev => prev.map((action, i) => 
      i === index 
        ? field === 'type' 
          ? { type: value, config: {} }
          : { ...action, config: { ...action.config, [field]: value } }
        : action
    ));
  };

  const removeAction = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const renderTriggerConfig = () => {
    switch (trigger.type) {
      case 'request':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Method</Label>
                <Select 
                  value={trigger.config.method || 'GET'} 
                  onValueChange={(value) => handleTriggerConfigChange('method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Endpoint</Label>
                <Input
                  placeholder="/api/trigger"
                  value={trigger.config.endpoint || ''}
                  onChange={(e) => handleTriggerConfigChange('endpoint', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      
      case 'file_change':
        return (
          <div className="space-y-4">
            <div>
              <Label>Watch Path</Label>
              <Input
                placeholder="/uploads"
                value={trigger.config.watchPath || ''}
                onChange={(e) => handleTriggerConfigChange('watchPath', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>File Pattern</Label>
                <Input
                  placeholder="*.pdf"
                  value={trigger.config.filePattern || ''}
                  onChange={(e) => handleTriggerConfigChange('filePattern', e.target.value)}
                />
              </div>
              <div>
                <Label>Operation</Label>
                <Select 
                  value={trigger.config.operation || 'create'} 
                  onValueChange={(value) => handleTriggerConfigChange('operation', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="modify">Modify</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="move">Move</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      
      case 'schedule':
        return (
          <div className="space-y-4">
            <div>
              <Label>Cron Expression</Label>
              <Input
                placeholder="0 */5 * * * *"
                value={trigger.config.cronExpression || ''}
                onChange={(e) => handleTriggerConfigChange('cronExpression', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Format: second minute hour day month dayOfWeek</p>
            </div>
            <div>
              <Label>Timezone</Label>
              <Input
                placeholder="UTC"
                value={trigger.config.timezone || ''}
                onChange={(e) => handleTriggerConfigChange('timezone', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'database_change':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Table</Label>
                <Input
                  placeholder="users"
                  value={trigger.config.table || ''}
                  onChange={(e) => handleTriggerConfigChange('table', e.target.value)}
                />
              </div>
              <div>
                <Label>Operation</Label>
                <Select 
                  value={trigger.config.operation_db || 'insert'} 
                  onValueChange={(value) => handleTriggerConfigChange('operation_db', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insert">Insert</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Conditions (SQL WHERE clause)</Label>
              <Input
                placeholder="status = 'active'"
                value={trigger.config.conditions || ''}
                onChange={(e) => handleTriggerConfigChange('conditions', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://example.com/webhook"
                value={trigger.config.webhookUrl || ''}
                onChange={(e) => handleTriggerConfigChange('webhookUrl', e.target.value)}
              />
            </div>
            <div>
              <Label>Secret (Optional)</Label>
              <Input
                type="password"
                placeholder="webhook_secret"
                value={trigger.config.secret || ''}
                onChange={(e) => handleTriggerConfigChange('secret', e.target.value)}
              />
            </div>
          </div>
        );
      
      default:
        return <div className="text-gray-500">Manual trigger - no configuration needed</div>;
    }
  };

  const renderActionConfig = (action: ActionConfig, index: number) => {
    switch (action.type) {
      case 'api_request':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Method</Label>
                <Select 
                  value={action.config.method || 'GET'} 
                  onValueChange={(value) => updateAction(index, 'method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  placeholder="https://api.example.com/endpoint"
                  value={action.config.url || ''}
                  onChange={(e) => updateAction(index, 'url', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Request Body (JSON)</Label>
              <Textarea
                placeholder='{"key": "value"}'
                value={action.config.body || ''}
                onChange={(e) => updateAction(index, 'body', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'file_operation':
        return (
          <div className="space-y-4">
            <div>
              <Label>Operation</Label>
              <Select 
                value={action.config.operation || 'create'} 
                onValueChange={(value) => updateAction(index, 'operation', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="move">Move</SelectItem>
                  <SelectItem value="copy">Copy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Source Path</Label>
                <Input
                  placeholder="/path/to/file"
                  value={action.config.sourcePath || ''}
                  onChange={(e) => updateAction(index, 'sourcePath', e.target.value)}
                />
              </div>
              <div>
                <Label>Target Path</Label>
                <Input
                  placeholder="/path/to/destination"
                  value={action.config.targetPath || ''}
                  onChange={(e) => updateAction(index, 'targetPath', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      
      case 'upload_file':
        return (
          <div className="space-y-4">
            <div>
              <Label>Upload Protocol</Label>
              <Select 
                value={action.config.uploadProtocol || 'http'} 
                onValueChange={(value) => updateAction(index, 'uploadProtocol', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP POST</SelectItem>
                  <SelectItem value="ftp">FTP</SelectItem>
                  <SelectItem value="sftp">SFTP</SelectItem>
                  <SelectItem value="s3">AWS S3</SelectItem>
                  <SelectItem value="azure_blob">Azure Blob</SelectItem>
                  <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Endpoint/Bucket</Label>
                <Input
                  placeholder="my-bucket or https://upload.example.com"
                  value={action.config.bucket || action.config.endpoint || ''}
                  onChange={(e) => updateAction(index, action.config.uploadProtocol?.includes('s3') || action.config.uploadProtocol?.includes('blob') || action.config.uploadProtocol?.includes('gcs') ? 'bucket' : 'endpoint', e.target.value)}
                />
              </div>
              <div>
                <Label>Access Key</Label>
                <Input
                  type="password"
                  placeholder="Access key or username"
                  value={action.config.credentials?.accessKey || action.config.credentials?.username || ''}
                  onChange={(e) => updateAction(index, 'credentials', { 
                    ...action.config.credentials, 
                    [action.config.uploadProtocol?.includes('ftp') ? 'username' : 'accessKey']: e.target.value 
                  })}
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="text-gray-500">Basic configuration</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Automation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter automation name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this automation does"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trigger Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Trigger Type</Label>
                <Select value={trigger.type} onValueChange={handleTriggerTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="request">HTTP Request</SelectItem>
                    <SelectItem value="file_change">File Change</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                    <SelectItem value="database_change">Database Change</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderTriggerConfig()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Actions</CardTitle>
                <Button onClick={addAction} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Action
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No actions defined. Add an action to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {actions.map((action, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Action {index + 1}</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAction(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label>Action Type</Label>
                            <Select 
                              value={action.type} 
                              onValueChange={(value) => updateAction(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="api_request">API Request</SelectItem>
                                <SelectItem value="file_operation">File Operation</SelectItem>
                                <SelectItem value="database_operation">Database Operation</SelectItem>
                                <SelectItem value="upload_file">Upload File</SelectItem>
                                <SelectItem value="download_file">Download File</SelectItem>
                                <SelectItem value="send_email">Send Email</SelectItem>
                                <SelectItem value="run_script">Run Script</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {renderActionConfig(action, index)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={timeout}
                onChange={(e) => setTimeout(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="maxRetries">Max Retries</Label>
              <Input
                id="maxRetries"
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
              <Input
                id="retryDelay"
                type="number"
                value={retryDelay}
                onChange={(e) => setRetryDelay(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Create Automation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
