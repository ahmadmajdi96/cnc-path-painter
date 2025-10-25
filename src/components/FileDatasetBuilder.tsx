import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface FileDatasetBuilderProps {
  datasetId: string;
}

export const FileDatasetBuilder = ({ datasetId }: FileDatasetBuilderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>File Dataset Builder</CardTitle>
        <CardDescription>
          Build datasets from various file types
        </CardDescription>
      </CardHeader>
      <CardContent className="py-12">
        <div className="text-center text-muted-foreground">
          <Construction className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Coming Soon</p>
          <p className="text-sm mt-2">File dataset builder is under development</p>
        </div>
      </CardContent>
    </Card>
  );
};
