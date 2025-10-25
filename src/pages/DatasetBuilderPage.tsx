import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ImageDatasetBuilder } from '@/components/ImageDatasetBuilder';
import { FileDatasetBuilder } from '@/components/FileDatasetBuilder';
import { TextDatasetBuilder } from '@/components/TextDatasetBuilder';
import { Database, Image, FileText, Type } from 'lucide-react';

const DatasetBuilderPage = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Dataset Builder</h1>
        </div>
        <p className="text-muted-foreground">
          Build and annotate datasets for training computer vision and AI models
        </p>
      </div>

      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          <ImageDatasetBuilder />
        </TabsContent>

        <TabsContent value="files">
          <FileDatasetBuilder />
        </TabsContent>

        <TabsContent value="text">
          <TextDatasetBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatasetBuilderPage;
