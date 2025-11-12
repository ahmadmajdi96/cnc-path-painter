import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TrendingDown, DollarSign, FileText, Zap } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';
import { useAIModelProcessor } from '@/hooks/useAIModelProcessor';
import { useToast } from '@/hooks/use-toast';

interface CostReductionPageProps {
  projectId?: string;
}

const CostReductionPage = ({ projectId }: CostReductionPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const { processWithModel, isProcessing, result } = useAIModelProcessor();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No data provided",
        description: "Please enter business data to analyze",
        variant: "destructive"
      });
      return;
    }

    try {
      await processWithModel(selectedModel?.id, 'cost_reduction', {
        text: inputText,
        task: 'cost_analysis'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleQuickAnalysis = () => {
    setInputText(`Current operational costs:
- Labor: $150,000/month
- Materials: $80,000/month
- Equipment maintenance: $25,000/month
- Energy consumption: $30,000/month
- Software licenses: $15,000/month
- Office space: $20,000/month

We operate 24/7 with 3 shifts and have noticed increasing overtime costs. Material waste is approximately 8% of total materials. Equipment downtime averages 15 hours per month.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Cost Reduction Analysis</h1>
          <p className="text-muted-foreground">Identify cost-saving opportunities with AI-powered analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Analysis Input Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Cost Analysis Input
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Data to Analyze</label>
                  <Textarea
                    placeholder="Enter operational costs, expenses, or business processes to analyze..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!selectedModel || !inputText.trim() || isProcessing}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Analyzing...' : 'Analyze Costs'}
                  </Button>
                  <Button variant="outline" onClick={handleQuickAnalysis}>
                    <FileText className="w-4 h-4 mr-2" />
                    Sample Data
                  </Button>
                </div>
                
                {selectedModel ? (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground">Selected Model:</p>
                    <p className="text-sm text-muted-foreground">{selectedModel.name}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <p className="text-sm text-orange-700 dark:text-orange-400">Please select a cost reduction model</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Reduction Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Analyzing costs...</span>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-400 mb-2">
                      Cost Reduction Recommendations
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap">{result.result}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Analysis Type</span>
                    <Badge variant="secondary">Cost Optimization</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Processing Time</span>
                    <span className="text-sm text-muted-foreground">
                      {result.processing_time ? `${Date.now() - result.processing_time}ms` : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingDown className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Enter business data and click "Analyze Costs" to see insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager
            modelType="cost_reduction"
            title="Cost Reduction"
            description="AI models for identifying cost-saving opportunities"
            projectId={projectId}
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
          />
          <AIModelDatasetSelector
            modelId={selectedModel?.id || null}
            modelType="cost_reduction"
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Expense Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Identify wasteful spending patterns</p>
              <div className="mt-2">
                <Badge variant="default">Real-time Analysis</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Cost Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Recommend efficiency improvements</p>
              <div className="mt-2">
                <Badge variant="default">Actionable Insights</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Process Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Identify inefficient workflows</p>
              <div className="mt-2">
                <Badge variant="default">Process Mining</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Immediate cost-saving actions</p>
              <div className="mt-2">
                <Badge variant="default">Priority Actions</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CostReductionPage;
