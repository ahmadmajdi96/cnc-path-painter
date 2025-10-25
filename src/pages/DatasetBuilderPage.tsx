import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, Plus, Image, FileText, Type, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateDatasetDialog } from '@/components/CreateDatasetDialog';
import { ImageDatasetBuilder } from '@/components/ImageDatasetBuilder';
import { FileDatasetBuilder } from '@/components/FileDatasetBuilder';
import { TextDatasetBuilder } from '@/components/TextDatasetBuilder';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Dataset {
  id: string;
  name: string;
  description: string | null;
  type: 'image' | 'file' | 'text';
  mode: 'classify' | 'annotate' | null;
  status: 'draft' | 'in_progress' | 'completed';
  item_count: number;
  created_at: string;
}

const DatasetBuilderPage = () => {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const { toast } = useToast();

  const { data: datasets, refetch } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Dataset[];
    },
  });

  const handleDeleteDataset = async () => {
    if (!datasetToDelete) return;

    const { error } = await supabase
      .from('datasets')
      .delete()
      .eq('id', datasetToDelete.id);

    if (error) {
      toast({
        title: 'Error deleting dataset',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Dataset deleted',
      description: `"${datasetToDelete.name}" has been deleted successfully`,
    });

    if (selectedDataset?.id === datasetToDelete.id) {
      setSelectedDataset(null);
    }

    setDeleteDialogOpen(false);
    setDatasetToDelete(null);
    refetch();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      case 'text':
        return <Type className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (selectedDataset) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedDataset(null)} className="mb-4">
            ← Back to Datasets
          </Button>
          <div className="flex items-center gap-3 mb-2">
            {getTypeIcon(selectedDataset.type)}
            <h1 className="text-3xl font-bold">{selectedDataset.name}</h1>
          </div>
          {selectedDataset.description && (
            <p className="text-muted-foreground">{selectedDataset.description}</p>
          )}
        </div>

        {selectedDataset.type === 'image' && (
          <ImageDatasetBuilder datasetId={selectedDataset.id} />
        )}
        {selectedDataset.type === 'file' && (
          <FileDatasetBuilder datasetId={selectedDataset.id} />
        )}
        {selectedDataset.type === 'text' && (
          <TextDatasetBuilder datasetId={selectedDataset.id} />
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Dataset Builder</h1>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Dataset
          </Button>
        </div>
        <p className="text-muted-foreground">
          Build and annotate datasets for training computer vision and AI models
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets?.map((dataset) => (
          <Card
            key={dataset.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedDataset(dataset)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(dataset.type)}
                  <CardTitle className="text-lg">{dataset.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDatasetToDelete(dataset);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              {dataset.description && (
                <CardDescription className="line-clamp-2">
                  {dataset.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(dataset.status)}>
                    {dataset.status.replace('_', ' ')}
                  </Badge>
                  {dataset.mode && (
                    <Badge variant="outline">{dataset.mode}</Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {dataset.item_count} items
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {datasets?.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No datasets yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first dataset to start building AI training data
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Dataset
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateDatasetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setCreateDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{datasetToDelete?.name}"? This action cannot be
              undone and will delete all classes, items, and annotations associated with this
              dataset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDataset} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DatasetBuilderPage;
