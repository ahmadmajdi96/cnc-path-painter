import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TextDatasetBuilderProps {
  datasetId: string;
}

interface TextItem {
  id: string;
  name: string;
  content: string;
}

export const TextDatasetBuilder = ({ datasetId }: TextDatasetBuilderProps) => {
  const [items, setItems] = useState<TextItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, [datasetId]);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('dataset_items')
      .select('*')
      .eq('dataset_id', datasetId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching items',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setItems(data as TextItem[]);
  };

  const addItem = async () => {
    if (!newItemName.trim() || !newItemContent.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both name and content',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('dataset_items')
      .insert({
        dataset_id: datasetId,
        name: newItemName,
        content: newItemContent,
      });

    if (error) {
      toast({
        title: 'Error adding item',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Item added',
      description: 'Text item has been added successfully',
    });

    setNewItemName('');
    setNewItemContent('');
    fetchItems();
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('dataset_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({
        title: 'Error deleting item',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Item deleted',
      description: 'Text item has been deleted successfully',
    });

    fetchItems();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Text Item</CardTitle>
          <CardDescription>
            Add text entries to your dataset
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Item Name</label>
            <Input
              placeholder="Enter item name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Text Content</label>
            <Textarea
              placeholder="Enter your text content here..."
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              rows={6}
            />
          </div>
          <Button onClick={addItem} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Text Items ({items.length})</CardTitle>
          <CardDescription>
            Manage your text dataset entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No text items yet. Add your first item above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
