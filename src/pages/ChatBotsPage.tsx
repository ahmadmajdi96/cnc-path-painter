import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Settings, Play, Pause, Edit, Trash2 } from 'lucide-react';

const ChatBotsPage = () => {
  const [bots] = useState([
    {
      id: 1,
      name: 'Customer Support Bot',
      description: 'Handles customer inquiries and support tickets',
      status: 'active',
      conversations: 247,
      accuracy: '94.2%',
      lastActive: '2 minutes ago'
    },
    {
      id: 2,
      name: 'Sales Assistant',
      description: 'Helps with product information and sales inquiries',
      status: 'active',
      conversations: 156,
      accuracy: '91.8%',
      lastActive: '15 minutes ago'
    },
    {
      id: 3,
      name: 'HR Bot',
      description: 'Answers HR policies and employee questions',
      status: 'inactive',
      conversations: 89,
      accuracy: '96.5%',
      lastActive: '2 hours ago'
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Bots</h1>
          <p className="text-gray-600">Create and manage intelligent conversational agents</p>
        </div>

        {/* Create New Bot */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Chat Bot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bot Name</label>
                  <Input placeholder="Enter bot name..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input placeholder="Brief description of the bot's purpose..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Welcome Message</label>
                  <Textarea 
                    placeholder="Hello! How can I help you today?"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Training Data</label>
                  <Textarea 
                    placeholder="Add training conversations or knowledge base..."
                    className="min-h-[150px]"
                  />
                </div>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bot
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Bots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <p className="text-sm text-gray-600">{bot.description}</p>
                    </div>
                  </div>
                  <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                    {bot.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Conversations</span>
                      <div className="font-medium">{bot.conversations}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Accuracy</span>
                      <div className="font-medium">{bot.accuracy}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Last active: {bot.lastActive}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={bot.status === 'active' ? 'outline' : 'default'}
                      className="flex-1"
                    >
                      {bot.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">492</div>
              <p className="text-sm text-gray-500">Last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">2</div>
              <p className="text-sm text-gray-500">Currently running</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">1.2s</div>
              <p className="text-sm text-gray-500">Per message</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">93.5%</div>
              <p className="text-sm text-gray-500">Issue resolution</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatBotsPage;
