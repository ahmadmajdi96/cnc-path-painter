
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, FileText, MessageSquare, Zap, Upload } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { useAIModelProcessor } from '@/hooks/useAIModelProcessor';
import { useToast } from '@/hooks/use-toast';

const NLPPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [analysisTask, setAnalysisTask] = useState('sentiment');
  const { processWithModel, isProcessing, result } = useAIModelProcessor();
  const { toast } = useToast();

  const handleAnalyzeText = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter text to analyze",
        variant: "destructive"
      });
      return;
    }

    try {
      await processWithModel(selectedModel?.id, 'nlp', {
        text: inputText,
        task: analysisTask
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleQuickAnalysis = () => {
    const sampleTexts = {
      sentiment: "I absolutely love this new product! It's amazing and works perfectly.",
      summary: "Artificial intelligence (AI) is transforming industries across the globe. From healthcare to finance, AI technologies are being implemented to improve efficiency, reduce costs, and enhance customer experiences. Machine learning algorithms can process vast amounts of data to identify patterns and make predictions. Natural language processing enables computers to understand and respond to human language. Computer vision allows machines to interpret and analyze visual information. As AI continues to evolve, we can expect to see even more innovative applications that will reshape the way we work and live.",
      entities: "Apple Inc. was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in April 1976 in Los Altos, California. The company is headquartered in Cupertino and is known for products like the iPhone, iPad, and Mac computers."
    };
    
    setInputText(sampleTexts[analysisTask as keyof typeof sampleTexts]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Natural Language Processing</h1>
          <p className="text-muted-foreground">Analyze and process text with advanced AI language models</p>
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
                <div>
                  <label className="block text-sm font-medium mb-2">Analysis Task</label>
                  <Select value={analysisTask} onValueChange={setAnalysisTask}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                      <SelectItem value="summary">Text Summarization</SelectItem>
                      <SelectItem value="entities">Named Entity Recognition</SelectItem>
                      <SelectItem value="classification">Text Classification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Text to Analyze</label>
                  <Textarea
                    placeholder="Enter text for analysis..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAnalyzeText}
                    disabled={!selectedModel || !inputText.trim() || isProcessing}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Analyzing...' : 'Analyze'}
                  </Button>
                  <Button variant="outline" onClick={handleQuickAnalysis}>
                    <FileText className="w-4 h-4 mr-2" />
                    Sample Text
                  </Button>
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
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Processing text...</span>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      {analysisTask.charAt(0).toUpperCase() + analysisTask.slice(1)} Analysis
                    </h4>
                    <p className="text-sm text-green-800 whitespace-pre-wrap">{result.result}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Task Type</span>
                    <Badge variant="secondary">{result.task || analysisTask}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Processing Time</span>
                    <span className="text-sm text-gray-600">
                      {result.processing_time ? `${Date.now() - result.processing_time}ms` : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Enter text and click "Analyze" to see results</p>
                </div>
              )}
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
