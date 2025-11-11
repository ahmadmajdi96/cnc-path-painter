import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, AlertCircle, Copy } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';
import { useToast } from '@/hooks/use-toast';

interface PlateNumberExtractionPageProps {
  projectId?: string;
}

const PlateNumberExtractionPage = ({ projectId }: PlateNumberExtractionPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Plate number copied to clipboard"
    });
  };

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Plate Number Extraction</h1>
        <p className="text-muted-foreground">
          Extract text from license plates using OCR with support for multiple formats and regions
        </p>
      </div>

      {/* Extraction Interface */}
      <Card>
        <CardHeader>
          <CardTitle>License Plate OCR</CardTitle>
          <CardDescription>Upload plate images for automatic text extraction using OCR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload license plate images for text extraction
            </p>
            <div className="flex gap-2 justify-center">
              <Button disabled={!selectedModel}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <Button variant="outline" disabled={!selectedModel}>
                <Video className="w-4 h-4 mr-2" />
                Live Feed
              </Button>
            </div>
          </div>
          {!selectedModel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              Please select an AI model below to start extraction
            </div>
          )}
          {selectedModel && (
            <div className="text-sm text-muted-foreground">
              Using model: <Badge variant="secondary">{selectedModel.name}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extraction Results */}
      <Card>
        <CardHeader>
          <CardTitle>Extraction Results</CardTitle>
          <CardDescription>Plate number extractions will appear here after processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No extractions yet. Upload a plate image to start OCR extraction.</p>
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="plate_ocr"
          title="AI Models"
          description="Select or configure plate OCR models"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector 
          modelId={selectedModel?.id || null}
          modelType="plate_ocr"
        />
      </div>


      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Character Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">98.5%</div>
            <p className="text-sm text-muted-foreground mt-1">Per character recognition</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plate Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">96.2%</div>
            <p className="text-sm text-muted-foreground mt-1">Complete plate match</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plates Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">18,542</div>
            <p className="text-sm text-muted-foreground mt-1">Total extractions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlateNumberExtractionPage;
