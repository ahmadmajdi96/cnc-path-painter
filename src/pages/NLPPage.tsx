
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, FileText, MessageSquare, Zap, Upload } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';

const NLPPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Natural Language Processing</h1>
          <p className="text-gray-600">Analyze and process text with advanced AI language models</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Text Processing Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Text Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">Enter text or upload document for analysis</p>
                  <div className="flex gap-2 justify-center">
                    <Button disabled={!selectedModel}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button variant="outline" disabled={!selectedModel}>
                      <Zap className="w-4 h-4 mr-2" />
                      Quick Analysis
                    </Button>
                  </div>
                </div>
                
                {selectedModel ? (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Selected Model:</p>
                    <p className="text-sm text-blue-700">{selectedModel.name}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700">Please select an NLP model to start text analysis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Sentiment Analysis</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Positive</Badge>
                    <span className="text-sm text-gray-600">Confidence: 94.2%</span>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Key Entities</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Company: TechCorp</Badge>
                    <Badge variant="outline">Person: John Smith</Badge>
                    <Badge variant="outline">Location: New York</Badge>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Technology</Badge>
                    <Badge variant="secondary">Business</Badge>
                    <Badge variant="secondary">Innovation</Badge>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-gray-600">
                    The document discusses technological innovations in business, focusing on TechCorp's recent developments and John Smith's leadership in New York operations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Model Manager */}
        <AIModelManager
          modelType="nlp"
          title="NLP"
          description="AI models for natural language processing and text analysis"
          onModelSelect={setSelectedModel}
          selectedModelId={selectedModel?.id}
        />

        {/* NLP Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Analyze emotional tone and sentiment in text</p>
              <div className="mt-2">
                <Badge variant="default">96.8% Accuracy</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Entity Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Extract names, places, organizations from text</p>
              <div className="mt-2">
                <Badge variant="default">94.2% Precision</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Text Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Categorize and classify documents automatically</p>
              <div className="mt-2">
                <Badge variant="default">92.5% F1-Score</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Text Summarization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Generate concise summaries of long documents</p>
              <div className="mt-2">
                <Badge variant="default">0.8s Avg Time</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NLPPage;
