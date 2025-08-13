
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, FileText, BarChart3, Settings } from 'lucide-react';

const NLPPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Natural Language Processing</h1>
          <p className="text-gray-600">Advanced text analysis, sentiment detection, and language understanding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Text Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter text for analysis..."
                className="min-h-[200px] mb-4"
              />
              <div className="flex gap-2 mb-4">
                <Button size="sm">Analyze Sentiment</Button>
                <Button variant="outline" size="sm">Extract Entities</Button>
                <Button variant="outline" size="sm">Summarize</Button>
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configure Models
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Sentiment Analysis</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Positive</Badge>
                    <span className="text-sm text-gray-600">Confidence: 87.3%</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Named Entities</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Apple Inc. (ORG)</Badge>
                    <Badge variant="secondary">New York (LOC)</Badge>
                    <Badge variant="secondary">John Smith (PER)</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Key Topics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Technology</span>
                      <span className="text-sm text-gray-600">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Business</span>
                      <span className="text-sm text-gray-600">32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Finance</span>
                      <span className="text-sm text-gray-600">23%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NLP Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat Bots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Build intelligent conversational agents</p>
              <Button className="w-full">Manage Bots</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Analyze emotional tone in text</p>
              <Button className="w-full">Start Analysis</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Text Summarization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Extract key information from documents</p>
              <Button className="w-full">Summarize Text</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analysis */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent NLP Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 1, task: 'Customer Review Analysis', type: 'Sentiment', status: 'completed', confidence: '92.4%' },
                { id: 2, task: 'Legal Document Summary', type: 'Summarization', status: 'processing', confidence: '-' },
                { id: 3, task: 'Social Media Monitoring', type: 'Entity Extraction', status: 'completed', confidence: '88.7%' },
                { id: 4, task: 'Support Ticket Classification', type: 'Classification', status: 'completed', confidence: '95.1%' },
              ].map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{task.task}</p>
                      <p className="text-sm text-gray-500">{task.type}</p>
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

export default NLPPage;
