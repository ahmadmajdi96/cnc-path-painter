import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Lock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FunctionListProps {
  functions: any[];
  selectedFunction: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FunctionList: React.FC<FunctionListProps> = ({
  functions,
  selectedFunction,
  onSelect,
  onDelete
}) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4 text-foreground">Functions</h3>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-2">
          {functions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No functions yet. Create one to get started.
            </p>
          ) : (
            functions.map((func) => (
              <div
                key={func.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFunction === func.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card border-border hover:bg-accent'
                }`}
                onClick={() => onSelect(func.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {func.name}
                      </h4>
                      {func.is_locked && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {func.category}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(func.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {func.description || 'No description'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    v{func.version_number}
                  </span>
                  {func.tags?.length > 0 && (
                    <div className="flex gap-1">
                      {func.tags.slice(0, 2).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
