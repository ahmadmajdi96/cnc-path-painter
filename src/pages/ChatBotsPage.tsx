
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Settings, Play, Pause, Edit, Trash2, Brain, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CreateChatbotDialog } from '@/components/CreateChatbotDialog';
import { ChatbotQAManager } from '@/components/ChatbotQAManager';
import { ChatbotRulesManager } from '@/components/ChatbotRulesManager';
import { ChatbotAnalytics } from '@/components/ChatbotAnalytics';

interface Chatbot {
  id: string;
  name: string;
  description: string;
  model_type: string;
  model_name: string;
  status: 'active' | 'inactive' | 'training';
  created_at: string;
}

const ChatBotsPage = () => {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Chatbot | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'qa' | 'rules' | 'analytics'>('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      // Use type assertion to work around TypeScript issues until types are regenerated
      const { data, error } = await (supabase as any)
        .from('chatbots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      toast({
        title: "Error",
        description: "Failed to load chatbots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBotStatus = async (botId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await (supabase as any)
        .from('chatbots')
        .update({ status: newStatus })
        .eq('id', botId);

      if (error) throw error;
      
      fetchChatbots();
      toast({
        title: "Success",
        description: `Chatbot ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error updating bot status:', error);
      toast({
        title: "Error",
        description: "Failed to update chatbot status",
        variant: "destructive",
      });
    }
  };

  const deleteChatbot = async (botId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('chatbots')
        .delete()
        .eq('id', botId);

      if (error) throw error;
      
      fetchChatbots();
      toast({
        title: "Success",
        description: "Chatbot deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive",
      });
    }
  };

  const getProviderBadgeColor = (provider: string) => {
    const colors = {
      openai: 'bg-green-100 text-green-800',
      anthropic: 'bg-blue-100 text-blue-800',
      google: 'bg-yellow-100 text-yellow-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading chatbots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Bots</h1>
              <p className="text-gray-600">Create and manage intelligent conversational agents</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Bot
            </Button>
          </div>
        </div>

        {selectedBot ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setSelectedBot(null)}>
                      ← Back
                    </Button>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        {selectedBot.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{selectedBot.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getProviderBadgeColor(selectedBot.model_type)}>
                      {selectedBot.model_type}
                    </Badge>
                    <Badge variant={selectedBot.status === 'active' ? 'default' : 'secondary'}>
                      {selectedBot.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="flex space-x-1 bg-white p-1 rounded-lg border">
              {[
                { id: 'overview', label: 'Overview', icon: MessageSquare },
                { id: 'qa', label: 'Q&A Management', icon: Brain },
                { id: 'rules', label: 'Rules & Logic', icon: Settings },
                { id: 'analytics', label: 'Analytics', icon: Zap }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    onClick={() => setActiveTab(tab.id as any)}
                    className="flex-1"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bot Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Model Provider</label>
                      <p className="text-sm text-gray-600">{selectedBot.model_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Model</label>
                      <p className="text-sm text-gray-600">{selectedBot.model_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <p className="text-sm text-gray-600">{selectedBot.status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Created</label>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedBot.created_at).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full"
                      variant={selectedBot.status === 'active' ? 'outline' : 'default'}
                      onClick={() => toggleBotStatus(selectedBot.id, selectedBot.status)}
                    >
                      {selectedBot.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Deactivate Bot
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate Bot
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this chatbot?')) {
                          deleteChatbot(selectedBot.id);
                          setSelectedBot(null);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Bot
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'qa' && <ChatbotQAManager chatbotId={selectedBot.id} />}
            {activeTab === 'rules' && <ChatbotRulesManager chatbotId={selectedBot.id} />}
            {activeTab === 'analytics' && <ChatbotAnalytics chatbotId={selectedBot.id} />}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {bots.map((bot) => (
                <Card key={bot.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                      <div className="flex flex-col gap-1">
                        <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                          {bot.status}
                        </Badge>
                        <Badge className={getProviderBadgeColor(bot.model_type)}>
                          {bot.model_type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500">
                        Model: {bot.model_name}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant={bot.status === 'active' ? 'outline' : 'default'}
                          className="flex-1"
                          onClick={() => toggleBotStatus(bot.id, bot.status)}
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedBot(bot)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this chatbot?')) {
                              deleteChatbot(bot.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {bots.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chatbots created yet</h3>
                <p className="text-gray-600 mb-4">Create your first intelligent chatbot to get started</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Bot
                </Button>
              </div>
            )}
          </>
        )}

        <CreateChatbotDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onChatbotCreated={fetchChatbots}
        />
      </div>
    </div>
  );
};

export default ChatBotsPage;
