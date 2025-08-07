
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Settings, 
  Trash2, 
  FileText, 
  List, 
  CreditCard, 
  Type, 
  CheckSquare,
  Layout
} from 'lucide-react';
import { AppSection } from './AppBuilderControlSystem';

interface DraggableSectionProps {
  section: AppSection;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (section: AppSection) => void;
  onDelete: (sectionId: string) => void;
}

const sectionIcons = {
  form: FileText,
  details: Layout,
  card: CreditCard,
  list: List,
  text: Type,
  confirmation: CheckSquare,
};

const sectionColors = {
  form: 'border-blue-200 bg-blue-50',
  details: 'border-green-200 bg-green-50',
  card: 'border-purple-200 bg-purple-50',
  list: 'border-orange-200 bg-orange-50',
  text: 'border-gray-200 bg-gray-50',
  confirmation: 'border-red-200 bg-red-50',
};

export const DraggableSection: React.FC<DraggableSectionProps> = ({
  section,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'absolute' as const,
    left: `${section.layout?.x || 0}%`,
    top: `${section.layout?.y || 0}px`,
    width: `${section.layout?.width || 100}%`,
    height: section.layout?.height ? `${section.layout.height}px` : 'auto',
    zIndex: section.layout?.zIndex || 1,
  };

  const Icon = sectionIcons[section.type];
  const colorClass = sectionColors[section.type];

  const handlePositionChange = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = e.clientY - rect.top;
        
        onUpdate({
          ...section,
          layout: {
            ...section.layout!,
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, y),
          },
        });
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group transition-all ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <Card 
        className={`
          ${colorClass} 
          ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''} 
          hover:shadow-md transition-all cursor-pointer
        `}
        onMouseDown={handlePositionChange}
      >
        <CardContent className="p-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-white rounded"
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{section.title}</span>
              <Badge variant="secondary" className="text-xs">
                {section.type.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="h-7 w-7 p-0"
              >
                <Settings className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(section.id);
                }}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Section Preview */}
          <div className="bg-white rounded border p-3 min-h-[80px] flex items-center justify-center">
            {section.type === 'form' && (
              <div className="w-full space-y-2">
                {section.fields?.slice(0, 2).map((field, index) => (
                  <div key={index} className="bg-gray-100 rounded p-2 text-xs">
                    {field.label} ({field.type})
                  </div>
                ))}
                {(section.fields?.length || 0) > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{(section.fields?.length || 0) - 2} more fields
                  </div>
                )}
                {(!section.fields || section.fields.length === 0) && (
                  <div className="text-xs text-gray-500 text-center">
                    No fields added yet
                  </div>
                )}
              </div>
            )}
            
            {section.type === 'text' && (
              <div className="text-xs text-gray-600 text-center">
                {section.content || 'Add your text content here...'}
              </div>
            )}
            
            {section.type === 'details' && (
              <div className="text-xs text-gray-600 text-center">
                {section.content || 'Add detailed information here...'}
              </div>
            )}
            
            {(section.type === 'card' || section.type === 'list' || section.type === 'confirmation') && (
              <div className="text-xs text-gray-600 text-center">
                {section.content || `${section.type} content will be displayed here`}
              </div>
            )}
          </div>

          {/* Position Info */}
          {isSelected && (
            <div className="mt-2 flex gap-2 text-xs text-gray-500">
              <span>X: {Math.round(section.layout?.x || 0)}%</span>
              <span>Y: {section.layout?.y || 0}px</span>
              <span>W: {section.layout?.width || 100}%</span>
              {section.layout?.height && <span>H: {section.layout.height}px</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
