
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Rule {
  id: string;
  name: string;
  condition_type: 'keyword' | 'intent' | 'sentiment' | 'time' | 'user_property';
  condition_value: any;
  action_type: 'response' | 'redirect' | 'escalate' | 'collect_info';
  action_value: any;
  priority: number;
  is_active: boolean;
}

interface ChatbotRulesManagerProps {
  chatbotId: string;
}

export const ChatbotRulesManager: React.FC<ChatbotRulesManagerProps> = ({ chatbotId }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    condition_type: 'keyword' as const,
    condition_value: '',
    action_type: 'response' as const,
    action_value: '',
    priority: 1,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
  }, [chatbotId]);

  const fetchRules = async () => {
    try {
      // Use type assertion to work around TypeScript issues until types are regenerated
      const { data, error } = await (supabase as any)
        .from('chatbot_rules')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('priority', { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast({
        title: "Error",
        description: "Failed to load rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ruleData = {
        chatbot_id: chatbotId,
        name: formData.name,
        condition_type: formData.condition_type,
        condition_value: formData.condition_value,
        action_type: formData.action_type,
        action_value: formData.action_value,
        priority: formData.priority,
        is_active: formData.is_active
      };

      if (editingRule) {
        const { error } = await (supabase as any)
          .from('chatbot_rules')
          .update(ruleData)
          .eq('id', editingRule.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Rule updated successfully" });
      } else {
        const { error } = await (supabase as any)
          .from('chatbot_rules')
          .insert([ruleData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Rule created successfully" });
      }

      fetchRules();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: "Error",
        description: "Failed to save rule",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      condition_type: 'keyword',
      condition_value: '',
      action_type: 'response',
      action_value: '',
      priority: 1,
      is_active: true
    });
    setEditingRule(null);
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      condition_type: rule.condition_type,
      condition_value: typeof rule.condition_value === 'string' ? rule.condition_value : JSON.stringify(rule.condition_value),
      action_type: rule.action_type,
      action_value: typeof rule.action_value === 'string' ? rule.action_value : JSON.stringify(rule.action_value),
      priority: rule.priority,
      is_active: rule.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (ruleId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('chatbot_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      
      fetchRules();
      toast({ title: "Success", description: "Rule deleted successfully" });
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
      });
    }
  };

  const updatePriority = async (ruleId: string, newPriority: number) => {
    try {
      const { error } = await (supabase as any)
        .from('chatbot_rules')
        .update({ priority: newPriority })
        .eq('id', ruleId);

      if (error) throw error;
      fetchRules();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast({
        title: "Error",
        description: "Failed to update rule priority",
        variant: "destructive",
      });
    }
  };

  const getConditionDescription = (type: string) => {
    switch (type) {
      case 'keyword': return 'Triggers when specific keywords are detected';
      case 'intent': return 'Triggers based on user intent classification';
      case 'sentiment': return 'Triggers based on message sentiment';
      case 'time': return 'Triggers at specific times or durations';
      case 'user_property': return 'Triggers based on user properties';
      default: return '';
    }
  };

  const getActionDescription = (type: string) => {
    switch (type) {
      case 'response': return 'Send a predefined response';
      case 'redirect': return 'Transfer to another bot or department';
      case 'escalate': return 'Escalate to human agent';
      case 'collect_info': return 'Collect additional information from user';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Rules & Logic</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? 'Edit Rule' : 'Add New Rule'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Rule Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Handle Pricing Questions"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Condition Type *</Label>
                      <Select
                        value={formData.condition_type}
                        onValueChange={(value: any) => setFormData({ ...formData, condition_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="keyword">Keyword Match</SelectItem>
                          <SelectItem value="intent">Intent Detection</SelectItem>
                          <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                          <SelectItem value="time">Time-based</SelectItem>
                          <SelectItem value="user_property">User Property</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {getConditionDescription(formData.condition_type)}
                      </p>
                    </div>

                    <div>
                      <Label>Action Type *</Label>
                      <Select
                        value={formData.action_type}
                        onValueChange={(value: any) => setFormData({ ...formData, action_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="response">Send Response</SelectItem>
                          <SelectItem value="redirect">Redirect</SelectItem>
                          <SelectItem value="escalate">Escalate</SelectItem>
                          <SelectItem value="collect_info">Collect Info</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {getActionDescription(formData.action_type)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="condition_value">Condition Value *</Label>
                    <Input
                      id="condition_value"
                      value={formData.condition_value}
                      onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                      placeholder={
                        formData.condition_type === 'keyword' ? 'price, cost, pricing' :
                        formData.condition_type === 'intent' ? 'ask_about_pricing' :
                        formData.condition_type === 'sentiment' ? 'positive' :
                        formData.condition_type === 'time' ? '09:00-17:00' :
                        'user_type:premium'
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="action_value">Action Value *</Label>
                    <Textarea
                      id="action_value"
                      value={formData.action_value}
                      onChange={(e) => setFormData({ ...formData, action_value: e.target.value })}
                      placeholder={
                        formData.action_type === 'response' ? 'Our pricing starts at $99/month. Would you like to see our pricing page?' :
                        formData.action_type === 'redirect' ? 'sales_team' :
                        formData.action_type === 'escalate' ? 'human_agent' :
                        'email'
                      }
                      required
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Input
                        id="priority"
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        min={1}
                        max={100}
                      />
                      <p className="text-xs text-gray-500 mt-1">Lower numbers = higher priority</p>
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingRule ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <Card key={rule.id} className="border-l-4 border-l-purple-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <Badge variant="outline">Priority {rule.priority}</Badge>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Condition:</span>
                          <p className="text-gray-800">
                            <Badge variant="secondary" className="mr-2">{rule.condition_type}</Badge>
                            {typeof rule.condition_value === 'string' ? rule.condition_value : JSON.stringify(rule.condition_value)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Action:</span>
                          <p className="text-gray-800">
                            <Badge variant="secondary" className="mr-2">{rule.action_type}</Badge>
                            {typeof rule.action_value === 'string' ? rule.action_value : JSON.stringify(rule.action_value)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePriority(rule.id, rule.priority - 1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePriority(rule.id, rule.priority + 1)}
                        disabled={index === rules.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {rules.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No rules configured</div>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Rule
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
