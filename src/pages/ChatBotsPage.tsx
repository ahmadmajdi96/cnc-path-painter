
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bot, Settings, Users, TrendingUp } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';

const ChatBotsPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Bots</h1>
          <p className="text-gray-600">Create and manage AI-powered chatbots for customer service and support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Chat Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Live Chat Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 min-h-[300px] bg-gray-50">
                <div className="space-y-3">
                  <div className="flex">
                    <div className="bg-blue-500 text-white rounded-lg p-2 max-w-xs">
                      Hello! How can I help you today?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-gray-200 rounded-lg p-2 max-w-xs">
                      I need help with my order
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-blue-500 text-white rounded-lg p-2 max-w-xs">
                      I'd be happy to help with your order. Could you please provide your order number?
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedModel ? (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Active Chatbot:</p>
                  <p className="text-sm text-blue-700">{selectedModel.name}</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">Please select a chatbot model to enable chat functionality</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bot Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Bot Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Active Conversations</span>
                  </div>
                  <Badge variant="default">42</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Resolution Rate</span>
                  </div>
                  <Badge variant="default">87.5%</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Messages Today</span>
                  </div>
                  <span className="font-medium">1,247</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Response Time</span>
                  </div>
                  <span className="font-medium">0.8s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Model Manager for Chatbots */}
        <AIModelManager
          modelType="chatbot"
          title="Chatbot"
          description="AI models for conversational chatbots and virtual assistants"
          onModelSelect={setSelectedModel}
          selectedModelId={selectedModel?.id}
        />

        {/* Recent Conversations */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 1, user: 'Customer A', topic: 'Order Status', status: 'resolved', timestamp: '2 min ago', messages: 5 },
                { id: 2, user: 'Customer B', topic: 'Technical Support', status: 'active', timestamp: '8 min ago', messages: 12 },
                { id: 3, user: 'Customer C', topic: 'Billing Question', status: 'resolved', timestamp: '15 min ago', messages: 3 },
                { id: 4, user: 'Customer D', topic: 'Product Information', status: 'escalated', timestamp: '22 min ago', messages: 8 },
              ].map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{conversation.user}</p>
                      <p className="text-sm text-gray-500">{conversation.topic} • {conversation.messages} messages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{conversation.timestamp}</span>
                    <Badge variant={
                      conversation.status === 'resolved' ? 'default' : 
                      conversation.status === 'active' ? 'secondary' : 'destructive'
                    }>
                      {conversation.status.toUpperCase()}
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

export default ChatBotsPage;
