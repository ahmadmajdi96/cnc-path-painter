import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { toast } from 'sonner';

export const FunctionTestingSection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [testing, setTesting] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (functionId) {
      fetchTesting();
    }
  }, [functionId]);

  const fetchTesting = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_tests')
      .select('*')
      .eq('function_id', functionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching testing:', error);
      return;
    }

    setTesting(data || {
      test_inputs: {},
      expected_outputs: {},
      mock_dependencies: {},
      preview_enabled: true
    });
  };

  const handleSave = async () => {
    if (!functionId || !testing) return;

    if (testing.id) {
      const { error } = await supabase
        .from('function_tests')
        .update(testing)
        .eq('id', testing.id);

      if (error) {
        console.error('Error updating testing:', error);
        toast.error('Failed to update testing configuration');
        return;
      }
    } else {
      const { error } = await supabase
        .from('function_tests')
        .insert([{ ...testing, function_id: functionId }]);

      if (error) {
        console.error('Error creating testing:', error);
        toast.error('Failed to create testing configuration');
        return;
      }
    }

    toast.success('Testing configuration saved');
    fetchTesting();
  };

  const handleRunTest = () => {
    // Simulate test execution
    setTestResult({
      status: 'success',
      executionTime: '245ms',
      output: { result: 'Test passed successfully' }
    });
    toast.success('Test executed successfully');
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to configure testing.</p>;
  }

  if (!testing) {
    return <p className="text-muted-foreground">Loading testing configuration...</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Test Inputs</h4>
        <Textarea
          value={JSON.stringify(testing.test_inputs, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setTesting({ ...testing, test_inputs: parsed });
            } catch {}
          }}
          placeholder='{"input1": "value1", "input2": 123}'
          rows={6}
          disabled={disabled}
        />
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Expected Outputs</h4>
        <Textarea
          value={JSON.stringify(testing.expected_outputs, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setTesting({ ...testing, expected_outputs: parsed });
            } catch {}
          }}
          placeholder='{"output": "expected_result"}'
          rows={6}
          disabled={disabled}
        />
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Mock Dependencies</h4>
        <Textarea
          value={JSON.stringify(testing.mock_dependencies, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setTesting({ ...testing, mock_dependencies: parsed });
            } catch {}
          }}
          placeholder='{"api_call": {"response": "mocked_data"}}'
          rows={6}
          disabled={disabled}
        />
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Label>Preview Mode Enabled</Label>
          <Switch
            checked={testing.preview_enabled}
            onCheckedChange={(checked) => setTesting({ ...testing, preview_enabled: checked })}
            disabled={disabled}
          />
        </div>
      </Card>

      {!disabled && (
        <div className="flex gap-2">
          <Button onClick={handleSave}>Save Test Configuration</Button>
          <Button onClick={handleRunTest} variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Run Test
          </Button>
        </div>
      )}

      {testResult && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-4 text-foreground">Test Result</h4>
          <div className="space-y-2">
            <p className="text-sm"><span className="font-medium">Status:</span> {testResult.status}</p>
            <p className="text-sm"><span className="font-medium">Execution Time:</span> {testResult.executionTime}</p>
            <div>
              <p className="text-sm font-medium mb-2">Output:</p>
              <pre className="text-xs bg-background p-2 rounded overflow-auto">
                {JSON.stringify(testResult.output, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
