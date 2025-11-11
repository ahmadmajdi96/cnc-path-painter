
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Bot, Settings, Users, TrendingUp, Send } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { useAIModelProcessor } from '@/hooks/useAIModelProcessor';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBotsPageProps {
  projectId?: string;
}

const ChatBotsPage = ({ projectId }: ChatBotsPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const { processWithModel, isProcessing } = useAIModelProcessor();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');

    if (selectedModel) {
      try {
        const result = await processWithModel(selectedModel.id, 'chatbot', {
          text: messageToSend,
          task: 'chat'
        });

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.result || 'Sorry, I could not process your message.',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your message.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Please select an AI model first to enable chat functionality.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Chat Bots</h1>
          <p className="text-muted-foreground">Create and manage AI-powered chatbots for customer service and support</p>
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
              <div className="border rounded-lg bg-gray-50 min-h-[400px] max-h-[400px] overflow-y-auto mb-4">
                <div className="p-4 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border shadow-sm'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-white border shadow-sm px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isProcessing || !inputMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
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
                  <span className="font-medium">{messages.length}</span>
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
          projectId={projectId}
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
