import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Upload, Plus, X, Tag, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageAnnotationCanvas } from './ImageAnnotationCanvas';
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

export const ImageDatasetBuilder = () => {
  const [classes, setClasses] = useState<DatasetClass[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [mode, setMode] = useState<'classify' | 'annotate'>('annotate');
  const { toast } = useToast();

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: "Invalid class name",
        description: "Please enter a valid class name",
        variant: "destructive"
      });
      return;
    }

    const newClass: DatasetClass = {
      id: Date.now().toString(),
      name: newClassName.trim(),
      color: COLORS[classes.length % COLORS.length]
    };

    setClasses([...classes, newClass]);
    setNewClassName('');
    toast({
      title: "Class added",
      description: `Class "${newClass.name}" has been added`
    });
  };

  const handleRemoveClass = (classId: string) => {
    setClasses(classes.filter(c => c.id !== classId));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (files.length > 100) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 100 images at once",
        variant: "destructive"
      });
      return;
    }

    const newImages: UploadedImage[] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newImages.push({
        id: Date.now().toString() + Math.random(),
        url,
        name: file.name,
        annotations: [],
      });
    });

    setImages([...images, ...newImages]);
    toast({
      title: "Images uploaded",
      description: `${newImages.length} image(s) uploaded successfully`
    });
  };

  const handleImageClick = (image: UploadedImage) => {
    setSelectedImage(image);
  };

  const handleAnnotationUpdate = (annotations: Annotation[]) => {
    if (!selectedImage) return;

    setImages(images.map(img => 
      img.id === selectedImage.id 
        ? { ...img, annotations } 
        : img
    ));
    setSelectedImage({ ...selectedImage, annotations });
  };

  const handleClassificationUpdate = (imageId: string, classId: string) => {
    setImages(images.map(img => 
      img.id === imageId 
        ? { ...img, classification: classId } 
        : img
    ));
  };

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
            <Label htmlFor="mode" className="mb-2 block">Mode</Label>
            <Select value={mode} onValueChange={(value: 'classify' | 'annotate') => setMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classify">Classification</SelectItem>
                <SelectItem value="annotate">Annotation</SelectItem>
              </SelectContent>
            </Select>
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
                  {mode === 'annotate' && image.annotations.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Box className="w-3 h-3 mr-1" />
                      {image.annotations.length}
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
                annotations={selectedImage.annotations}
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
