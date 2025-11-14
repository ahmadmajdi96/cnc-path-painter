import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  item_count: number;
}

interface AIModelDatasetSelectorProps {
  modelId: string | null;
  modelType: string;
  projectId?: string;
}

export const AIModelDatasetSelector: React.FC<AIModelDatasetSelectorProps> = ({
  modelId,
  modelType,
  projectId,
}) => {
  const { toast } = useToast();
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [trainedDataset, setTrainedDataset] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [showTrainDialog, setShowTrainDialog] = useState(false);

  const { data: datasets } = useQuery({
    queryKey: ['datasets', projectId],
    queryFn: async () => {
      let query = supabase
        .from('datasets')
        .select('*');
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Dataset[];
    },
  });

  useEffect(() => {
    // Simulate loading the dataset the model was trained on
    // In a real app, you'd fetch this from the database
    if (modelId && datasets && datasets.length > 0) {
      setTrainedDataset(datasets[0].id);
      setSelectedDataset(datasets[0].id);
    }
  }, [modelId, datasets]);

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDataset(datasetId);
  };

  const handleTrainClick = () => {
    setShowTrainDialog(true);
  };

  const handleTrainConfirm = async () => {
    setShowTrainDialog(false);
    setIsTraining(true);

    // Simulate HTTP request to start training
    toast({
      title: "Training started",
      description: "Model training has been initiated"
    });

    // Simulate training completion after 10 seconds
    setTimeout(() => {
      setIsTraining(false);
      setTrainedDataset(selectedDataset);
      toast({
        title: "Training complete",
        description: "Model has been successfully trained on the new dataset"
      });
    }, 10000);
  };

  if (!modelId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Available Datasets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Please select a model to view available datasets
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Available Datasets
            </CardTitle>
            {isTraining && (
              <Badge className="bg-blue-500/10 text-blue-500 animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                Training...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!datasets || datasets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No datasets available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedDataset === dataset.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleDatasetSelect(dataset.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{dataset.name}</p>
                      {trainedDataset === dataset.id && (
                        <Badge variant="outline" className="text-xs">
                          Currently Trained
                        </Badge>
                      )}
                    </div>
                    {dataset.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {dataset.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {dataset.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {dataset.item_count} items
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {selectedDataset && selectedDataset !== trainedDataset && !isTraining && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleTrainClick}
                    className="w-full"
                    size="lg"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Train Model on Selected Dataset
                  </Button>
                </div>
              )}

              {isTraining && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Training in progress...
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showTrainDialog} onOpenChange={setShowTrainDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Training</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to train this model on the selected dataset? This process may
              take several minutes and will update the model's parameters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTrainConfirm}>
              Start Training
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
