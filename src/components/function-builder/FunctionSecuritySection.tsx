import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export const FunctionSecuritySection: React.FC<{ functionId: string | null; disabled: boolean }> = ({
  functionId,
  disabled
}) => {
  const [security, setSecurity] = useState<any>(null);
  const [roleInput, setRoleInput] = useState('');
  const [secretInput, setSecretInput] = useState('');

  useEffect(() => {
    if (functionId) {
      fetchSecurity();
    }
  }, [functionId]);

  const fetchSecurity = async () => {
    if (!functionId) return;

    const { data, error } = await supabase
      .from('function_security')
      .select('*')
      .eq('function_id', functionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching security:', error);
      return;
    }

    setSecurity(data || {
      require_authentication: true,
      allowed_roles: [],
      sanitize_inputs: true,
      filter_outputs: false,
      used_secrets: []
    });
  };

  const handleSave = async () => {
    if (!functionId || !security) return;

    if (security.id) {
      const { error } = await supabase
        .from('function_security')
        .update(security)
        .eq('id', security.id);

      if (error) {
        console.error('Error updating security:', error);
        toast.error('Failed to update security settings');
        return;
      }
    } else {
      const { error } = await supabase
        .from('function_security')
        .insert([{ ...security, function_id: functionId }]);

      if (error) {
        console.error('Error creating security:', error);
        toast.error('Failed to create security settings');
        return;
      }
    }

    toast.success('Security settings saved');
    fetchSecurity();
  };

  const handleAddRole = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && roleInput.trim()) {
      e.preventDefault();
      if (!security.allowed_roles.includes(roleInput.trim())) {
        setSecurity({
          ...security,
          allowed_roles: [...security.allowed_roles, roleInput.trim()]
        });
      }
      setRoleInput('');
    }
  };

  const handleRemoveRole = (role: string) => {
    setSecurity({
      ...security,
      allowed_roles: security.allowed_roles.filter((r: string) => r !== role)
    });
  };

  const handleAddSecret = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && secretInput.trim()) {
      e.preventDefault();
      if (!security.used_secrets.includes(secretInput.trim())) {
        setSecurity({
          ...security,
          used_secrets: [...security.used_secrets, secretInput.trim()]
        });
      }
      setSecretInput('');
    }
  };

  const handleRemoveSecret = (secret: string) => {
    setSecurity({
      ...security,
      used_secrets: security.used_secrets.filter((s: string) => s !== secret)
    });
  };

  if (!functionId) {
    return <p className="text-muted-foreground">Save the function first to configure security.</p>;
  }

  if (!security) {
    return <p className="text-muted-foreground">Loading security settings...</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Security Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Require Authentication</Label>
            <Switch
              checked={security.require_authentication}
              onCheckedChange={(checked) => setSecurity({ ...security, require_authentication: checked })}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Sanitize Inputs</Label>
            <Switch
              checked={security.sanitize_inputs}
              onCheckedChange={(checked) => setSecurity({ ...security, sanitize_inputs: checked })}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Filter Outputs</Label>
            <Switch
              checked={security.filter_outputs}
              onCheckedChange={(checked) => setSecurity({ ...security, filter_outputs: checked })}
              disabled={disabled}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Allowed Roles</h4>
        <Input
          value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)}
          onKeyDown={handleAddRole}
          placeholder="Type role and press Enter"
          disabled={disabled}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {security.allowed_roles.map((role: string) => (
            <Badge key={role} variant="secondary" className="px-3 py-1">
              {role}
              {!disabled && (
                <button onClick={() => handleRemoveRole(role)} className="ml-2 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Used Secrets</h4>
        <Input
          value={secretInput}
          onChange={(e) => setSecretInput(e.target.value)}
          onKeyDown={handleAddSecret}
          placeholder="Type secret name and press Enter"
          disabled={disabled}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {security.used_secrets.map((secret: string) => (
            <Badge key={secret} variant="secondary" className="px-3 py-1">
              {secret}
              {!disabled && (
                <button onClick={() => handleRemoveSecret(secret)} className="ml-2 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      </Card>

      {!disabled && (
        <Button onClick={handleSave}>Save Security Settings</Button>
      )}
    </div>
  );
};
