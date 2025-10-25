import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const RulesDatasetPage = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>([]);

  const addRule = () => {
    const newRule: Rule = {
      id: Date.now().toString(),
      name: '',
      description: '',
      prompt: '',
      subRules: [],
      isExpanded: true,
    };
    setRules([...rules, newRule]);
  };

  const addSubRule = (ruleId: string) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          subRules: [
            ...rule.subRules,
            { id: Date.now().toString(), prompt: '', description: '' }
          ]
        };
      }
      return rule;
    }));
  };

  const updateRule = (ruleId: string, field: keyof Rule, value: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    ));
  };

  const updateSubRule = (ruleId: string, subRuleId: string, field: keyof SubRule, value: string) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          subRules: rule.subRules.map(subRule =>
            subRule.id === subRuleId ? { ...subRule, [field]: value } : subRule
          )
        };
      }
      return rule;
    }));
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
    toast({ title: "Rule deleted successfully" });
  };

  const deleteSubRule = (ruleId: string, subRuleId: string) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          subRules: rule.subRules.filter(subRule => subRule.id !== subRuleId)
        };
      }
      return rule;
    }));
    toast({ title: "Sub-rule deleted successfully" });
  };

  const toggleExpanded = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, isExpanded: !rule.isExpanded } : rule
    ));
  };

  const saveRulesDataset = () => {
    toast({
      title: "Rules dataset saved",
      description: "Your rules have been saved successfully"
    });
  };

  return (
    <div className="w-full px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-foreground">Rules Dataset</h1>
          <div className="flex gap-2">
            <Button onClick={saveRulesDataset}>Save Dataset</Button>
            <Button onClick={addRule}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Create and manage rules with sub-rules, prompts, and descriptions
        </p>
      </div>

      <div className="space-y-4">
        {rules.length === 0 ? (
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
          rules.map(rule => (
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
};

export default RulesDatasetPage;
