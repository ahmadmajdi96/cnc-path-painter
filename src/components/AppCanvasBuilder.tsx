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
import { Plus, Settings, Eye } from 'lucide-react';
import { CustomApp, AppSection } from './AppBuilderControlSystem';
import { DraggableSection } from './DraggableSection';
import { SectionToolbox } from './SectionToolbox';
import { SectionPropertiesPanel } from './SectionPropertiesPanel';
import { AppCanvasPreview } from './AppCanvasPreview';

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
        ...(type === 'list' && {
          listItems: {
            integrationId: '',
            dataPath: '',
            itemTemplate: {
              image: { field: '', fallback: '/placeholder.svg' },
              title: { field: '', fallback: 'Item Title' },
              subtitle: { field: '', fallback: 'Item Description' },
              quantity: { field: '', fallback: '0' },
              location: { field: '', fallback: 'Location' }
            }
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
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Toolbox */}
      <div className="w-80 border-r bg-white shadow-sm">
        <SectionToolbox onAddSection={handleAddSection} />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
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
          <AppCanvasPreview app={{ ...app, id: 'preview', createdAt: '', updatedAt: '', url: '' }} />
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full p-8 overflow-auto">
              <div className="canvas-container relative min-h-[800px] bg-white rounded-xl border border-gray-200 shadow-sm">
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

      {/* Right Sidebar - Properties Panel */}
      {selectedSection && !showPreview && (
        <div className="w-80 border-l bg-white shadow-sm">
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
