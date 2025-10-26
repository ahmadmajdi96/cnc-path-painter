import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Layers, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const DatasetsCombinerPage = () => {
  const { toast } = useToast();
  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(new Set());

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['all-datasets'],
    queryFn: async () => {
      // Fetch regular datasets
      const { data: regularData, error: regularError } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (regularError) throw regularError;

      // Fetch question datasets
      const { data: questionData, error: questionError } = await supabase
        .from('question_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionError) throw questionError;

      // Fetch rules datasets
      const { data: rulesData, error: rulesError } = await supabase
        .from('rules_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;

      // Combine all datasets
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

      // Sort by created_at
      return allDatasets.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  const toggleDataset = (datasetId: string) => {
    const newSelected = new Set(selectedDatasets);
    if (newSelected.has(datasetId)) {
      newSelected.delete(datasetId);
    } else {
      newSelected.add(datasetId);
    }
    setSelectedDatasets(newSelected);
  };

  const combineDatasets = () => {
    if (selectedDatasets.size < 2) {
      toast({
        title: "Select at least 2 datasets",
        description: "You need to select at least 2 datasets to combine",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Combining datasets",
      description: `Combining ${selectedDatasets.size} datasets into one view`
    });
  };

  const exportCombinedData = () => {
    if (selectedDatasets.size === 0) {
      toast({
        title: "No datasets selected",
        description: "Please select datasets to export",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Exporting combined data",
      description: `Exporting ${selectedDatasets.size} datasets`
    });
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

  return (
    <div className="w-full px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Datasets Combiner</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportCombinedData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={combineDatasets}>
              <Layers className="w-4 h-4 mr-2" />
              Combine Selected
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Select and combine multiple datasets into a unified view
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading datasets...</p>
          </CardContent>
        </Card>
      ) : datasets && datasets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No datasets available to combine</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{selectedDatasets.size}</span> dataset(s)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets?.map((dataset) => (
              <Card
                key={dataset.id}
                className={`cursor-pointer transition-all ${
                  selectedDatasets.has(dataset.id)
                    ? 'border-primary border-2 shadow-lg'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => toggleDataset(dataset.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Checkbox
                        checked={selectedDatasets.has(dataset.id)}
                        onCheckedChange={() => toggleDataset(dataset.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <CardTitle className="text-base">{dataset.name}</CardTitle>
                    </div>
                  </div>
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

          {selectedDatasets.size > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Combined View Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You have selected the following datasets:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedDatasets).map((datasetId) => {
                      const dataset = datasets?.find(d => d.id === datasetId);
                      return dataset ? (
                        <Badge key={datasetId} variant="secondary" className="px-3 py-1">
                          {dataset.name}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({dataset.item_count || 0} items)
                          </span>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium">
                      Total items:{' '}
                      <span className="text-primary">
                        {Array.from(selectedDatasets).reduce((sum, id) => {
                          const dataset = datasets?.find(d => d.id === id);
                          return sum + (dataset?.item_count || 0);
                        }, 0)}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DatasetsCombinerPage;
