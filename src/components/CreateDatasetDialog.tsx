import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateDatasetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectId?: string;
}

export const CreateDatasetDialog = ({ open, onOpenChange, onSuccess, projectId }: CreateDatasetDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'image' | 'file' | 'text'>('image');
  const [mode, setMode] = useState<'classify' | 'annotate'>('annotate');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a dataset name',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    const { data, error } = await supabase
      .from('datasets')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        type,
        mode: type === 'image' ? mode : null,
        status: 'draft',
        project_id: projectId || null,
      })
      .select()
      .single();

    setIsCreating(false);

    if (error) {
      toast({
        title: 'Error creating dataset',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Dataset created',
      description: `"${name}" has been created successfully`,
    });

    // Reset form
    setName('');
    setDescription('');
    setType('image');
    setMode('annotate');

    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Dataset</DialogTitle>
          <DialogDescription>
            Create a new dataset for training AI models
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="My Dataset"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Dataset description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'image' && (
            <div className="space-y-2">
              <Label htmlFor="mode">Mode *</Label>
              <Select value={mode} onValueChange={(value: any) => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annotate">Annotation</SelectItem>
                  <SelectItem value="classify">Classification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Dataset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
