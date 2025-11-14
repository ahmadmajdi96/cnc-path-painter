import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronRight, Search, Save, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjectId } from '@/hooks/useProjectId';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubRule {
  id: string;
  prompt: string;
  description: string;
}

interface Rule {
  id: string;
  name: string;
  description: string;
  prompt: string;
  subRules: SubRule[];
  isExpanded: boolean;
}

interface RulesDataset {
  id: string;
  name: string;
  description: string;
  rules: Rule[];
  createdAt: string;
  status: 'draft' | 'active' | 'archived';
}

const RulesDatasetPage = () => {
  const { projectId } = useProjectId();
  const { toast } = useToast();
  const [rulesDatasets, setRulesDatasets] = useState<RulesDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<RulesDataset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [newDatasetDescription, setNewDatasetDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const { data: datasets, error } = await supabase
        .from('rules_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const datasetsWithRules = await Promise.all(
        (datasets || []).map(async (dataset) => {
          const { data: rules, error: rulesError } = await supabase
            .from('rules')
            .select('*, sub_rules(*)')
            .eq('dataset_id', dataset.id)
            .order('created_at', { ascending: true });

          if (rulesError) throw rulesError;

          return {
            id: dataset.id,
            name: dataset.name,
            description: dataset.description || '',
            rules: (rules || []).map(rule => ({
              id: rule.id,
              name: rule.name,
              description: rule.description || '',
              prompt: rule.prompt || '',
              subRules: (rule.sub_rules || []).map((sr: any) => ({
                id: sr.id,
                prompt: sr.prompt || '',
                description: sr.description || '',
              })),
              isExpanded: rule.is_expanded ?? true,
            })),
            createdAt: dataset.created_at,
            status: (dataset.status || 'draft') as 'draft' | 'active' | 'archived',
          };
        })
      );

      setRulesDatasets(datasetsWithRules);
    } catch (error: any) {
      toast({ title: "Error fetching datasets", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredDatasets = useMemo(() => {
    return rulesDatasets.filter((dataset) => {
      const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || dataset.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rulesDatasets, searchQuery, statusFilter]);

  const createDataset = async () => {
    if (!newDatasetName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('rules_datasets')
        .insert({
          name: newDatasetName,
          description: newDatasetDescription,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      const newDataset: RulesDataset = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        rules: [],
        createdAt: data.created_at,
        status: (data.status || 'draft') as 'draft' | 'active' | 'archived',
      };

      setRulesDatasets([newDataset, ...rulesDatasets]);
      setNewDatasetName('');
      setNewDatasetDescription('');
      setCreateDialogOpen(false);
      toast({ title: "Rules dataset created successfully" });
    } catch (error: any) {
      toast({ title: "Error creating dataset", description: error.message, variant: "destructive" });
    }
  };

  const addRule = async () => {
    if (!selectedDataset) return;
    
    try {
      const { data, error } = await supabase
        .from('rules')
        .insert({
          dataset_id: selectedDataset.id,
          name: 'Untitled Rule',
          description: '',
          prompt: '',
          is_expanded: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newRule: Rule = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        prompt: data.prompt || '',
        subRules: [],
        isExpanded: data.is_expanded ?? true,
      };

      const updatedDataset = {
        ...selectedDataset,
        rules: [...selectedDataset.rules, newRule],
      };

      setSelectedDataset(updatedDataset);
      setRulesDatasets(rulesDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
    } catch (error: any) {
      toast({ title: "Error adding rule", description: error.message, variant: "destructive" });
    }
  };

  const addSubRule = async (ruleId: string) => {
    if (!selectedDataset) return;

    try {
      const { data, error } = await supabase
        .from('sub_rules')
        .insert({
          rule_id: ruleId,
          prompt: '',
          description: '',
        })
        .select()
        .single();

      if (error) throw error;

      const updatedRules = selectedDataset.rules.map(rule => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            subRules: [
              ...rule.subRules,
              { id: data.id, prompt: data.prompt || '', description: data.description || '' }
            ]
          };
        }
        return rule;
      });

      const updatedDataset = { ...selectedDataset, rules: updatedRules };
      setSelectedDataset(updatedDataset);
      setRulesDatasets(rulesDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
    } catch (error: any) {
      toast({ title: "Error adding sub-rule", description: error.message, variant: "destructive" });
    }
  };

  const updateRule = async (ruleId: string, field: keyof Rule, value: string) => {
    if (!selectedDataset) return;

    const updatedRules = selectedDataset.rules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    );

    const updatedDataset = { ...selectedDataset, rules: updatedRules };
    setSelectedDataset(updatedDataset);
    setRulesDatasets(rulesDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));

    try {
      const { error } = await supabase
        .from('rules')
        .update({ [field]: value })
        .eq('id', ruleId);

      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Error updating rule", description: error.message, variant: "destructive" });
    }
  };

  const updateSubRule = async (ruleId: string, subRuleId: string, field: keyof SubRule, value: string) => {
    if (!selectedDataset) return;

    const updatedRules = selectedDataset.rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          subRules: rule.subRules.map(subRule =>
            subRule.id === subRuleId ? { ...subRule, [field]: value } : subRule
          )
        };
      }
      return rule;
    });

    const updatedDataset = { ...selectedDataset, rules: updatedRules };
    setSelectedDataset(updatedDataset);
    setRulesDatasets(rulesDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));

    try {
      const { error } = await supabase
        .from('sub_rules')
        .update({ [field]: value })
        .eq('id', subRuleId);

      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Error updating sub-rule", description: error.message, variant: "destructive" });
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!selectedDataset) return;

    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      const updatedRules = selectedDataset.rules.filter(rule => rule.id !== ruleId);
      const updatedDataset = { ...selectedDataset, rules: updatedRules };
      setSelectedDataset(updatedDataset);
      setRulesDatasets(rulesDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
      toast({ title: "Rule deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error deleting rule", description: error.message, variant: "destructive" });
    }
  };

  const deleteSubRule = async (ruleId: string, subRuleId: string) => {
    if (!selectedDataset) return;

    try {
      const { error } = await supabase
        .from('sub_rules')
        .delete()
        .eq('id', subRuleId);

      if (error) throw error;

      const updatedRules = selectedDataset.rules.map(rule => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            subRules: rule.subRules.filter(subRule => subRule.id !== subRuleId)
          };
        }
        return rule;
      });

      const updatedDataset = { ...selectedDataset, rules: updatedRules };
      setSelectedDataset(updatedDataset);
      setRulesDatasets(rulesDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
      toast({ title: "Sub-rule deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error deleting sub-rule", description: error.message, variant: "destructive" });
    }
  };

  const toggleExpanded = (ruleId: string) => {
    if (!selectedDataset) return;

    const updatedRules = selectedDataset.rules.map(rule =>
      rule.id === ruleId ? { ...rule, isExpanded: !rule.isExpanded } : rule
    );

    const updatedDataset = { ...selectedDataset, rules: updatedRules };
    setSelectedDataset(updatedDataset);
  };

  const saveDataset = () => {
    if (!selectedDataset) return;
    toast({
      title: "Rules dataset saved",
      description: "Your rules have been saved successfully"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'archived':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (selectedDataset) {
    return (
      <div className="w-full px-6 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => setSelectedDataset(null)} className="mb-4">
            ← Back to Datasets
          </Button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">{selectedDataset.name}</h1>
            <div className="flex gap-2">
              <Button onClick={saveDataset}>
                <Save className="w-4 h-4 mr-2" />
                Save Dataset
              </Button>
              <Button onClick={addRule}>
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">{selectedDataset.description}</p>
        </div>

        <div className="space-y-4">
          {selectedDataset.rules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No rules yet. Start by adding your first rule.</p>
                <Button onClick={addRule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            selectedDataset.rules.map(rule => (
              <Card key={rule.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(rule.id)}
                      >
                        {rule.isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                      <CardTitle className="text-lg">
                        {rule.name || 'Untitled Rule'}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSubRule(rule.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sub-Rule
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {rule.isExpanded && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`rule-name-${rule.id}`}>Rule Name</Label>
                      <Input
                        id={`rule-name-${rule.id}`}
                        value={rule.name}
                        onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                        placeholder="Enter rule name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`rule-description-${rule.id}`}>Description</Label>
                      <Textarea
                        id={`rule-description-${rule.id}`}
                        value={rule.description}
                        onChange={(e) => updateRule(rule.id, 'description', e.target.value)}
                        placeholder="Describe this rule"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`rule-prompt-${rule.id}`}>Prompt</Label>
                      <Textarea
                        id={`rule-prompt-${rule.id}`}
                        value={rule.prompt}
                        onChange={(e) => updateRule(rule.id, 'prompt', e.target.value)}
                        placeholder="Enter the prompt for this rule"
                        rows={3}
                      />
                    </div>

                    {rule.subRules.length > 0 && (
                      <div className="space-y-3 pl-6 border-l-2 border-muted">
                        <h4 className="font-medium text-sm text-muted-foreground">Sub-Rules</h4>
                        {rule.subRules.map(subRule => (
                          <Card key={subRule.id} className="bg-muted/50">
                            <CardContent className="pt-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <Label className="text-xs">Sub-Rule</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSubRule(rule.id, subRule.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <div>
                                <Label htmlFor={`subrule-prompt-${subRule.id}`} className="text-xs">
                                  Prompt
                                </Label>
                                <Textarea
                                  id={`subrule-prompt-${subRule.id}`}
                                  value={subRule.prompt}
                                  onChange={(e) => updateSubRule(rule.id, subRule.id, 'prompt', e.target.value)}
                                  placeholder="Enter sub-rule prompt"
                                  rows={2}
                                  className="text-sm"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`subrule-description-${subRule.id}`} className="text-xs">
                                  Description
                                </Label>
                                <Input
                                  id={`subrule-description-${subRule.id}`}
                                  value={subRule.description}
                                  onChange={(e) => updateSubRule(rule.id, subRule.id, 'description', e.target.value)}
                                  placeholder="Describe sub-rule"
                                  className="text-sm"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Rules Datasets</h1>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Dataset
          </Button>
        </div>
        <p className="text-muted-foreground">
          Create and manage rules datasets with dynamic sub-rules and prompts
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatasets.map((dataset) => (
          <Card
            key={dataset.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedDataset(dataset)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <CardTitle className="text-lg">{dataset.name}</CardTitle>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {dataset.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`px-2 py-1 rounded text-xs ${getStatusColor(dataset.status)}`}>
                  {dataset.status}
                </div>
                <span className="text-sm text-muted-foreground">
                  {dataset.rules.length} rules
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDatasets.length === 0 && rulesDatasets.length > 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}

        {rulesDatasets.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No rules datasets yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first rules dataset to start organizing your AI rules
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Dataset
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Rules Dataset</DialogTitle>
            <DialogDescription>
              Create a new dataset to organize your rules with sub-rules and prompts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dataset-name">Name *</Label>
              <Input
                id="dataset-name"
                placeholder="My Rules Dataset"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataset-description">Description</Label>
              <Textarea
                id="dataset-description"
                placeholder="Dataset description..."
                value={newDatasetDescription}
                onChange={(e) => setNewDatasetDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createDataset}>
              Create Dataset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RulesDatasetPage;
