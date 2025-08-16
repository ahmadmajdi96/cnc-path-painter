
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface QAPair {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  confidence_threshold: number;
  is_active: boolean;
  usage_count: number;
}

interface ChatbotQAManagerProps {
  chatbotId: string;
}

export const ChatbotQAManager: React.FC<ChatbotQAManagerProps> = ({ chatbotId }) => {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPair, setEditingPair] = useState<QAPair | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    keywords: '',
    confidence_threshold: 0.8,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchQAPairs();
  }, [chatbotId]);

  const fetchQAPairs = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_qa_pairs')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setQaPairs(data || []);
    } catch (error) {
      console.error('Error fetching Q&A pairs:', error);
      toast({
        title: "Error",
        description: "Failed to load Q&A pairs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      const qaPairData = {
        chatbot_id: chatbotId,
        question: formData.question,
        answer: formData.answer,
        keywords,
        confidence_threshold: formData.confidence_threshold,
        is_active: formData.is_active
      };

      if (editingPair) {
        const { error } = await supabase
          .from('chatbot_qa_pairs')
          .update(qaPairData)
          .eq('id', editingPair.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Q&A pair updated successfully" });
      } else {
        const { error } = await supabase
          .from('chatbot_qa_pairs')
          .insert([qaPairData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Q&A pair created successfully" });
      }

      fetchQAPairs();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving Q&A pair:', error);
      toast({
        title: "Error",
        description: "Failed to save Q&A pair",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      keywords: '',
      confidence_threshold: 0.8,
      is_active: true
    });
    setEditingPair(null);
  };

  const handleEdit = (pair: QAPair) => {
    setEditingPair(pair);
    setFormData({
      question: pair.question,
      answer: pair.answer,
      keywords: pair.keywords.join(', '),
      confidence_threshold: pair.confidence_threshold,
      is_active: pair.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (pairId: string) => {
    try {
      const { error } = await supabase
        .from('chatbot_qa_pairs')
        .delete()
        .eq('id', pairId);

      if (error) throw error;
      
      fetchQAPairs();
      toast({ title: "Success", description: "Q&A pair deleted successfully" });
    } catch (error) {
      console.error('Error deleting Q&A pair:', error);
      toast({
        title: "Error",
        description: "Failed to delete Q&A pair",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (pair: QAPair) => {
    try {
      const { error } = await supabase
        .from('chatbot_qa_pairs')
        .update({ is_active: !pair.is_active })
        .eq('id', pair.id);

      if (error) throw error;
      fetchQAPairs();
    } catch (error) {
      console.error('Error toggling Q&A pair status:', error);
      toast({
        title: "Error",
        description: "Failed to update Q&A pair status",
        variant: "destructive",
      });
    }
  };

  const filteredPairs = qaPairs.filter(pair =>
    pair.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Q&A Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Q&A Pair
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPair ? 'Edit Q&A Pair' : 'Add New Q&A Pair'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question *</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="What is your return policy?"
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="answer">Answer *</Label>
                    <Textarea
                      id="answer"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      placeholder="Our return policy allows..."
                      required
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="return, refund, exchange, policy"
                    />
                  </div>

                  <div>
                    <Label>Confidence Threshold: {formData.confidence_threshold}</Label>
                    <Slider
                      value={[formData.confidence_threshold]}
                      onValueChange={([value]) => setFormData({ ...formData, confidence_threshold: value })}
                      max={1}
                      min={0.1}
                      step={0.1}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low (0.1)</span>
                      <span>Medium (0.5)</span>
                      <span>High (1.0)</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPair ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search Q&A pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredPairs.length} pairs
            </Badge>
          </div>

          <div className="space-y-4">
            {filteredPairs.map((pair) => (
              <Card key={pair.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{pair.question}</h4>
                      <p className="text-gray-600 text-sm mb-3">{pair.answer}</p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {pair.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={pair.is_active ? 'default' : 'secondary'}>
                        {pair.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        Used {pair.usage_count}x
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Confidence: {Math.round(pair.confidence_threshold * 100)}%
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(pair)}
                      >
                        {pair.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pair)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pair.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPairs.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No Q&A pairs found</div>
                <Button onClick={resetForm} onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Q&A Pair
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
