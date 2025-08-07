
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
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = app.sections.findIndex((section) => section.id === active.id);
      const newIndex = app.sections.findIndex((section) => section.id === over?.id);

      const newSections = arrayMove(app.sections, oldIndex, newIndex);
      onAppUpdate({ ...app, sections: newSections });
    }

    setActiveId(null);
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
        width: 100,
        x: 0,
        y: app.sections.length * 200,
        zIndex: 1,
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
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full p-8 overflow-auto">
              <div className="relative min-h-[800px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                {app.sections.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-lg font-medium mb-2">Start Building Your App</div>
                      <div className="text-sm">Drag sections from the toolbox to begin</div>
                    </div>
                  </div>
                ) : (
                  <SortableContext items={app.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {app.sections.map((section) => (
                      <DraggableSection
                        key={section.id}
                        section={section}
                        isSelected={selectedSection?.id === section.id}
                        onSelect={() => setSelectedSection(section)}
                        onUpdate={handleUpdateSection}
                        onDelete={handleDeleteSection}
                      />
                    ))}
                  </SortableContext>
                )}
              </div>
            </div>

            <DragOverlay>
              {activeSection && (
                <div className="bg-white border rounded-lg p-4 shadow-lg opacity-90">
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
