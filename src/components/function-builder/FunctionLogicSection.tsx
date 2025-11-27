import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, MoveUp, MoveDown, ChevronDown, ChevronRight, Link, Variable, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const logicBlocks = [
  'condition', 'loop', 'variable_assignment', 'calculation',
  'format', 'transformation', 'event_action', 'wait_delay',
  'retry', 'stop_function', 'return_output'
];

interface LogicStep {
  id: string;
  step_id: string;
  step_type: string;
  config: any;
  input_mappings: any;
  fixed_variables: any;
  output_variables: any;
  step_output_mappings: any;
  position: number;
}

interface FunctionInput {
  id: string;
  name: string;
  data_type: string;
}

export const FunctionLogicSection: React.FC<{
  functionId: string | null;
  disabled: boolean;
  inputs: FunctionInput[];
}> = ({ functionId, disabled, inputs }) => {
  const [logicSteps, setLogicSteps] = useState<LogicStep[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [newStep, setNewStep] = useState({
    step_id: '',
    step_type: 'condition',
    config: '{}'
  });

  useEffect(() => {
    if (functionId) {
      fetchLogicSteps();
    }
  }, [functionId]);

  const fetchLogicSteps = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_logic')
      .select('*')
      .eq('function_id', functionId)
      .order('position');

    if (error) {
      console.error('Error fetching logic steps:', error);
      return;
    }

    setLogicSteps(data || []);
  };

  const toggleExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleAdd = async () => {
    if (!functionId || !newStep.step_id) {
      toast.error('Function ID and step ID are required');
      return;
    }

    try {
      const config = JSON.parse(newStep.config);

      const { error } = await supabase
        .from('function_logic')
        .insert([{
          function_id: functionId,
          step_id: newStep.step_id,
          step_type: newStep.step_type,
          config,
          input_mappings: [],
          fixed_variables: [],
          output_variables: [],
          step_output_mappings: [],
          position: logicSteps.length
        }]);

      if (error) throw error;

      toast.success('Logic step added');
      fetchLogicSteps();
      setNewStep({ step_id: '', step_type: 'condition', config: '{}' });
    } catch (error) {
      console.error('Error adding logic step:', error);
      toast.error('Failed to add logic step. Check JSON format.');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('function_logic')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting logic step:', error);
      toast.error('Failed to delete logic step');
      return;
    }

    toast.success('Logic step deleted');
    fetchLogicSteps();
  };

  const updateStep = async (stepId: string, updates: Partial<LogicStep>) => {
    const { error } = await supabase
      .from('function_logic')
      .update(updates)
      .eq('id', stepId);

    if (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
      return;
    }

    fetchLogicSteps();
  };

  const addInputMapping = (step: LogicStep) => {
    const newMapping = { input_name: '', step_variable: '' };
    updateStep(step.id, {
      input_mappings: [...(step.input_mappings || []), newMapping]
    });
  };

  const updateInputMapping = (step: LogicStep, index: number, field: string, value: string) => {
    const mappings = [...(step.input_mappings || [])];
    mappings[index] = { ...mappings[index], [field]: value };
    updateStep(step.id, { input_mappings: mappings });
  };

  const removeInputMapping = (step: LogicStep, index: number) => {
    const mappings = [...(step.input_mappings || [])];
    mappings.splice(index, 1);
    updateStep(step.id, { input_mappings: mappings });
  };

  const addFixedVariable = (step: LogicStep) => {
    const newVar = { name: '', value: '', type: 'string' };
    updateStep(step.id, {
      fixed_variables: [...(step.fixed_variables || []), newVar]
    });
  };

  const updateFixedVariable = (step: LogicStep, index: number, field: string, value: string) => {
    const vars = [...(step.fixed_variables || [])];
    vars[index] = { ...vars[index], [field]: value };
    updateStep(step.id, { fixed_variables: vars });
  };

  const removeFixedVariable = (step: LogicStep, index: number) => {
    const vars = [...(step.fixed_variables || [])];
    vars.splice(index, 1);
    updateStep(step.id, { fixed_variables: vars });
  };

  const addOutputVariable = (step: LogicStep) => {
    const newVar = { name: '', type: 'string' };
    updateStep(step.id, {
      output_variables: [...(step.output_variables || []), newVar]
    });
  };

  const updateOutputVariable = (step: LogicStep, index: number, field: string, value: string) => {
    const vars = [...(step.output_variables || [])];
    vars[index] = { ...vars[index], [field]: value };
    updateStep(step.id, { output_variables: vars });
  };

  const removeOutputVariable = (step: LogicStep, index: number) => {
    const vars = [...(step.output_variables || [])];
    vars.splice(index, 1);
    updateStep(step.id, { output_variables: vars });
  };

  const addStepOutputMapping = (step: LogicStep) => {
    const newMapping = { source_step_id: '', source_output: '', target_variable: '' };
    updateStep(step.id, {
      step_output_mappings: [...(step.step_output_mappings || []), newMapping]
    });
  };

  const updateStepOutputMapping = (step: LogicStep, index: number, field: string, value: string) => {
    const mappings = [...(step.step_output_mappings || [])];
    mappings[index] = { ...mappings[index], [field]: value };
    updateStep(step.id, { step_output_mappings: mappings });
  };

  const removeStepOutputMapping = (step: LogicStep, index: number) => {
    const mappings = [...(step.step_output_mappings || [])];
    mappings.splice(index, 1);
    updateStep(step.id, { step_output_mappings: mappings });
  };

  const getPreviousSteps = (currentPosition: number) => {
    return logicSteps.filter(s => s.position < currentPosition);
  };

  const getStepOutputs = (stepId: string) => {
    const step = logicSteps.find(s => s.step_id === stepId);
    return step?.output_variables || [];
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to add logic.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {logicSteps.map((step, index) => (
          <Card key={step.id} className="p-4">
            <Collapsible open={expandedSteps.has(step.id)} onOpenChange={() => toggleExpanded(step.id)}>
              <div className="flex items-start justify-between">
                <CollapsibleTrigger className="flex items-center gap-3 flex-1">
                  {expandedSteps.has(step.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium text-foreground">{step.step_id}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{step.step_type.replace(/_/g, ' ')}</p>
                  </div>
                </CollapsibleTrigger>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={disabled || index === 0}>
                    <MoveUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={disabled || index === logicSteps.length - 1}>
                    <MoveDown className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(step.id)} disabled={disabled}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CollapsibleContent className="mt-4 space-y-4">
                {/* Input Mappings */}
                <div className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Link className="h-3 w-3" /> Input Mappings
                    </Label>
                    <Button variant="ghost" size="sm" onClick={() => addInputMapping(step)} disabled={disabled}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {(step.input_mappings || []).map((mapping: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <Select
                        value={mapping.input_name}
                        onValueChange={(v) => updateInputMapping(step, i, 'input_name', v)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="flex-1 h-8">
                          <SelectValue placeholder="Select input" />
                        </SelectTrigger>
                        <SelectContent>
                          {inputs.map((input) => (
                            <SelectItem key={input.id} value={input.name}>
                              {input.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Input
                        value={mapping.step_variable}
                        onChange={(e) => updateInputMapping(step, i, 'step_variable', e.target.value)}
                        placeholder="Step variable"
                        className="flex-1 h-8"
                        disabled={disabled}
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeInputMapping(step, i)} disabled={disabled}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Fixed Variables */}
                <div className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-medium flex items-center gap-1">
                      <Variable className="h-3 w-3" /> Fixed Variables
                    </Label>
                    <Button variant="ghost" size="sm" onClick={() => addFixedVariable(step)} disabled={disabled}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {(step.fixed_variables || []).map((v: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <Input
                        value={v.name}
                        onChange={(e) => updateFixedVariable(step, i, 'name', e.target.value)}
                        placeholder="Name"
                        className="flex-1 h-8"
                        disabled={disabled}
                      />
                      <Input
                        value={v.value}
                        onChange={(e) => updateFixedVariable(step, i, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 h-8"
                        disabled={disabled}
                      />
                      <Select
                        value={v.type}
                        onValueChange={(val) => updateFixedVariable(step, i, 'type', val)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">string</SelectItem>
                          <SelectItem value="number">number</SelectItem>
                          <SelectItem value="boolean">boolean</SelectItem>
                          <SelectItem value="json">json</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFixedVariable(step, i)} disabled={disabled}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Output Variables */}
                <div className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-medium">Output Variables (optional)</Label>
                    <Button variant="ghost" size="sm" onClick={() => addOutputVariable(step)} disabled={disabled}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {(step.output_variables || []).map((v: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <Input
                        value={v.name}
                        onChange={(e) => updateOutputVariable(step, i, 'name', e.target.value)}
                        placeholder="Output name"
                        className="flex-1 h-8"
                        disabled={disabled}
                      />
                      <Select
                        value={v.type}
                        onValueChange={(val) => updateOutputVariable(step, i, 'type', val)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">string</SelectItem>
                          <SelectItem value="number">number</SelectItem>
                          <SelectItem value="boolean">boolean</SelectItem>
                          <SelectItem value="object">object</SelectItem>
                          <SelectItem value="list">list</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeOutputVariable(step, i)} disabled={disabled}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Step Output Mappings (from previous steps) */}
                {index > 0 && (
                  <div className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-medium">Map from Previous Steps</Label>
                      <Button variant="ghost" size="sm" onClick={() => addStepOutputMapping(step)} disabled={disabled}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {(step.step_output_mappings || []).map((mapping: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <Select
                          value={mapping.source_step_id}
                          onValueChange={(v) => updateStepOutputMapping(step, i, 'source_step_id', v)}
                          disabled={disabled}
                        >
                          <SelectTrigger className="flex-1 h-8">
                            <SelectValue placeholder="Source step" />
                          </SelectTrigger>
                          <SelectContent>
                            {getPreviousSteps(step.position).map((s) => (
                              <SelectItem key={s.step_id} value={s.step_id}>
                                {s.step_id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={mapping.source_output}
                          onValueChange={(v) => updateStepOutputMapping(step, i, 'source_output', v)}
                          disabled={disabled || !mapping.source_step_id}
                        >
                          <SelectTrigger className="flex-1 h-8">
                            <SelectValue placeholder="Output var" />
                          </SelectTrigger>
                          <SelectContent>
                            {getStepOutputs(mapping.source_step_id).map((out: any) => (
                              <SelectItem key={out.name} value={out.name}>
                                {out.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Input
                          value={mapping.target_variable}
                          onChange={(e) => updateStepOutputMapping(step, i, 'target_variable', e.target.value)}
                          placeholder="Target var"
                          className="flex-1 h-8"
                          disabled={disabled}
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStepOutputMapping(step, i)} disabled={disabled}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Configuration */}
                <div>
                  <Label className="text-xs">Configuration (JSON)</Label>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32 mt-1">
                    {JSON.stringify(step.config, null, 2)}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {!disabled && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-4 text-foreground">Add Logic Step</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Step ID</Label>
                <Input
                  value={newStep.step_id}
                  onChange={(e) => setNewStep({ ...newStep, step_id: e.target.value })}
                  placeholder="step_1"
                />
              </div>
              <div>
                <Label>Step Type</Label>
                <Select
                  value={newStep.step_type}
                  onValueChange={(value) => setNewStep({ ...newStep, step_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {logicBlocks.map((block) => (
                      <SelectItem key={block} value={block}>
                        {block.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Configuration (JSON)</Label>
              <Textarea
                value={newStep.config}
                onChange={(e) => setNewStep({ ...newStep, config: e.target.value })}
                placeholder='{"condition": "input.value > 10"}'
                rows={4}
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Logic Step
          </Button>
        </Card>
      )}
    </div>
  );
};
