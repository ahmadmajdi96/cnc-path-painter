
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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    
    // Store the initial drag offset
    const activeSection = app.sections.find(section => section.id === event.active.id);
    if (activeSection && event.activatorEvent) {
      const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect();
      if (canvasRect && 'clientX' in event.activatorEvent && 'clientY' in event.activatorEvent) {
        const currentX = (activeSection.layout?.x || 0) / 100 * canvasRect.width;
        const currentY = activeSection.layout?.y || 0;
        
        setDragOffset({
          x: event.activatorEvent.clientX - canvasRect.left - currentX,
          y: event.activatorEvent.clientY - canvasRect.top - currentY,
        });
      }
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (!activeId) return;
    
    const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect();
    if (!canvasRect) return;

    // Calculate new position based on mouse position
    const mouseX = event.activatorEvent?.clientX || 0;
    const mouseY = event.activatorEvent?.clientY || 0;
    
    const newX = Math.max(0, Math.min(100, ((mouseX - canvasRect.left - dragOffset.x) / canvasRect.width) * 100));
    const newY = Math.max(0, mouseY - canvasRect.top - dragOffset.y);

    // Update section position in real-time
    const updatedSections = app.sections.map(section =>
      section.id === activeId
        ? {
            ...section,
            layout: {
              ...section.layout!,
              x: newX,
              y: newY,
            },
          }
        : section
    );

    onAppUpdate({ ...app, sections: updatedSections });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleAddSection = (type: AppSection['type']) => {
    const newSection: AppSection = {
      id: Date.now().toString(),
      type,
      title: `New ${type} section`,
      fields: type === 'form' ? [] : undefined,
      config: {
        columns: 1,
        showBorder: true,
        backgroundColor: '#ffffff',
        textAlign: 'left',
      },
      layout: {
        width: type === 'form' ? 60 : 40,
        x: Math.random() * 50, // Random initial position
        y: Math.random() * 200 + 50,
        zIndex: Math.max(...app.sections.map(s => s.layout?.zIndex || 1), 0) + 1,
        height: type === 'form' ? 300 : 150,
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
    <div className="flex h-full">
      {/* Left Sidebar - Toolbox */}
      <div className="w-80 border-r bg-gray-50 p-4">
        <SectionToolbox onAddSection={handleAddSection} />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-white">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
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
              <div className="canvas-container relative min-h-[800px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                {app.sections.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-lg font-medium mb-2">Start Building Your App</div>
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
                <div className="bg-white border rounded-lg p-4 shadow-lg opacity-90 pointer-events-none">
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
        <div className="w-80 border-l bg-gray-50">
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
