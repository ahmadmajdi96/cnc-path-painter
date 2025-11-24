import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export const FunctionValidationSection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [validation, setValidation] = useState<any>(null);

  useEffect(() => {
    if (functionId) {
      fetchValidation();
    }
  }, [functionId]);

  const fetchValidation = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_validation')
      .select('*')
      .eq('function_id', functionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching validation:', error);
      return;
    }

    setValidation(data || {
      input_validation: {},
      output_validation: {},
      business_rules: [],
      dependency_availability_required: true
    });
  };

  const handleSave = async () => {
    if (!functionId || !validation) return;

    if (validation.id) {
      const { error } = await supabase
        .from('function_validation')
        .update(validation)
        .eq('id', validation.id);

      if (error) {
        console.error('Error updating validation:', error);
        toast.error('Failed to update validation settings');
        return;
      }
    } else {
      const { error } = await supabase
        .from('function_validation')
        .insert([{ ...validation, function_id: functionId }]);

      if (error) {
        console.error('Error creating validation:', error);
        toast.error('Failed to create validation settings');
        return;
      }
    }

    toast.success('Validation settings saved');
    fetchValidation();
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to configure validation.</p>;
  }

  if (!validation) {
    return <p className="text-muted-foreground">Loading validation settings...</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Input Validation</h4>
        <Textarea
          value={JSON.stringify(validation.input_validation, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setValidation({ ...validation, input_validation: parsed });
            } catch {}
          }}
          placeholder='{"field": {"type": "string", "required": true}}'
          rows={6}
          disabled={disabled}
        />
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Output Validation</h4>
        <Textarea
          value={JSON.stringify(validation.output_validation, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setValidation({ ...validation, output_validation: parsed });
            } catch {}
          }}
          placeholder='{"result": {"type": "object", "required": true}}'
          rows={6}
          disabled={disabled}
        />
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Business Rules</h4>
        <Textarea
          value={JSON.stringify(validation.business_rules, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setValidation({ ...validation, business_rules: parsed });
            } catch {}
          }}
          placeholder='[{"rule": "amount must be positive", "condition": "amount > 0"}]'
          rows={6}
          disabled={disabled}
        />
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Label>Require Dependency Availability</Label>
          <Switch
            checked={validation.dependency_availability_required}
            onCheckedChange={(checked) => setValidation({ ...validation, dependency_availability_required: checked })}
            disabled={disabled}
          />
        </div>
      </Card>

      {!disabled && (
        <Button onClick={handleSave}>Save Validation Settings</Button>
      )}
    </div>
  );
};
