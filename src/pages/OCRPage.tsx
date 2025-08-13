
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Copy, Settings } from 'lucide-react';

const OCRPage = () => {
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Optical Character Recognition</h1>
          <p className="text-gray-600">Extract and digitize text from images and documents</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Drag and drop your image or document here</p>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure OCR
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Extracted Text
                <Badge variant="secondary" className="ml-auto">
                  Confidence: 98.5%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted text will appear here..."
                className="min-h-[300px] mb-4"
              />
              
              <div className="flex gap-2">
                <Button size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Processing History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent OCR Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 1, filename: 'invoice_2024_001.pdf', status: 'completed', confidence: '98.5%', date: '2 hours ago' },
                { id: 2, filename: 'contract_scan.jpg', status: 'completed', confidence: '96.2%', date: '4 hours ago' },
                { id: 3, filename: 'receipt_image.png', status: 'processing', confidence: '-', date: 'Just now' },
              ].map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{task.filename}</p>
                      <p className="text-sm text-gray-500">{task.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Confidence: {task.confidence}</span>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OCRPage;
