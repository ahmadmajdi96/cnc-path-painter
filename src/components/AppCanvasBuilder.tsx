
import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
} from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Eye, Palette } from 'lucide-react';
import { CustomApp, AppSection } from './AppBuilderControlSystem';
import { DraggableSection } from './DraggableSection';
import { SectionToolbox } from './SectionToolbox';
import { SectionPropertiesPanel } from './SectionPropertiesPanel';
import { AppCanvasPreview } from './AppCanvasPreview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AppCanvasBuilderProps {
  app: Omit<CustomApp, 'id' | 'createdAt' | 'updatedAt' | 'url'>;
  onAppUpdate: (app: Omit<CustomApp, 'id' | 'createdAt' | 'updatedAt' | 'url'>) => void;
}

export const AppCanvasBuilder: React.FC<AppCanvasBuilderProps> = ({
  app,
  onAppUpdate,
}) => {
  const [selectedSection, setSelectedSection] = useState<AppSection | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasSettings, setCanvasSettings] = useState({
    backgroundColor: app.canvasSettings?.backgroundColor || '#ffffff',
    borderRadius: app.canvasSettings?.borderRadius || 12,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setIsDragging(true);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (!activeId || !event.delta) return;
    
    const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect();
    if (!canvasRect) return;

    // Calculate new position based on delta movement
    const deltaX = (event.delta.x / canvasRect.width) * 100;
    const deltaY = event.delta.y;

    // Update section position in real-time
    const updatedSections = app.sections.map(section => {
      if (section.id === activeId) {
        const currentX = section.layout?.x || 0;
        const currentY = section.layout?.y || 0;
        
        const newX = Math.max(0, Math.min(100 - (section.layout?.width || 100), currentX + deltaX));
        const newY = Math.max(0, currentY + deltaY);

        return {
          ...section,
          layout: {
            ...section.layout!,
            x: newX,
            y: newY,
          },
        };
      }
      return section;
    });

    onAppUpdate({ ...app, sections: updatedSections });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setIsDragging(false);
  };

  const handleCanvasSettingsUpdate = (field: string, value: any) => {
    const newSettings = { ...canvasSettings, [field]: value };
    setCanvasSettings(newSettings);
    onAppUpdate({
      ...app,
      canvasSettings: newSettings,
    });
  };

  const handleAddSection = (type: AppSection['type']) => {
    const newSection: AppSection = {
      id: Date.now().toString(),
      type,
      title: `New ${type} section`,
      fields: type === 'form' ? [] : undefined,
      content: type === 'list' ? '' : type === 'text' ? 'Add your text content here...' : undefined,
      config: {
        columns: 1,
        showBorder: true,
        backgroundColor: '#ffffff',
        textAlign: 'left',
        dataSource: 'static',
        ...(type === 'form' && {
          showConfirmation: true,
          confirmationMessage: 'Are you sure you want to submit this form?',
          showClearButton: true,
          submitButtonStyle: {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500'
          },
          clearButtonStyle: {
            backgroundColor: '#6b7280',
            color: '#ffffff',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500'
          }
        }),
        ...(type === 'list' && {
          listItems: {
            integrationId: '',
            dataPath: '',
            dataSource: 'static',
            staticData: [],
            itemTemplate: {
              image: { field: '', fallback: '/placeholder.svg' },
              title: { field: '', fallback: 'Item Title' },
              subtitle: { field: '', fallback: 'Item Description' },
              quantity: { field: '', fallback: '0' },
              location: { field: '', fallback: 'Location' }
            },
            viewType: 'list',
            cardStyle: true,
            showSearch: true,
            showFilter: true
          }
        }),
        ...(type === 'confirmation' && {
          trigger: {
            type: 'form_submit',
            targetId: '',
            action: 'submit'
          },
          confirmationText: 'Are you sure you want to proceed?',
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel'
        })
      },
      layout: {
        width: type === 'form' ? 60 : type === 'list' ? 80 : 40,
        x: Math.random() * 40,
        y: Math.random() * 100 + 50,
        zIndex: Math.max(...app.sections.map(s => s.layout?.zIndex || 1), 0) + 1,
        height: type === 'form' ? 300 : type === 'list' ? 400 : 150,
      },
    };

    onAppUpdate({
      ...app,
      sections: [...app.sections, newSection],
    });
  };

  const handleUpdateSection = (updatedSection: AppSection) => {
    const newSections = app.sections.map(section =>
      section.id === updatedSection.id ? updatedSection : section
    );
    onAppUpdate({ ...app, sections: newSections });
    setSelectedSection(updatedSection);
  };

  const handleDeleteSection = (sectionId: string) => {
    const newSections = app.sections.filter(section => section.id !== sectionId);
    onAppUpdate({ ...app, sections: newSections });
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
  };

  const activeSection = app.sections.find(section => section.id === activeId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Fixed width */}
      <div className="w-80 border-r bg-white shadow-sm flex-shrink-0">
        <div className="p-4">
          <SectionToolbox onAddSection={handleAddSection} />
        </div>
      </div>

      {/* Main Canvas Area - Flexible width that stretches */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100 min-w-0 overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <Palette className="w-4 h-4" />
                Canvas Style
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Canvas Settings</h4>
                
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={canvasSettings.backgroundColor}
                      onChange={(e) => handleCanvasSettingsUpdate('backgroundColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={canvasSettings.backgroundColor}
                      onChange={(e) => handleCanvasSettingsUpdate('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Border Radius (px)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={canvasSettings.borderRadius}
                    onChange={(e) => handleCanvasSettingsUpdate('borderRadius', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Edit Mode' : 'Preview'}
          </Button>
        </div>

        {showPreview ? (
          <div className="w-full h-full p-4">
            <AppCanvasPreview app={{ ...app, id: 'preview', createdAt: '', updatedAt: '', url: '' }} />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full w-full p-6 overflow-auto">
              <div 
                className="canvas-container relative min-h-[900px] w-full border border-gray-200 shadow-sm"
                style={{
                  backgroundColor: canvasSettings.backgroundColor,
                  borderRadius: `${canvasSettings.borderRadius}px`,
                }}
              >
                {app.sections.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-xl font-medium mb-2">Start Building Your App</div>
                      <div className="text-sm">Drag sections from the toolbox to begin</div>
                    </div>
                  </div>
                ) : (
                  <>
                    {app.sections.map((section) => (
                      <DraggableSection
                        key={section.id}
                        section={section}
                        isSelected={selectedSection?.id === section.id}
                        onSelect={() => setSelectedSection(section)}
                        onUpdate={handleUpdateSection}
                        onDelete={handleDeleteSection}
                        isDragging={activeId === section.id}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>

            <DragOverlay>
              {activeSection && (
                <div className="bg-white border rounded-lg p-4 shadow-xl opacity-90 pointer-events-none transform rotate-3">
                  <div className="font-medium">{activeSection.title}</div>
                  <div className="text-sm text-gray-500">{activeSection.type.toUpperCase()}</div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Right Sidebar - Fixed width when visible */}
      {selectedSection && !showPreview && (
        <div className="w-80 border-l bg-white shadow-sm flex-shrink-0">
          <SectionPropertiesPanel
            section={selectedSection}
            onUpdate={handleUpdateSection}
            onClose={() => setSelectedSection(null)}
          />
        </div>
      )}
    </div>
  );
};
