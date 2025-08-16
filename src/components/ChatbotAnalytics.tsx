
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, TrendingUp, Clock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Conversation {
  id: string;
  session_id: string;
  user_message: string;
  bot_response: string;
  confidence_score: number;
  response_time_ms: number;
  feedback_rating: number;
  created_at: string;
}

interface ChatbotAnalyticsProps {
  chatbotId: string;
}

export const ChatbotAnalytics: React.FC<ChatbotAnalyticsProps> = ({ chatbotId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [chatbotId]);

  const fetchAnalytics = async () => {
    try {
      // Use type assertion to work around TypeScript issues until types are regenerated
      const { data, error } = await (supabase as any)
        .from('chatbot_conversations')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalConversations: conversations.length,
    avgConfidence: conversations.length > 0 
      ? Math.round(conversations.reduce((sum, conv) => sum + (conv.confidence_score || 0), 0) / conversations.length * 100) 
      : 0,
    avgResponseTime: conversations.length > 0 
      ? Math.round(conversations.reduce((sum, conv) => sum + (conv.response_time_ms || 0), 0) / conversations.length) 
      : 0,
    avgRating: conversations.filter(c => c.feedback_rating).length > 0
      ? Math.round(conversations.reduce((sum, conv) => sum + (conv.feedback_rating || 0), 0) / conversations.filter(c => c.feedback_rating).length * 10) / 10
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              Recent interactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">
              Response accuracy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Processing speed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}/5</div>
            <p className="text-xs text-muted-foreground">
              User satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversations.slice(0, 10).map((conversation) => (
              <div key={conversation.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    Session: {conversation.session_id.slice(0, 8)}...
                  </div>
                  <div className="flex gap-2">
                    {conversation.confidence_score && (
                      <Badge variant="outline">
                        {Math.round(conversation.confidence_score * 100)}% confidence
                      </Badge>
                    )}
                    {conversation.response_time_ms && (
                      <Badge variant="outline">
                        {conversation.response_time_ms}ms
                      </Badge>
                    )}
                    {conversation.feedback_rating && (
                      <Badge>
                        <Star className="w-3 h-3 mr-1" />
                        {conversation.feedback_rating}/5
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-xs text-blue-600 mb-1">User:</div>
                    <div className="text-sm">{conversation.user_message}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1">Bot:</div>
                    <div className="text-sm">{conversation.bot_response}</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(conversation.created_at).toLocaleString()}
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No conversation data available yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
