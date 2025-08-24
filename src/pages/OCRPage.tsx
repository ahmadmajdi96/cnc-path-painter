
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Upload, Copy, Download, Image } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { useAIModelProcessor } from '@/hooks/useAIModelProcessor';
import { useToast } from '@/hooks/use-toast';

const OCRPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');
  const { processWithModel, isProcessing, result } = useAIModelProcessor();
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleExtractText = async () => {
    if (!imageUrl) {
      toast({
        title: "No document uploaded",
        description: "Please upload a document or image first",
        variant: "destructive"
      });
      return;
    }

    try {
      await processWithModel(selectedModel?.id, 'ocr', {
        image: imageUrl,
        prompt: 'Extract all text from this image accurately, maintaining structure and formatting.'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCopyText = () => {
    if (result?.extracted_text) {
      navigator.clipboard.writeText(result.extracted_text);
      toast({
        title: "Text copied",
        description: "Extracted text has been copied to clipboard"
      });
    }
  };

  const handleDownloadText = () => {
    if (result?.extracted_text) {
      const blob = new Blob([result.extracted_text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Optical Character Recognition</h1>
          <p className="text-gray-600">Extract and digitize text from images and documents with AI-powered OCR</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* OCR Processing Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Text Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imageUrl ? (
                  <div className="border rounded-lg overflow-hidden">
                    <img src={imageUrl} alt="Document" className="w-full h-48 object-cover" />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload document or image for text extraction</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload">
                    <Button asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </span>
                    </Button>
                  </label>
                  <Button 
                    onClick={handleExtractText}
                    disabled={!selectedModel || !imageUrl || isProcessing}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Extracting...' : 'Extract Text'}
                  </Button>
                </div>
              </div>
              
              {selectedModel ? (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected OCR Model:</p>
                  <p className="text-sm text-blue-700">{selectedModel.name}</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">Please select an OCR model to start extracting text</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted Text Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Extracted Text
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopyText} disabled={!result?.extracted_text}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownloadText} disabled={!result?.extracted_text}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Extracting text...</span>
                </div>
              ) : result ? (
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] font-mono text-sm mb-4">
                    <pre className="whitespace-pre-wrap">{result.extracted_text || result.result}</pre>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    {result.confidence && (
                      <span className="text-gray-600">Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                    )}
                    <Badge variant="default">Processing Complete</Badge>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] font-mono text-sm flex items-center justify-center">
                  <p className="text-gray-500">Upload a document and click "Extract Text" to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Model Manager */}
        <AIModelManager
          modelType="ocr"
          title="OCR"
          description="AI models for optical character recognition and text extraction"
          onModelSelect={setSelectedModel}
          selectedModelId={selectedModel?.id}
        />

        {/* OCR Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recognition Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">98.5%</div>
              <p className="text-sm text-gray-500">Character accuracy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Documents Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">456</div>
              <p className="text-sm text-gray-500">Processed documents</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">12</div>
              <p className="text-sm text-gray-500">Supported languages</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Processing Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">1.2s</div>
              <p className="text-sm text-gray-500">Average per page</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OCRPage;
