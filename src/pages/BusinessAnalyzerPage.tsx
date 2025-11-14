import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, Target, FileText, Zap, TrendingUp } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';
import { useAIModelProcessor } from '@/hooks/useAIModelProcessor';
import { useToast } from '@/hooks/use-toast';

interface BusinessAnalyzerPageProps {
  projectId?: string;
}

const BusinessAnalyzerPage = ({ projectId }: BusinessAnalyzerPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const { processWithModel, isProcessing, result } = useAIModelProcessor();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No data provided",
        description: "Please enter business information to analyze",
        variant: "destructive"
      });
      return;
    }

    try {
      await processWithModel(selectedModel?.id, 'business_analysis', {
        text: inputText,
        task: 'business_performance'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleQuickAnalysis = () => {
    setInputText(`Q4 2024 Business Performance:
- Revenue: $2.5M (15% increase YoY)
- Customer acquisition: 450 new customers
- Customer churn rate: 8%
- Average deal size: $5,500
- Sales cycle: 45 days
- Marketing ROI: 3.2x
- Operating margin: 22%
- Employee satisfaction: 7.8/10

Key challenges:
- Longer sales cycles in enterprise segment
- Increasing customer acquisition costs
- Product feature requests backlog growing`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Performance Analyzer</h1>
          <p className="text-muted-foreground">Comprehensive AI-powered business analysis and insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Analysis Input Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Business Data Input
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Metrics & Information</label>
                  <Textarea
                    placeholder="Enter business metrics, KPIs, challenges, or any business information to analyze..."
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
                    {isProcessing ? 'Analyzing...' : 'Analyze Business'}
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
                    <p className="text-sm text-orange-700 dark:text-orange-400">Please select a business analyzer model</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Business Analysis Report</CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Analyzing business data...</span>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
                      Performance Analysis
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{result.result}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Analysis Type</span>
                    <Badge variant="secondary">Business Performance</Badge>
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
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Enter business data and click "Analyze Business" to see insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager
            modelType="business_analysis"
            title="Business Analysis"
            description="AI models for comprehensive business performance evaluation"
            projectId={projectId}
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
          />
          <AIModelDatasetSelector
            modelId={selectedModel?.id || null}
            modelType="business_analysis"
            projectId={projectId}
            modelType="business_analysis"
          />
        </div>

        {/* Analysis Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Growth Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Identify growth opportunities and trends</p>
              <div className="mt-2">
                <Badge variant="default">Predictive Insights</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                KPI Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Monitor key performance indicators</p>
              <div className="mt-2">
                <Badge variant="default">Real-time Metrics</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Competitive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Market positioning and benchmarking</p>
              <div className="mt-2">
                <Badge variant="default">Market Intel</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Action Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Strategic recommendations</p>
              <div className="mt-2">
                <Badge variant="default">Actionable Steps</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalyzerPage;
