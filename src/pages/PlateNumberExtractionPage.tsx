import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, AlertCircle, Copy } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';
import { useToast } from '@/hooks/use-toast';

const PlateNumberExtractionPage = () => {
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
          <CardDescription>Recognized plate numbers with confidence scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { number: 'ABC 1234', region: 'US', confidence: 0.98 },
              { number: 'XYZ-9876', region: 'EU', confidence: 0.96 },
              { number: '京A 12345', region: 'CN', confidence: 0.94 },
              { number: 'DEF 567', region: 'UK', confidence: 0.91 },
            ].map((plate, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-lg font-semibold">{plate.number}</div>
                  <Badge variant="outline">{plate.region}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{(plate.confidence * 100).toFixed(1)}%</Badge>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(plate.number)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="plate_ocr"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector selectedModel={selectedModel} />
      </div>

      {/* Dataset Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Requirements</CardTitle>
          <CardDescription>OCR training data with character-level annotations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Structure:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <div>dataset/</div>
              <div>├── images/</div>
              <div>│   ├── plate_001.jpg</div>
              <div>│   └── ...</div>
              <div>└── annotations/</div>
              <div>    └── labels.txt</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Annotation Format:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div># filename, plate_text</div>
              <div>plate_001.jpg, ABC1234</div>
              <div>plate_002.jpg, XYZ-9876</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Character Set:</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Support for alphanumeric and special characters:
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              A-Z, 0-9, -, space, and region-specific characters
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Preprocessing:</h4>
            <div className="flex flex-wrap gap-2">
              {['Deskew', 'Denoise', 'Contrast Enhancement', 'Normalization', 'Segmentation'].map(process => (
                <Badge key={process} variant="outline">{process}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
