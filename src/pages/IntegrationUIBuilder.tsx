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
  useDraggable,
} from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Eye, Settings, Layers, Grid3x3, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface UIComponent {
  id: string;
  type: 'gauge' | 'chart' | 'indicator' | 'button' | 'value' | 'toggle' | 'slider' | 'text' | 'shape' | 'input' | 'form' | 'table' | 'list' | 'card' | 'label' | 'checkbox' | 'dropdown';
  label: string;
  integrationId: string;
  variable: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    fontSize?: number;
    fontWeight?: string;
  };
  config?: {
    min?: number;
    max?: number;
    unit?: string;
    placeholder?: string;
    columns?: string[];
  };
}

interface IntegrationUI {
  id: string;
  name: string;
  description: string;
  components: UIComponent[];
  canvasConfig: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Draggable Component
interface DraggableUIComponentProps {
  component: UIComponent;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (component: UIComponent) => void;
  onDelete: (id: string) => void;
}

const DraggableUIComponent: React.FC<DraggableUIComponentProps> = ({
  component,
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
    isDragging,
  } = useDraggable({
    id: component.id,
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${component.position.x}px`,
    top: `${component.position.y}px`,
    width: `${component.size.width}px`,
    height: `${component.size.height}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isSelected ? 1000 : 1,
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = component.size.width;
    const startHeight = component.size.height;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) {
        newWidth = Math.max(50, startWidth + (e.clientX - startX));
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(30, startHeight + (e.clientY - startY));
      }

      onUpdate({
        ...component,
        size: { width: newWidth, height: newHeight },
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getComponentIcon = () => {
    const icons: Record<string, string> = {
      input: '📝',
      form: '📋',
      label: '🏷️',
      checkbox: '☑️',
      dropdown: '▼',
      button: '🔘',
      table: '📊',
      list: '📝',
      card: '🃏',
      gauge: '⏱️',
      chart: '📈',
      indicator: '🚥',
      value: '🔢',
      toggle: '🔄',
      slider: '🎚️',
      text: '📄',
      shape: '⬜',
    };
    return icons[component.type] || '📦';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
      onClick={onSelect}
    >
      <Card
        className={`h-full ${
          isSelected ? 'ring-2 ring-primary shadow-lg' : 'shadow-sm hover:shadow-md'
        } transition-all cursor-pointer`}
        style={{
          backgroundColor: component.style.backgroundColor,
          borderColor: component.style.borderColor,
          borderWidth: component.style.borderWidth || 1,
        }}
      >
        <CardContent className="p-2 h-full relative">
          <div className="flex items-center justify-between mb-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-secondary/50 rounded"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(component.id);
              }}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-[calc(100%-40px)]">
            <div className="text-2xl mb-1">{getComponentIcon()}</div>
            <div
              className="text-xs font-medium text-center mb-1 truncate w-full"
              style={{ color: component.style.textColor }}
            >
              {component.label}
            </div>
            <div className="text-xs text-muted-foreground truncate w-full text-center">
              {component.variable}
            </div>
          </div>

          {isSelected && (
            <>
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize rounded-tl-md"
                onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
              />
              <div className="absolute bottom-1 left-1 text-[10px] text-muted-foreground">
                {component.size.width}×{component.size.height}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const IntegrationUIBuilder = () => {
  const [uis, setUis] = useState<IntegrationUI[]>([]);
  const [selectedUI, setSelectedUI] = useState<IntegrationUI | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<UIComponent | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [uiFormData, setUiFormData] = useState({
    name: '',
    description: '',
    width: 1200,
    height: 800,
    backgroundColor: '#f5f5f5',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const mockIntegrations = [
    {
      id: 'int-1',
      name: 'PLC Integration',
      variables: ['temperature', 'pressure', 'speed', 'status', 'count']
    },
    {
      id: 'int-2',
      name: 'SCADA System',
      variables: ['motor_speed', 'voltage', 'current', 'alarm_state', 'production_count']
    },
    {
      id: 'int-3',
      name: 'Sensor Network',
      variables: ['humidity', 'ambient_temp', 'vibration', 'noise_level', 'air_quality']
    }
  ];

  const componentTypes = [
    { value: 'input', label: 'Input', icon: '📝', category: 'Form' },
    { value: 'form', label: 'Form', icon: '📋', category: 'Form' },
    { value: 'label', label: 'Label', icon: '🏷️', category: 'Form' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️', category: 'Form' },
    { value: 'dropdown', label: 'Dropdown', icon: '▼', category: 'Form' },
    { value: 'button', label: 'Button', icon: '🔘', category: 'Form' },
    { value: 'table', label: 'Table', icon: '📊', category: 'Data' },
    { value: 'list', label: 'List', icon: '📝', category: 'Data' },
    { value: 'card', label: 'Card', icon: '🃏', category: 'Data' },
    { value: 'gauge', label: 'Gauge', icon: '⏱️', category: 'Visualization' },
    { value: 'chart', label: 'Chart', icon: '📈', category: 'Visualization' },
    { value: 'indicator', label: 'Indicator', icon: '🚥', category: 'Visualization' },
    { value: 'value', label: 'Value', icon: '🔢', category: 'Visualization' },
    { value: 'toggle', label: 'Toggle', icon: '🔄', category: 'Control' },
    { value: 'slider', label: 'Slider', icon: '🎚️', category: 'Control' },
    { value: 'text', label: 'Text', icon: '📄', category: 'Basic' },
    { value: 'shape', label: 'Shape', icon: '⬜', category: 'Basic' },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!activeId || !event.delta || !selectedUI) {
      setActiveId(null);
      return;
    }

    const updatedComponents = selectedUI.components.map(component => {
      if (component.id === activeId) {
        const newX = Math.max(0, Math.min(
          selectedUI.canvasConfig.width - component.size.width,
          component.position.x + event.delta.x
        ));
        const newY = Math.max(0, Math.min(
          selectedUI.canvasConfig.height - component.size.height,
          component.position.y + event.delta.y
        ));
        
        return {
          ...component,
          position: {
            x: newX,
            y: newY,
          },
        };
      }
      return component;
    });

    const updatedUI = { ...selectedUI, components: updatedComponents, updatedAt: new Date().toISOString() };
    setSelectedUI(updatedUI);
    setUis(uis.map(ui => ui.id === updatedUI.id ? updatedUI : ui));
    setActiveId(null);
  };

  const handleCreateUI = () => {
    if (!uiFormData.name) {
      toast.error('Please enter a UI name');
      return;
    }

    const newUI: IntegrationUI = {
      id: Date.now().toString(),
      name: uiFormData.name,
      description: uiFormData.description,
      components: [],
      canvasConfig: {
        width: uiFormData.width,
        height: uiFormData.height,
        backgroundColor: uiFormData.backgroundColor,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUis([...uis, newUI]);
    setSelectedUI(newUI);
    setIsCreateDialogOpen(false);
    toast.success('UI created successfully');

    setUiFormData({
      name: '',
      description: '',
      width: 1200,
      height: 800,
      backgroundColor: '#f5f5f5',
    });
  };

  const handleDeleteUI = (id: string) => {
    setUis(uis.filter(ui => ui.id !== id));
    if (selectedUI?.id === id) {
      setSelectedUI(null);
    }
    toast.success('UI deleted');
  };

  const handleAddComponent = (type: UIComponent['type']) => {
    if (!selectedUI) {
      toast.error('Please select a UI first');
      return;
    }

    const sizeMap: Record<string, { width: number; height: number }> = {
      input: { width: 250, height: 40 },
      form: { width: 400, height: 300 },
      label: { width: 150, height: 30 },
      checkbox: { width: 150, height: 30 },
      dropdown: { width: 200, height: 40 },
      button: { width: 120, height: 40 },
      table: { width: 600, height: 300 },
      list: { width: 400, height: 400 },
      card: { width: 300, height: 200 },
      gauge: { width: 200, height: 200 },
      chart: { width: 400, height: 300 },
      indicator: { width: 100, height: 100 },
      value: { width: 150, height: 80 },
      toggle: { width: 100, height: 40 },
      slider: { width: 250, height: 40 },
      text: { width: 200, height: 50 },
      shape: { width: 150, height: 150 },
    };

    const newComponent: UIComponent = {
      id: Date.now().toString(),
      type,
      label: `${type} ${selectedUI.components.length + 1}`,
      integrationId: mockIntegrations[0].id,
      variable: mockIntegrations[0].variables[0],
      position: { x: 50, y: 50 },
      size: sizeMap[type] || { width: 200, height: 150 },
      style: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        fontSize: 14,
        fontWeight: 'normal',
      },
      config: {
        placeholder: `Enter ${type}...`,
      },
    };

    const updatedUI = {
      ...selectedUI,
      components: [...selectedUI.components, newComponent],
      updatedAt: new Date().toISOString(),
    };

    setSelectedUI(updatedUI);
    setUis(uis.map(ui => ui.id === updatedUI.id ? updatedUI : ui));
    toast.success(`${type} component added`);
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<UIComponent>) => {
    if (!selectedUI) return;

    const updatedComponents = selectedUI.components.map(c =>
      c.id === componentId ? { ...c, ...updates } : c
    );

    const updatedUI = {
      ...selectedUI,
      components: updatedComponents,
      updatedAt: new Date().toISOString(),
    };

    setSelectedUI(updatedUI);
    setUis(uis.map(ui => ui.id === updatedUI.id ? updatedUI : ui));
    
    if (selectedComponent?.id === componentId) {
      setSelectedComponent({ ...selectedComponent, ...updates });
    }
  };

  const handleDeleteComponent = (componentId: string) => {
    if (!selectedUI) return;

    const updatedUI = {
      ...selectedUI,
      components: selectedUI.components.filter(c => c.id !== componentId),
      updatedAt: new Date().toISOString(),
    };

    setSelectedUI(updatedUI);
    setUis(uis.map(ui => ui.id === updatedUI.id ? updatedUI : ui));
    setSelectedComponent(null);
    toast.success('Component deleted');
  };

  const activeComponent = selectedUI?.components.find(c => c.id === activeId);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5" />
            My UIs
          </h2>
        </div>
        <ScrollArea className="h-[calc(100vh-180px)] p-4">
          {uis.length === 0 ? (
            <p className="text-sm text-muted-foreground">No UIs created yet</p>
          ) : (
            <div className="space-y-2">
              {uis.map(ui => (
                <Card
                  key={ui.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedUI?.id === ui.id ? 'border-primary bg-accent' : ''
                  }`}
                  onClick={() => setSelectedUI(ui)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{ui.name}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUI(ui.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ui.components.length} component{ui.components.length !== 1 ? 's' : ''}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {ui.canvasConfig.width}×{ui.canvasConfig.height}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New UI
          </Button>
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 relative">
        {selectedUI ? (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full overflow-auto p-6 bg-secondary/20">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{selectedUI.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedUI.components.length} components
                  </p>
                </div>
              </div>
              
              <div
                className="canvas-container relative border-2 border-border shadow-lg overflow-hidden"
                style={{
                  width: `${selectedUI.canvasConfig.width}px`,
                  height: `${selectedUI.canvasConfig.height}px`,
                  backgroundColor: selectedUI.canvasConfig.backgroundColor,
                }}
              >
                {selectedUI.components.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Grid3x3 className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-medium mb-2">Start Building</p>
                      <p className="text-sm">Add components from the toolbox</p>
                    </div>
                  </div>
                ) : (
                  selectedUI.components.map((component) => (
                    <DraggableUIComponent
                      key={component.id}
                      component={component}
                      isSelected={selectedComponent?.id === component.id}
                      onSelect={() => setSelectedComponent(component)}
                      onUpdate={(updated) => handleUpdateComponent(updated.id, updated)}
                      onDelete={handleDeleteComponent}
                    />
                  ))
                )}
              </div>
            </div>

            <DragOverlay>
              {activeComponent && (
                <div className="bg-card border rounded p-4 shadow-xl opacity-90">
                  <div className="font-medium">{activeComponent.label}</div>
                  <div className="text-sm text-muted-foreground">{activeComponent.type}</div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Grid3x3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No UI Selected</h3>
              <p className="text-muted-foreground mb-4">Select or create a UI to start building</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create UI
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l bg-card">
        <Tabs defaultValue="components" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="properties" disabled={!selectedComponent}>
              Properties
            </TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="p-4">
            <ScrollArea className="h-[calc(100vh-120px)]">
              {['Form', 'Data', 'Visualization', 'Control', 'Basic'].map(category => {
                const categoryTypes = componentTypes.filter(t => t.category === category);
                return (
                  <div key={category} className="mb-6">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryTypes.map(type => (
                        <Button
                          key={type.value}
                          variant="outline"
                          className="h-auto flex-col py-3"
                          onClick={() => handleAddComponent(type.value as UIComponent['type'])}
                          disabled={!selectedUI}
                        >
                          <span className="text-2xl mb-1">{type.icon}</span>
                          <span className="text-xs">{type.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="properties" className="p-4">
            {selectedComponent && (
              <ScrollArea className="h-[calc(100vh-120px)]">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Properties
                    </h3>
                  </div>

                  <div>
                    <Label>Label</Label>
                    <Input
                      value={selectedComponent.label}
                      onChange={(e) =>
                        handleUpdateComponent(selectedComponent.id, { label: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Integration</Label>
                    <Select
                      value={selectedComponent.integrationId}
                      onValueChange={(value) => {
                        const integration = mockIntegrations.find(i => i.id === value);
                        handleUpdateComponent(selectedComponent.id, {
                          integrationId: value,
                          variable: integration?.variables[0] || '',
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockIntegrations.map(int => (
                          <SelectItem key={int.id} value={int.id}>
                            {int.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Variable</Label>
                    <Select
                      value={selectedComponent.variable}
                      onValueChange={(value) =>
                        handleUpdateComponent(selectedComponent.id, { variable: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockIntegrations
                          .find(i => i.id === selectedComponent.integrationId)
                          ?.variables.map(variable => (
                            <SelectItem key={variable} value={variable}>
                              {variable}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedComponent.style.backgroundColor}
                        onChange={(e) =>
                          handleUpdateComponent(selectedComponent.id, {
                            style: { ...selectedComponent.style, backgroundColor: e.target.value },
                          })
                        }
                        className="w-16"
                      />
                      <Input
                        value={selectedComponent.style.backgroundColor}
                        onChange={(e) =>
                          handleUpdateComponent(selectedComponent.id, {
                            style: { ...selectedComponent.style, backgroundColor: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedComponent.style.textColor}
                        onChange={(e) =>
                          handleUpdateComponent(selectedComponent.id, {
                            style: { ...selectedComponent.style, textColor: e.target.value },
                          })
                        }
                        className="w-16"
                      />
                      <Input
                        value={selectedComponent.style.textColor}
                        onChange={(e) =>
                          handleUpdateComponent(selectedComponent.id, {
                            style: { ...selectedComponent.style, textColor: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedComponent.style.borderColor}
                        onChange={(e) =>
                          handleUpdateComponent(selectedComponent.id, {
                            style: { ...selectedComponent.style, borderColor: e.target.value },
                          })
                        }
                        className="w-16"
                      />
                      <Input
                        value={selectedComponent.style.borderColor}
                        onChange={(e) =>
                          handleUpdateComponent(selectedComponent.id, {
                            style: { ...selectedComponent.style, borderColor: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Font Size</Label>
                    <Input
                      type="number"
                      value={selectedComponent.style.fontSize}
                      onChange={(e) =>
                        handleUpdateComponent(selectedComponent.id, {
                          style: { ...selectedComponent.style, fontSize: parseInt(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create UI Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New UI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>UI Name</Label>
              <Input
                value={uiFormData.name}
                onChange={(e) => setUiFormData({ ...uiFormData, name: e.target.value })}
                placeholder="Control Panel"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={uiFormData.description}
                onChange={(e) => setUiFormData({ ...uiFormData, description: e.target.value })}
                placeholder="Description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Width (px)</Label>
                <Input
                  type="number"
                  value={uiFormData.width}
                  onChange={(e) => setUiFormData({ ...uiFormData, width: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Height (px)</Label>
                <Input
                  type="number"
                  value={uiFormData.height}
                  onChange={(e) => setUiFormData({ ...uiFormData, height: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={uiFormData.backgroundColor}
                  onChange={(e) => setUiFormData({ ...uiFormData, backgroundColor: e.target.value })}
                  className="w-16"
                />
                <Input
                  value={uiFormData.backgroundColor}
                  onChange={(e) => setUiFormData({ ...uiFormData, backgroundColor: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUI}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationUIBuilder;
