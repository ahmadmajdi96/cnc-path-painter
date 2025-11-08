import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Automation } from './AutomationControlSystem';

interface EditAutomationDialogProps {
  automation: Automation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (automation: Automation) => void;
}

export const EditAutomationDialog = ({ automation, open, onOpenChange, onSave }: EditAutomationDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setDescription(automation.description || '');
      setCategory(automation.category || '');
      setEnabled(automation.enabled);
    }
  }, [automation]);

  const handleSubmit = () => {
    if (!automation || !name.trim()) return;

    const updatedAutomation: Automation = {
      ...automation,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      enabled,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedAutomation);
    onOpenChange(false);
  };

  if (!automation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Automation</DialogTitle>
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
            <div>
              <Label htmlFor="category">Category / Tag</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Data Processing"
              />
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

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="enabled">Enabled</Label>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Function Configuration</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Operations:</strong> {automation.operations.length}</p>
              <p><strong>Input Parameters:</strong> {automation.inputParameters.length}</p>
              <p><strong>Output Parameters:</strong> {automation.outputParameters.length}</p>
              <p><strong>Environment Variables:</strong> {automation.environmentVariables.length}</p>
              {automation.metadata && (
                <>
                  {automation.metadata.returnType && <p><strong>Return Type:</strong> {automation.metadata.returnType}</p>}
                  {automation.metadata.complexityLevel && <p><strong>Complexity:</strong> {automation.metadata.complexityLevel}</p>}
                  {automation.metadata.preferredLibraries && automation.metadata.preferredLibraries.length > 0 && (
                    <p><strong>Libraries:</strong> {automation.metadata.preferredLibraries.join(', ')}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
