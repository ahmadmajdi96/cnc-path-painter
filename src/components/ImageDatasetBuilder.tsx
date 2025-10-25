import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Upload, Plus, X, Tag, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageAnnotationCanvas } from './ImageAnnotationCanvas';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DatasetClass {
  id: string;
  name: string;
  color: string;
}

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  annotations: Annotation[];
  classification?: string;
}

interface Annotation {
  id: string;
  classId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

interface ImageDatasetBuilderProps {
  datasetId: string;
}

export const ImageDatasetBuilder = ({ datasetId }: ImageDatasetBuilderProps) => {
  const [newClassName, setNewClassName] = useState('');
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dataset info
  const { data: dataset } = useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['dataset-classes', datasetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dataset_classes')
        .select('*')
        .eq('dataset_id', datasetId);
      if (error) throw error;
      return data as DatasetClass[];
    },
  });

  // Fetch items
  const { data: items = [] } = useQuery({
    queryKey: ['dataset-items', datasetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dataset_items')
        .select('*')
        .eq('dataset_id', datasetId);
      if (error) throw error;
      return data;
    },
  });

  // Fetch annotations for selected image
  const { data: annotations = [] } = useQuery({
    queryKey: ['dataset-annotations', selectedImage?.id],
    queryFn: async () => {
      if (!selectedImage) return [];
      const { data, error } = await supabase
        .from('dataset_annotations')
        .select('*')
        .eq('dataset_item_id', selectedImage.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedImage,
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('dataset_classes')
        .insert({
          dataset_id: datasetId,
          name: name.trim(),
          color: COLORS[classes.length % COLORS.length],
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataset-classes', datasetId] });
      toast({ title: 'Class added' });
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from('dataset_classes')
        .delete()
        .eq('id', classId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataset-classes', datasetId] });
      toast({ title: 'Class removed' });
    },
  });

  // Update item classification mutation
  const updateClassificationMutation = useMutation({
    mutationFn: async ({ itemId, classId }: { itemId: string; classId: string }) => {
      const { error } = await supabase
        .from('dataset_items')
        .update({ classification_class_id: classId })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataset-items', datasetId] });
    },
  });

  // Update annotations mutation
  const updateAnnotationsMutation = useMutation({
    mutationFn: async ({ itemId, newAnnotations }: { itemId: string; newAnnotations: Annotation[] }) => {
      // Delete existing annotations
      await supabase
        .from('dataset_annotations')
        .delete()
        .eq('dataset_item_id', itemId);

      // Insert new annotations
      if (newAnnotations.length > 0) {
        const annotationsToInsert = newAnnotations.map(ann => ({
          dataset_item_id: itemId,
          class_id: ann.classId,
          x: ann.x,
          y: ann.y,
          width: ann.width,
          height: ann.height,
        }));

        const { error } = await supabase
          .from('dataset_annotations')
          .insert(annotationsToInsert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataset-annotations'] });
    },
  });

  const mode = dataset?.mode || 'annotate';

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: 'Invalid class name',
        description: 'Please enter a valid class name',
        variant: 'destructive',
      });
      return;
    }

    createClassMutation.mutate(newClassName);
    setNewClassName('');
  };

  const handleRemoveClass = (classId: string) => {
    deleteClassMutation.mutate(classId);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (files.length > 100) {
      toast({
        title: 'Too many files',
        description: 'You can upload a maximum of 100 images at once',
        variant: 'destructive',
      });
      return;
    }

    const itemsToInsert = Array.from(files).map((file) => ({
      dataset_id: datasetId,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    const { error } = await supabase.from('dataset_items').insert(itemsToInsert);

    if (error) {
      toast({
        title: 'Error uploading images',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    // Update item count
    await supabase
      .from('datasets')
      .update({ item_count: items.length + files.length })
      .eq('id', datasetId);

    queryClient.invalidateQueries({ queryKey: ['dataset-items', datasetId] });
    queryClient.invalidateQueries({ queryKey: ['dataset', datasetId] });

    toast({
      title: 'Images uploaded',
      description: `${files.length} image(s) uploaded successfully`,
    });
  };

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
  };

  const handleAnnotationUpdate = (newAnnotations: Annotation[]) => {
    if (!selectedImage) return;
    updateAnnotationsMutation.mutate({
      itemId: selectedImage.id,
      newAnnotations,
    });
  };

  const handleClassificationUpdate = (itemId: string, classId: string) => {
    updateClassificationMutation.mutate({ itemId, classId });
  };

  // Transform database items to match UploadedImage interface
  const images: UploadedImage[] = items.map((item: any) => ({
    id: item.id,
    url: item.url,
    name: item.name,
    annotations: [],
    classification: item.classification_class_id,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Classes and Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Classes
          </CardTitle>
          <CardDescription>
            Define classes for classification or annotation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter class name"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddClass()}
            />
            <Button onClick={handleAddClass} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="text-sm font-medium">{cls.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveClass(cls.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Upload Images</p>
                <p className="text-xs text-muted-foreground mt-1">Max 100 images</p>
              </div>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </Label>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>{images.length} image(s) uploaded</p>
          </div>
        </CardContent>
      </Card>

      {/* Middle Panel - Image Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>
            {mode === 'classify' ? 'Select images to classify' : 'Select images to annotate'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover rounded border-2 transition-all hover:border-primary"
                  style={{
                    borderColor: selectedImage?.id === image.id ? 'hsl(var(--primary))' : undefined
                  }}
                />
                <div className="absolute top-2 right-2">
                  {mode === 'annotate' && annotations.filter(a => a.dataset_item_id === image.id).length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Box className="w-3 h-3 mr-1" />
                      {annotations.filter(a => a.dataset_item_id === image.id).length}
                    </Badge>
                  )}
                  {mode === 'classify' && image.classification && (
                    <Badge variant="secondary" className="text-xs">
                      {classes.find(c => c.id === image.classification)?.name}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No images uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Annotation/Classification */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'annotate' ? 'Annotate' : 'Classify'}
          </CardTitle>
          <CardDescription>
            {selectedImage ? selectedImage.name : 'Select an image to start'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedImage ? (
            mode === 'annotate' ? (
              <ImageAnnotationCanvas
                image={selectedImage}
                classes={classes}
                annotations={annotations
                  .filter(a => a.dataset_item_id === selectedImage.id)
                  .map(a => ({
                    id: a.id,
                    classId: a.class_id,
                    x: Number(a.x),
                    y: Number(a.y),
                    width: Number(a.width),
                    height: Number(a.height),
                  }))}
                onAnnotationsUpdate={handleAnnotationUpdate}
              />
            ) : (
              <div className="space-y-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="w-full rounded border"
                />
                <div>
                  <Label>Select Class</Label>
                  <Select
                    value={selectedImage.classification}
                    onValueChange={(value) => handleClassificationUpdate(selectedImage.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: cls.color }}
                            />
                            {cls.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Select an image to start {mode === 'annotate' ? 'annotating' : 'classifying'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
