import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Dataset {
  id: string;
  name: string;
  description: string | null;
  type: 'image' | 'file' | 'text' | 'questions' | 'rules';
  item_count?: number;
}

interface Combination {
  id: string;
  name: string;
  description: string | null;
  dataset_ids: string[];
}

interface EditCombinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  combination: Combination | null;
  datasets: Dataset[];
  onSuccess: () => void;
}

export const EditCombinationDialog = ({ open, onOpenChange, combination, datasets, onSuccess }: EditCombinationDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (combination) {
      setName(combination.name);
      setDescription(combination.description || '');
      setSelectedDatasets(new Set(combination.dataset_ids));
    }
  }, [combination]);

  const toggleDataset = (datasetId: string) => {
    const newSelected = new Set(selectedDatasets);
    if (newSelected.has(datasetId)) {
      newSelected.delete(datasetId);
    } else {
      newSelected.add(datasetId);
    }
    setSelectedDatasets(newSelected);
  };

  const handleUpdate = async () => {
    if (!combination) return;

    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for the combination',
        variant: 'destructive',
      });
      return;
    }

    if (selectedDatasets.size < 2) {
      toast({
        title: 'Select at least 2 datasets',
        description: 'You need to select at least 2 datasets',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('dataset_combinations')
        .update({
          name,
          description: description || null,
          dataset_ids: Array.from(selectedDatasets),
        })
        .eq('id', combination.id);

      if (error) throw error;

      toast({
        title: 'Combination updated',
        description: `Successfully updated "${name}"`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating combination:', error);
      toast({
        title: 'Error updating combination',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-blue-500/10 text-blue-500';
      case 'file':
        return 'bg-green-500/10 text-green-500';
      case 'text':
        return 'bg-purple-500/10 text-purple-500';
      case 'questions':
        return 'bg-orange-500/10 text-orange-500';
      case 'rules':
        return 'bg-pink-500/10 text-pink-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!combination) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Dataset Combination</DialogTitle>
          <DialogDescription>
            Update the name, description, or selected datasets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Training Data Mix Q1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of this combination"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Datasets (minimum 2) *</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Selected: {selectedDatasets.size} dataset(s)
            </div>
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              <div className="space-y-2">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDatasets.has(dataset.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleDataset(dataset.id)}
                  >
                    <Checkbox
                      checked={selectedDatasets.has(dataset.id)}
                      onCheckedChange={() => toggleDataset(dataset.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{dataset.name}</span>
                        <Badge className={getTypeColor(dataset.type)} variant="secondary">
                          {dataset.type}
                        </Badge>
                      </div>
                      {dataset.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {dataset.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {dataset.item_count || 0} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Combination'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};