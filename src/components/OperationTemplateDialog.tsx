import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, FileText, Calculator, GitBranch, Code, Globe, Repeat, Mail, Brain, Clock } from 'lucide-react';
import type { AutomationOperation } from './AutomationControlSystem';

interface OperationTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: AutomationOperation[];
  onSelectTemplate: (template: AutomationOperation) => void;
}

export const OperationTemplateDialog: React.FC<OperationTemplateDialogProps> = ({
  open,
  onOpenChange,
  templates,
  onSelectTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'crud_operation': return <Database className="h-4 w-4" />;
      case 'file_operation': return <FileText className="h-4 w-4" />;
      case 'logic_conditions': return <GitBranch className="h-4 w-4" />;
      case 'run_script': return <Code className="h-4 w-4" />;
      case 'http_request': return <Globe className="h-4 w-4" />;
      case 'data_transformation': return <Repeat className="h-4 w-4" />;
      case 'messaging': return <Mail className="h-4 w-4" />;
      case 'ai_model': return <Brain className="h-4 w-4" />;
      case 'delay': return <Clock className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Operation Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Search Templates</Label>
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No templates found. Create operations and save them as templates for reuse.
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      onSelectTemplate(template);
                      onOpenChange(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getOperationIcon(template.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{template.templateName || template.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {template.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
