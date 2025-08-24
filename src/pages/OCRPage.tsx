
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Copy, Download, Image } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';

const OCRPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload document or image for text extraction</p>
                <Button disabled={!selectedModel}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
              
              {selectedModel ? (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected OCR Model:</p>
                  <p className="text-sm text-blue-700">{selectedModel.name}</p>
                </div>
              ) : (
                <div className="p-3 bg-orange-50 rounded-lg">
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
                  <Button size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] font-mono text-sm">
                <p className="text-gray-500 mb-2">Sample extracted text will appear here...</p>
                <div className="space-y-2">
                  <p>Invoice #: INV-2024-001</p>
                  <p>Date: March 15, 2024</p>
                  <p>Amount: $1,250.00</p>
                  <p>Customer: Acme Corporation</p>
                  <p>Description: Professional services</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">Confidence: 96.8%</span>
                <Badge variant="default">Processing Complete</Badge>
              </div>
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
