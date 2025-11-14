
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, BarChart3, Lightbulb, FileText, Zap } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';
import { useAIModelProcessor } from '@/hooks/useAIModelProcessor';
import { useToast } from '@/hooks/use-toast';

interface BusinessAIPageProps {
  projectId?: string;
}

const BusinessAIPage = ({ projectId }: BusinessAIPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [analysisType, setAnalysisType] = useState<'cost_reduction' | 'business_analyzer' | 'decision_maker'>('cost_reduction');
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
      const taskMap = {
        cost_reduction: 'cost_analysis',
        business_analyzer: 'business_performance',
        decision_maker: 'strategic_decision'
      };

      await processWithModel(selectedModel?.id, 'business', {
        text: inputText,
        task: taskMap[analysisType],
        analysisType: analysisType
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleQuickAnalysis = () => {
    const sampleTexts = {
      cost_reduction: `Current operational costs:
- Labor: $150,000/month
- Materials: $80,000/month
- Equipment maintenance: $25,000/month
- Energy consumption: $30,000/month
- Software licenses: $15,000/month
- Office space: $20,000/month

We operate 24/7 with 3 shifts and have noticed increasing overtime costs. Material waste is approximately 8% of total materials. Equipment downtime averages 15 hours per month.`,
      
      business_analyzer: `Q4 2024 Business Performance:
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
- Product feature requests backlog growing`,
      
      decision_maker: `Decision Scenario: Market Expansion

We're considering expanding to the European market. Here are the key factors:

Option A: Gradual Expansion
- Start with UK and Germany
- Initial investment: $500K
- Timeline: 18 months
- Lower risk, slower growth
- Build local partnerships

Option B: Aggressive Expansion
- Launch in 5 countries simultaneously
- Initial investment: $2M
- Timeline: 6 months
- Higher risk, faster market penetration
- Hire local teams

Current situation:
- Strong product-market fit in US
- $5M annual revenue
- 50 employees
- Cash reserves: $3M
- Competition entering Europe Q2 2025`
    };
    
    setInputText(sampleTexts[analysisType]);
  };

  const getTypeConfig = () => {
    const configs = {
      cost_reduction: {
        title: 'Cost Reduction Analysis',
        description: 'Identify cost-saving opportunities with AI-powered analysis',
        icon: TrendingDown,
        placeholder: 'Enter operational costs, expenses, or business processes to analyze...'
      },
      business_analyzer: {
        title: 'Business Performance Analyzer',
        description: 'Comprehensive AI-powered business analysis and insights',
        icon: BarChart3,
        placeholder: 'Enter business metrics, KPIs, challenges, or any business information to analyze...'
      },
      decision_maker: {
        title: 'Strategic Decision Maker',
        description: 'AI-powered strategic decision support and scenario analysis',
        icon: Lightbulb,
        placeholder: 'Describe the decision you need to make, available options, constraints, and relevant context...'
      }
    };
    return configs[analysisType];
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Business AI Analytics</h1>
          <p className="text-muted-foreground">Cost reduction, business analysis, and strategic decision support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Analysis Input Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Analysis Type</label>
                  <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cost_reduction">Cost Reduction</SelectItem>
                      <SelectItem value="business_analyzer">Business Analyzer</SelectItem>
                      <SelectItem value="decision_maker">Decision Maker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Information</label>
                  <Textarea
                    placeholder={config.placeholder}
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
                    {isProcessing ? 'Analyzing...' : 'Analyze'}
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
                    <p className="text-xs text-muted-foreground mt-1">Type: {selectedModel.model_type}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                    <p className="text-sm text-muted-foreground">No model selected. Please select or create a model below.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Analyzing your business data...</p>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-border">
                    <h3 className="font-semibold mb-2 text-foreground">Analysis Complete</h3>
                    
                    {result.result && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Insights:</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.result}</p>
                        </div>
                        
                        {result.confidence && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Confidence: {(result.confidence * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        )}
                        
                        {result.processing_time && (
                          <div className="text-xs text-muted-foreground">
                            Processing time: {result.processing_time.toFixed(2)}s
                          </div>
                        )}
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="text-sm text-destructive">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Enter business information and click "Analyze" to see results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Model Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIModelManager
            modelType="business"
            title="Business AI Models"
            description="Manage AI models for business analysis"
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
            projectId={projectId}
          />

          <AIModelDatasetSelector
            modelId={selectedModel?.id}
            modelType="business"
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessAIPage;
