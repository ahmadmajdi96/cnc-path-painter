import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { FunctionData } from '../FunctionBuilder';

interface FunctionVersionSectionProps {
  data: FunctionData;
  onChange: (data: FunctionData) => void;
  disabled: boolean;
}

export const FunctionVersionSection: React.FC<FunctionVersionSectionProps> = ({
  data,
  onChange,
  disabled
}) => {
  const [editorInput, setEditorInput] = React.useState('');

  const handleAddEditor = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editorInput.trim()) {
      e.preventDefault();
      if (!data.editable_by.includes(editorInput.trim())) {
        onChange({ ...data, editable_by: [...data.editable_by, editorInput.trim()] });
      }
      setEditorInput('');
    }
  };

  const handleRemoveEditor = (editor: string) => {
    onChange({ ...data, editable_by: data.editable_by.filter(e => e !== editor) });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Version Information</h4>
        <div className="space-y-4">
          <div>
            <Label>Version Number</Label>
            <Input
              value={data.version_number}
              onChange={(e) => onChange({ ...data, version_number: e.target.value })}
              placeholder="1.0.0"
              disabled={disabled}
              className="mt-2"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Lock Status</Label>
              <Badge variant={data.is_locked ? 'destructive' : 'default'}>
                {data.is_locked ? 'Locked' : 'Unlocked'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {data.is_locked
                ? 'This function is locked and cannot be edited'
                : 'This function is unlocked and can be edited'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4 text-foreground">Editable By</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Specify user IDs or roles that can edit this function
        </p>
        <Input
          value={editorInput}
          onChange={(e) => setEditorInput(e.target.value)}
          onKeyDown={handleAddEditor}
          placeholder="Type user ID or role and press Enter"
          disabled={disabled}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {data.editable_by.map((editor) => (
            <Badge key={editor} variant="secondary" className="px-3 py-1">
              {editor}
              {!disabled && (
                <button
                  onClick={() => handleRemoveEditor(editor)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};
