import React from 'react';
import { useDraggable } from '@dnd-kit/core';
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
  Layout,
  Image,
  MapPin,
  Hash
} from 'lucide-react';
import { AppSection } from './AppBuilderControlSystem';

interface DraggableSectionProps {
  section: AppSection;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (section: AppSection) => void;
  onDelete: (sectionId: string) => void;
  isDragging?: boolean;
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
  form: 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-100',
  details: 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-green-100',
  card: 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 shadow-purple-100',
  list: 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-100',
  text: 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 shadow-gray-100',
  confirmation: 'border-red-300 bg-gradient-to-br from-red-50 to-red-100 shadow-red-100',
};

export const DraggableSection: React.FC<DraggableSectionProps> = ({
  section,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isCurrentlyDragging,
  } = useDraggable({ 
    id: section.id,
  });

  const style = {
    position: 'absolute' as const,
    left: `${section.layout?.x || 0}%`,
    top: `${section.layout?.y || 0}px`,
    width: `${section.layout?.width || 100}%`,
    height: section.layout?.height ? `${section.layout.height}px` : 'auto',
    zIndex: section.layout?.zIndex || 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isCurrentlyDragging ? 0.7 : 1,
  };

  const Icon = sectionIcons[section.type];
  const colorClass = sectionColors[section.type];

  const getSectionStyles = () => {
    const config = section.config || {};
    return {
      backgroundColor: config.backgroundColor || '#ffffff',
      color: config.fontColor || '#000000',
      fontSize: config.fontSize ? `var(--font-size-${config.fontSize})` : undefined,
      fontWeight: config.fontWeight || 'normal',
      textAlign: config.textAlign || 'left',
    } as React.CSSProperties;
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = section.layout?.width || 100;
    const startHeight = section.layout?.height || 150;

    const handleMouseMove = (e: MouseEvent) => {
      const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect();
      if (!canvasRect) return;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let hasChanged = false;

      if (direction.includes('right')) {
        const deltaX = e.clientX - startX;
        const newWidthCandidate = Math.max(20, Math.min(100, startWidth + (deltaX / canvasRect.width) * 100));
        if (Math.abs(newWidthCandidate - newWidth) > 0.1) {
          newWidth = newWidthCandidate;
          hasChanged = true;
        }
      }

      if (direction.includes('bottom')) {
        const deltaY = e.clientY - startY;
        const newHeightCandidate = Math.max(100, startHeight + deltaY);
        if (Math.abs(newHeightCandidate - newHeight) > 1) {
          newHeight = newHeightCandidate;
          hasChanged = true;
        }
      }

      // Only update if there's a meaningful change
      if (hasChanged) {
        onUpdate({
          ...section,
          layout: {
            ...section.layout!,
            width: newWidth,
            height: newHeight,
          },
        });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Force a final update to ensure the change is saved
      onUpdate({
        ...section,
        layout: {
          ...section.layout!,
        },
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderListPreview = () => {
    const listConfig = section.config?.listItems;
    const isGrid = listConfig?.viewType === 'grid';
    const itemsPerRow = listConfig?.itemsPerRow || 3;
    const cardStyle = listConfig?.cardStyle || false;
    
    // Sample data for preview
    const sampleData = listConfig?.staticData || [
      { id: '1', title: 'Item 1', subtitle: 'Description 1', quantity: 10, location: 'A1' },
      { id: '2', title: 'Item 2', subtitle: 'Description 2', quantity: 5, location: 'B2' },
    ];

    return (
      <div className="w-full space-y-2">
        {listConfig?.showSearch && (
          <div className="bg-gray-100 rounded px-2 py-1 text-xs">
            🔍 Search enabled
          </div>
        )}
        
        <div className={`space-y-1 ${isGrid ? `grid grid-cols-${Math.min(itemsPerRow, 3)} gap-1` : ''}`}>
          {sampleData.slice(0, 2).map((item, index) => (
            <div
              key={index}
              className={`
                ${cardStyle ? 'bg-white border rounded shadow-sm p-2' : 'bg-white/70 rounded p-2 border border-white/50'} 
                text-xs transition-all hover:shadow-md
              `}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                  <Image className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-gray-500 text-xs truncate">{item.subtitle}</div>
                  {!isGrid && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Hash className="w-2 h-2" />
                      <span>{item.quantity}</span>
                      <MapPin className="w-2 h-2" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-center text-gray-500">
          {listConfig?.dataSource === 'integration' 
            ? `Integration: ${listConfig.integrationId ? 'Connected' : 'Not configured'}`
            : `Static data (${sampleData.length} items)`
          }
        </div>
      </div>
    );
  };

  const renderSectionPreview = () => {
    switch (section.type) {
      case 'form':
        return (
          <div className="w-full space-y-2">
            {section.fields?.slice(0, 2).map((field, index) => (
              <div key={index} className="bg-white/70 rounded p-2 text-xs border border-white/50">
                <div className="font-medium">{field.label}</div>
                <div className="text-gray-500">({field.type})</div>
              </div>
            ))}
            {(section.fields?.length || 0) > 2 && (
              <div className="text-xs text-gray-500 text-center bg-white/50 rounded p-1">
                +{(section.fields?.length || 0) - 2} more fields
              </div>
            )}
            {(!section.fields || section.fields.length === 0) && (
              <div className="text-xs text-gray-500 text-center py-4">
                No fields added yet
              </div>
            )}
          </div>
        );
      
      case 'list':
        return renderListPreview();
      
      case 'confirmation':
        return (
          <div className="bg-white/70 rounded p-3 border border-white/50 text-center">
            <div className="text-xs font-medium mb-2">Confirmation Dialog</div>
            <div className="text-xs text-gray-600 mb-2">
              {section.config?.confirmationText || 'Are you sure?'}
            </div>
            <div className="flex gap-1 justify-center">
              <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Cancel</div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Confirm</div>
            </div>
            {section.config?.trigger && (
              <div className="mt-2 text-xs text-blue-600">
                Triggers: {section.config.trigger.type}
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="bg-white/70 rounded p-3 border border-white/50 text-xs text-gray-600 text-center">
            {section.content || `${section.type} content will be displayed here`}
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute' as const,
        left: `${section.layout?.x || 0}%`,
        top: `${section.layout?.y || 0}px`,
        width: `${section.layout?.width || 100}%`,
        height: section.layout?.height ? `${section.layout.height}px` : 'auto',
        zIndex: section.layout?.zIndex || 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isCurrentlyDragging ? 0.7 : 1,
      }}
      className={`group transition-all duration-200 ${isDragging ? 'scale-105' : ''}`}
      onClick={onSelect}
    >
      <Card 
        className={`
          ${colorClass} 
          ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 shadow-lg' : 'shadow-sm hover:shadow-md'} 
          transition-all duration-200 cursor-pointer relative border-2
        `}
        style={getSectionStyles()}
      >
        <CardContent className="p-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/50 rounded transition-colors"
              >
                <GripVertical className="w-4 h-4 text-gray-500" />
              </div>
              <Icon className="w-4 h-4 text-gray-700" />
              <span className="font-semibold text-sm text-gray-800">{section.title}</span>
              <Badge variant="outline" className="text-xs bg-white/50">
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
                className="h-7 w-7 p-0 hover:bg-white/50"
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
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Section Preview */}
          <div className="min-h-[80px] flex items-center justify-center">
            {renderSectionPreview()}
          </div>

          {/* Position Info */}
          {isSelected && (
            <div className="mt-3 pt-2 border-t border-white/50 flex gap-3 text-xs text-gray-600 bg-white/30 rounded p-2">
              <span>X: {Math.round(section.layout?.x || 0)}%</span>
              <span>Y: {section.layout?.y || 0}px</span>
              <span>W: {section.layout?.width || 100}%</span>
              {section.layout?.height && <span>H: {section.layout.height}px</span>}
              <span>Z: {section.layout?.zIndex || 1}</span>
            </div>
          )}
        </CardContent>

        {/* Resize Handles */}
        {isSelected && (
          <>
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-md opacity-80 hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
            />
            <div
              className="absolute top-2 bottom-2 right-0 w-2 bg-blue-500/50 cursor-e-resize rounded-l-md opacity-0 hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            />
            <div
              className="absolute bottom-0 left-2 right-2 h-2 bg-blue-500/50 cursor-s-resize rounded-t-md opacity-0 hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResizeStart(e, 'bottom')}
            />
          </>
        )}
      </Card>
    </div>
  );
};
