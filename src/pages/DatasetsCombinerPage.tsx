import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateCombinationDialog } from '@/components/CreateCombinationDialog';
import { EditCombinationDialog } from '@/components/EditCombinationDialog';
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
  type: 'image' | 'file' | 'text' | 'questions' | 'rules';
  mode?: 'classify' | 'annotate' | null;
  status: 'draft' | 'in_progress' | 'completed';
  item_count?: number;
  created_at: string;
}

interface Combination {
  id: string;
  name: string;
  description: string | null;
  dataset_ids: string[];
  created_at: string;
}

interface DatasetsCombinerPageProps {
  projectId?: string;
}

const DatasetsCombinerPage = ({ projectId }: DatasetsCombinerPageProps = {}) => {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCombination, setSelectedCombination] = useState<Combination | null>(null);
  const [viewCombinationId, setViewCombinationId] = useState<string | null>(null);

  const { data: datasets, isLoading: loadingDatasets } = useQuery({
    queryKey: ['all-datasets', projectId],
    queryFn: async () => {
      let regularQuery = supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        regularQuery = regularQuery.eq('project_id', projectId);
      }

      const { data: regularData, error: regularError } = await regularQuery;

      if (regularError) throw regularError;

      const { data: questionData, error: questionError } = await supabase
        .from('question_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionError) throw questionError;

      const { data: rulesData, error: rulesError } = await supabase
        .from('rules_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;

      const allDatasets: Dataset[] = [
        ...(regularData || []).map(d => ({ 
          id: d.id,
          name: d.name,
          description: d.description,
          type: d.type as 'image' | 'file' | 'text',
          mode: d.mode as 'classify' | 'annotate' | null,
          status: d.status as 'draft' | 'in_progress' | 'completed',
          item_count: d.item_count || 0,
          created_at: d.created_at
        })),
        ...(questionData || []).map(d => ({ 
          id: d.id,
          name: d.name,
          description: d.description,
          type: 'questions' as const,
          status: d.status as 'draft' | 'in_progress' | 'completed',
          item_count: 0,
          created_at: d.created_at
        })),
        ...(rulesData || []).map(d => ({ 
          id: d.id,
          name: d.name,
          description: d.description,
          type: 'rules' as const,
          status: d.status as 'draft' | 'in_progress' | 'completed',
          item_count: 0,
          created_at: d.created_at
        }))
      ];

      return allDatasets.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  const { data: combinations, isLoading: loadingCombinations, refetch: refetchCombinations } = useQuery({
    queryKey: ['dataset-combinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dataset_combinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Combination[];
    },
  });

  const handleDelete = async () => {
    if (!selectedCombination) return;

    try {
      const { error } = await supabase
        .from('dataset_combinations')
        .delete()
        .eq('id', selectedCombination.id);

      if (error) throw error;

      toast({
        title: 'Combination deleted',
        description: `Successfully deleted "${selectedCombination.name}"`,
      });

      refetchCombinations();
      setDeleteDialogOpen(false);
      setSelectedCombination(null);
    } catch (error) {
      console.error('Error deleting combination:', error);
      toast({
        title: 'Error deleting combination',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const getCombinationDatasets = (datasetIds: string[]) => {
    return datasets?.filter(d => datasetIds.includes(d.id)) || [];
  };

  const getTotalItems = (datasetIds: string[]) => {
    const combinedDatasets = getCombinationDatasets(datasetIds);
    return combinedDatasets.reduce((sum, d) => sum + (d.item_count || 0), 0);
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

  const viewedCombination = viewCombinationId 
    ? combinations?.find(c => c.id === viewCombinationId)
    : null;

  if (viewedCombination) {
    const combinedDatasets = getCombinationDatasets(viewedCombination.dataset_ids);
    
    return (
      <div className="w-full px-6 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setViewCombinationId(null)}>
            ← Back to Combinations
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{viewedCombination.name}</h1>
          </div>
          {viewedCombination.description && (
            <p className="text-muted-foreground">{viewedCombination.description}</p>
          )}
          <div className="mt-4 flex gap-4">
            <Badge variant="outline">{combinedDatasets.length} datasets</Badge>
            <Badge variant="outline">{getTotalItems(viewedCombination.dataset_ids)} total items</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combinedDatasets.map((dataset) => (
            <Card key={dataset.id}>
              <CardHeader>
                <CardTitle className="text-base">{dataset.name}</CardTitle>
                {dataset.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {dataset.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(dataset.type)}>
                      {dataset.type}
                    </Badge>
                    {dataset.mode && (
                      <Badge variant="outline">{dataset.mode}</Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {dataset.item_count || 0} items
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Dataset Combinations</h1>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Combination
          </Button>
        </div>
        <p className="text-muted-foreground">
          Create and manage combinations of multiple datasets for unified training and analysis
        </p>
      </div>

      {loadingCombinations || loadingDatasets ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : combinations && combinations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No dataset combinations yet</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Combination
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combinations?.map((combination) => {
            const combinedDatasets = getCombinationDatasets(combination.dataset_ids);
            
            return (
              <Card key={combination.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base flex-1">{combination.name}</CardTitle>
                  </div>
                  {combination.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {combination.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Datasets:</span>
                      <Badge variant="secondary">{combination.dataset_ids.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Items:</span>
                      <Badge variant="secondary">{getTotalItems(combination.dataset_ids)}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {combinedDatasets.slice(0, 3).map((dataset) => (
                        <Badge key={dataset.id} className={getTypeColor(dataset.type)} variant="outline">
                          {dataset.type}
                        </Badge>
                      ))}
                      {combinedDatasets.length > 3 && (
                        <Badge variant="outline">+{combinedDatasets.length - 3}</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setViewCombinationId(combination.id)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCombination(combination);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCombination(combination);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateCombinationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        datasets={datasets || []}
        onSuccess={refetchCombinations}
      />

      <EditCombinationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        combination={selectedCombination}
        datasets={datasets || []}
        onSuccess={refetchCombinations}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Combination</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCombination?.name}"? This action cannot be undone.
              The individual datasets will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DatasetsCombinerPage;