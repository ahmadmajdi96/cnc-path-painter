import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Scale, FileText, Zap, GitBranch } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';
import { useAIModelProcessor } from '@/hooks/useAIModelProcessor';
import { useToast } from '@/hooks/use-toast';

interface DecisionMakerPageProps {
  projectId?: string;
}

const DecisionMakerPage = ({ projectId }: DecisionMakerPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const { processWithModel, isProcessing, result } = useAIModelProcessor();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No scenario provided",
        description: "Please describe the decision scenario",
        variant: "destructive"
      });
      return;
    }

    try {
      await processWithModel(selectedModel?.id, 'decision_support', {
        text: inputText,
        task: 'strategic_decision'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleQuickAnalysis = () => {
    setInputText(`Decision Scenario: Market Expansion

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
- Competition entering Europe Q2 2025`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Strategic Decision Maker</h1>
          <p className="text-muted-foreground">AI-powered strategic decision support and scenario analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Decision Input Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Decision Scenario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Describe Your Decision Scenario</label>
                  <Textarea
                    placeholder="Describe the decision you need to make, available options, constraints, and relevant context..."
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
                    {isProcessing ? 'Analyzing...' : 'Analyze Decision'}
                  </Button>
                  <Button variant="outline" onClick={handleQuickAnalysis}>
                    <FileText className="w-4 h-4 mr-2" />
                    Sample Scenario
                  </Button>
                </div>
                
                {selectedModel ? (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground">Selected Model:</p>
                    <p className="text-sm text-muted-foreground">{selectedModel.name}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <p className="text-sm text-orange-700 dark:text-orange-400">Please select a decision support model</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Decision Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Decision Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Analyzing decision scenario...</span>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-400 mb-2">
                      Strategic Recommendation
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-300 whitespace-pre-wrap">{result.result}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Analysis Type</span>
                    <Badge variant="secondary">Strategic Decision</Badge>
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
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Describe your decision scenario and click "Analyze Decision"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager
            modelType="decision_support"
            title="Decision Support"
            description="AI models for strategic decision-making and scenario analysis"
            projectId={projectId}
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
          />
          <AIModelDatasetSelector
            modelId={selectedModel?.id || null}
            modelType="decision_support"
            projectId={projectId}
          />
        </div>

        {/* Decision Support Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Scenario Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Compare multiple decision paths</p>
              <div className="mt-2">
                <Badge variant="default">Multi-path Analysis</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Evaluate risks and trade-offs</p>
              <div className="mt-2">
                <Badge variant="default">Risk Modeling</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Data-driven recommendations</p>
              <div className="mt-2">
                <Badge variant="default">AI-Powered</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Fast analysis for time-sensitive choices</p>
              <div className="mt-2">
                <Badge variant="default">Rapid Response</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DecisionMakerPage;
