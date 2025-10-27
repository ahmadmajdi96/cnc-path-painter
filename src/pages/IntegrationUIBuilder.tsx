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

interface DataBinding {
  integrationId: string;
  variable: string;
}

interface UIComponent {
  id: string;
  type: 'gauge' | 'chart' | 'indicator' | 'button' | 'value' | 'toggle' | 'slider' | 'text' | 'shape' | 'input' | 'form' | 'table' | 'list' | 'card' | 'label' | 'checkbox' | 'dropdown';
  label: string;
  dataBindings: DataBinding[]; // Support multiple integrations/variables
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: string;
    boxShadow?: string;
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

  const renderRealisticComponent = () => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: component.style.backgroundColor,
      color: component.style.textColor,
      borderColor: component.style.borderColor,
      borderWidth: component.style.borderWidth || 1,
      borderStyle: 'solid',
      borderRadius: component.style.borderRadius || 8,
      fontSize: component.style.fontSize || 14,
      fontWeight: component.style.fontWeight || 'normal',
      boxShadow: component.style.boxShadow || '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      overflow: 'hidden',
    };

    switch (component.type) {
      case 'input':
        return (
          <div style={{ ...baseStyle, justifyContent: 'flex-start', padding: '8px 12px', background: '#ffffff', border: '2px solid #e5e7eb' }}>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>{component.config?.placeholder || component.label}</span>
          </div>
        );
      
      case 'button':
        return (
          <div style={{ ...baseStyle, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)' }}>
            {component.label}
          </div>
        );
      
      case 'gauge':
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', background: '#ffffff' }}>
            <div style={{ width: '80%', height: '80%', border: '8px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopColor: '#667eea', transform: 'rotate(-90deg)' }}>
              <span style={{ transform: 'rotate(90deg)', fontWeight: 'bold', fontSize: '20px' }}>75%</span>
            </div>
          </div>
        );
      
      case 'chart':
        return (
          <div style={{ ...baseStyle, background: '#ffffff', flexDirection: 'column', alignItems: 'stretch', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>{component.label}</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
              {[40, 65, 45, 80, 55, 70].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(180deg, #667eea, #764ba2)', borderRadius: '4px 4px 0 0' }} />
              ))}
            </div>
          </div>
        );
      
      case 'value':
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>42.5</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>{component.config?.unit || component.label}</div>
          </div>
        );
      
      case 'indicator':
        return (
          <div style={{ ...baseStyle, background: '#ffffff' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #22c55e)', boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)' }} />
          </div>
        );
      
      case 'table':
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', alignItems: 'stretch', padding: '0', background: '#ffffff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              {['Column 1', 'Column 2', 'Column 3'].map((col, i) => (
                <div key={i} style={{ padding: '12px', fontSize: '12px', fontWeight: '600' }}>{col}</div>
              ))}
            </div>
            {[1, 2, 3].map((row) => (
              <div key={row} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
                {[1, 2, 3].map((col) => (
                  <div key={col} style={{ padding: '12px', fontSize: '12px' }}>Data {row}.{col}</div>
                ))}
              </div>
            ))}
          </div>
        );
      
      case 'toggle':
        return (
          <div style={{ ...baseStyle, justifyContent: 'space-between', padding: '12px 16px', background: '#ffffff' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{component.label}</span>
            <div style={{ width: '44px', height: '24px', background: '#667eea', borderRadius: '12px', position: 'relative' }}>
              <div style={{ position: 'absolute', right: '2px', top: '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        );
      
      case 'slider':
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', gap: '8px', background: '#ffffff', padding: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>{component.label}</span>
            <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', position: 'relative' }}>
              <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '3px' }} />
              <div style={{ position: 'absolute', right: '40%', top: '-5px', width: '16px', height: '16px', background: '#667eea', borderRadius: '50%', boxShadow: '0 2px 6px rgba(102, 126, 234, 0.4)' }} />
            </div>
          </div>
        );
      
      case 'card':
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '8px', background: '#ffffff', padding: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{component.label}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
              Card content with dynamic data from {component.dataBindings.length} source(s)
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div style={{ ...baseStyle, flexDirection: 'column', alignItems: 'stretch', gap: '8px', padding: '12px', background: '#ffffff' }}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} style={{ padding: '12px', background: '#f9fafb', borderRadius: '6px', fontSize: '13px', borderLeft: '3px solid #667eea' }}>
                List Item {item}
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div style={baseStyle}>
            <span>{component.label}</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
      onClick={onSelect}
    >
      <div
        className={`h-full ${
          isSelected ? 'ring-2 ring-primary shadow-xl' : 'shadow-md hover:shadow-lg'
        } transition-all cursor-pointer rounded-lg overflow-hidden`}
      >
        <div className="h-full relative">
          <div className="absolute top-1 left-1 right-1 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 bg-background/90 backdrop-blur-sm hover:bg-background rounded shadow-sm"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(component.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          
          {renderRealisticComponent()}

          {isSelected && (
            <>
              <div
                className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize rounded-tl-lg z-10"
                onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
              />
              <div className="absolute bottom-1 left-1 text-[10px] bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-muted-foreground">
                {component.size.width}×{component.size.height}
              </div>
              {component.dataBindings.length > 0 && (
                <div className="absolute top-1 right-1 z-0">
                  <Badge variant="secondary" className="text-[10px] py-0">
                    {component.dataBindings.length} binding{component.dataBindings.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </>
          )}
        </div>
      </div>
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
      dataBindings: [{
        integrationId: mockIntegrations[0].id,
        variable: mockIntegrations[0].variables[0],
      }],
      position: { x: 50, y: 50 },
      size: sizeMap[type] || { width: 200, height: 150 },
      style: {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 'normal',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                    <div className="flex items-center justify-between mb-2">
                      <Label>Data Bindings</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newBinding: DataBinding = {
                            integrationId: mockIntegrations[0].id,
                            variable: mockIntegrations[0].variables[0],
                          };
                          handleUpdateComponent(selectedComponent.id, {
                            dataBindings: [...selectedComponent.dataBindings, newBinding],
                          });
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Binding
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-48 border rounded-md p-2">
                      {selectedComponent.dataBindings.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No data bindings yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedComponent.dataBindings.map((binding, index) => (
                            <Card key={index} className="p-3">
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant="outline" className="text-xs">
                                  Binding {index + 1}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    const newBindings = selectedComponent.dataBindings.filter((_, i) => i !== index);
                                    handleUpdateComponent(selectedComponent.id, {
                                      dataBindings: newBindings,
                                    });
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs">Integration</Label>
                                  <Select
                                    value={binding.integrationId}
                                    onValueChange={(value) => {
                                      const integration = mockIntegrations.find(i => i.id === value);
                                      const newBindings = [...selectedComponent.dataBindings];
                                      newBindings[index] = {
                                        integrationId: value,
                                        variable: integration?.variables[0] || '',
                                      };
                                      handleUpdateComponent(selectedComponent.id, {
                                        dataBindings: newBindings,
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="h-8">
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
                                  <Label className="text-xs">Variable</Label>
                                  <Select
                                    value={binding.variable}
                                    onValueChange={(value) => {
                                      const newBindings = [...selectedComponent.dataBindings];
                                      newBindings[index] = {
                                        ...newBindings[index],
                                        variable: value,
                                      };
                                      handleUpdateComponent(selectedComponent.id, {
                                        dataBindings: newBindings,
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockIntegrations
                                        .find(i => i.id === binding.integrationId)
                                        ?.variables.map(variable => (
                                          <SelectItem key={variable} value={variable}>
                                            {variable}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
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
                    <Label>Border Radius</Label>
                    <Input
                      type="number"
                      value={selectedComponent.style.borderRadius}
                      onChange={(e) =>
                        handleUpdateComponent(selectedComponent.id, {
                          style: { ...selectedComponent.style, borderRadius: parseInt(e.target.value) },
                        })
                      }
                    />
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

                  <div>
                    <Label>Shadow</Label>
                    <Select
                      value={selectedComponent.style.boxShadow}
                      onValueChange={(value) =>
                        handleUpdateComponent(selectedComponent.id, {
                          style: { ...selectedComponent.style, boxShadow: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="0 1px 2px rgba(0,0,0,0.05)">Small</SelectItem>
                        <SelectItem value="0 2px 8px rgba(0,0,0,0.1)">Medium</SelectItem>
                        <SelectItem value="0 4px 12px rgba(0,0,0,0.15)">Large</SelectItem>
                        <SelectItem value="0 8px 24px rgba(0,0,0,0.2)">XL</SelectItem>
                      </SelectContent>
                    </Select>
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
