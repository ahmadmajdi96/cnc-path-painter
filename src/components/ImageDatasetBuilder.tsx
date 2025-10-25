import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Plus, X, Tag, Box, ZoomIn, ZoomOut, Move, Hand } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

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
  const [selectedClassForAnnotation, setSelectedClassForAnnotation] = useState<string>('');
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

  // Set first class as selected by default
  useEffect(() => {
    if (classes.length > 0 && !selectedClassForAnnotation) {
      setSelectedClassForAnnotation(classes[0].id);
    }
  }, [classes]);

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Left Sidebar - Image List */}
      <div className="w-64 border rounded-lg bg-card flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Images ({images.length})</h3>
          <Label htmlFor="image-upload" className="cursor-pointer">
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-accent transition-colors">
              <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-medium">Upload Images</p>
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

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage?.id === image.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-primary/50'
                }`}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{image.name}</p>
                  <div className="flex gap-1 mt-1">
                    {mode === 'annotate' && annotations.filter(a => a.dataset_item_id === image.id).length > 0 && (
                      <Badge variant="secondary" className="text-xs h-5">
                        <Box className="w-3 h-3 mr-1" />
                        {annotations.filter(a => a.dataset_item_id === image.id).length}
                      </Badge>
                    )}
                    {mode === 'classify' && image.classification && (
                      <Badge variant="secondary" className="text-xs h-5">
                        {classes.find(c => c.id === image.classification)?.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center - Main Canvas */}
      <div className="flex-1 border rounded-lg bg-card flex flex-col">
        {selectedImage ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selectedImage.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {mode === 'annotate' 
                    ? `${annotations.filter(a => a.dataset_item_id === selectedImage.id).length} annotations` 
                    : 'Classification mode'
                  }
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {mode === 'annotate' ? (
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
                  selectedClass={selectedClassForAnnotation}
                />
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="max-w-2xl w-full space-y-4">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.name}
                      className="w-full rounded-lg border"
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
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Box className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No image selected</p>
              <p className="text-sm mt-2">Select an image from the left to start {mode === 'annotate' ? 'annotating' : 'classifying'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Classes & Tools */}
      <div className="w-80 border rounded-lg bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5" />
            <h3 className="font-semibold">Classes</h3>
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Class name"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddClass()}
            />
            <Button onClick={handleAddClass} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedClassForAnnotation === cls.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedClassForAnnotation(cls.id)}
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
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClass(cls.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {classes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No classes yet</p>
                <p className="text-xs mt-1">Add classes to start labeling</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {mode === 'annotate' && (
          <>
            <Separator />
            <div className="p-4">
              <h4 className="text-sm font-semibold mb-3">Annotation Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Select a class before drawing</li>
                <li>• Click and drag to create boxes</li>
                <li>• Drag corners to resize</li>
                <li>• Click box center to move</li>
                <li>• Press Delete to remove</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
