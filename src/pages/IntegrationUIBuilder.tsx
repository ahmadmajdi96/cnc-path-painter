import React, { useState, useEffect, useRef } from 'react';
import { Canvas as FabricCanvas, Rect, Circle, Text as FabricText, FabricObject } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Save, Trash2, Eye, Settings, Layers, Grid3x3 } from 'lucide-react';
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
    opacity?: number;
    rotation?: number;
  };
  config?: {
    min?: number;
    max?: number;
    unit?: string;
    decimals?: number;
    shape?: 'rectangle' | 'circle';
    placeholder?: string;
    rows?: number;
    columns?: string[];
    items?: string[];
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
    gridSize: number;
    showGrid: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const IntegrationUIBuilder = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [uis, setUis] = useState<IntegrationUI[]>([]);
  const [selectedUI, setSelectedUI] = useState<IntegrationUI | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<UIComponent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [uiFormData, setUiFormData] = useState({
    name: '',
    description: '',
    width: 1200,
    height: 800,
    backgroundColor: '#1e1e1e',
    showGrid: true,
    gridSize: 20
  });

  // Mock integrations with variables
  const [mockIntegrations] = useState([
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
  ]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    if (fabricCanvas) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#1e1e1e',
      selection: true,
    });

    canvas.on('selection:created', (e: any) => {
      const selected = e.selected?.[0];
      if (selected && (selected as any).data) {
        setSelectedComponent((selected as any).data as UIComponent);
      }
    });

    canvas.on('selection:updated', (e: any) => {
      const selected = e.selected?.[0];
      if (selected && (selected as any).data) {
        setSelectedComponent((selected as any).data as UIComponent);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedComponent(null);
    });

    canvas.on('object:modified', (e: any) => {
      const obj = e.target;
      if (obj && (obj as any).data && selectedUI) {
        const component = (obj as any).data as UIComponent;
        handleUpdateComponent(component.id, {
          position: { x: obj.left || 0, y: obj.top || 0 },
          size: { 
            width: obj.width ? obj.width * (obj.scaleX || 1) : component.size.width, 
            height: obj.height ? obj.height * (obj.scaleY || 1) : component.size.height 
          }
        });
      }
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update canvas when UI is selected
  useEffect(() => {
    if (!fabricCanvas || !selectedUI) return;

    fabricCanvas.clear();
    fabricCanvas.setWidth(selectedUI.canvasConfig.width);
    fabricCanvas.setHeight(selectedUI.canvasConfig.height);
    fabricCanvas.backgroundColor = selectedUI.canvasConfig.backgroundColor;
    fabricCanvas.renderAll();

    // Render components
    selectedUI.components.forEach(component => {
      renderComponent(fabricCanvas, component);
    });

    fabricCanvas.renderAll();
  }, [selectedUI, fabricCanvas]);

  const renderComponent = (canvas: FabricCanvas, component: UIComponent) => {
    let obj: any;
    let labelText = '';

    switch (component.type) {
      case 'input':
        // Input field representation
        obj = new Rect({
          left: component.position.x,
          top: component.position.y,
          width: component.size.width,
          height: component.size.height,
          fill: '#ffffff',
          stroke: component.style.borderColor || '#cbd5e1',
          strokeWidth: component.style.borderWidth || 1,
          rx: 4,
          ry: 4,
        });
        labelText = component.config?.placeholder || component.label;
        break;

      case 'form':
        // Form container
        obj = new Rect({
          left: component.position.x,
          top: component.position.y,
          width: component.size.width,
          height: component.size.height,
          fill: component.style.backgroundColor || '#f8fafc',
          stroke: component.style.borderColor || '#e2e8f0',
          strokeWidth: component.style.borderWidth || 2,
          rx: 8,
          ry: 8,
        });
        labelText = `📋 ${component.label}`;
        break;

      case 'table':
        // Data table representation
        obj = new Rect({
          left: component.position.x,
          top: component.position.y,
          width: component.size.width,
          height: component.size.height,
          fill: '#ffffff',
          stroke: component.style.borderColor || '#e2e8f0',
          strokeWidth: component.style.borderWidth || 1,
        });
        labelText = `📊 ${component.label}\n${component.variable}`;
        break;

      case 'list':
        // List representation
        obj = new Rect({
          left: component.position.x,
          top: component.position.y,
          width: component.size.width,
          height: component.size.height,
          fill: '#ffffff',
          stroke: component.style.borderColor || '#e2e8f0',
          strokeWidth: component.style.borderWidth || 1,
          rx: 4,
          ry: 4,
        });
        labelText = `📝 ${component.label}\n${component.variable}`;
        break;

      case 'card':
        // Card component
        obj = new Rect({
          left: component.position.x,
          top: component.position.y,
          width: component.size.width,
          height: component.size.height,
          fill: component.style.backgroundColor || '#ffffff',
          stroke: component.style.borderColor || '#e2e8f0',
          strokeWidth: component.style.borderWidth || 1,
          rx: 8,
          ry: 8,
        });
        labelText = component.label;
        break;

      case 'label':
        // Text label
        obj = new FabricText(component.label, {
          left: component.position.x,
          top: component.position.y,
          fontSize: component.style.fontSize || 14,
          fill: component.style.textColor || '#1e293b',
          fontWeight: component.style.fontWeight || 'bold',
        });
        break;

      case 'checkbox':
        // Checkbox representation
        obj = new Rect({
          left: component.position.x,
          top: component.position.y,
          width: 20,
          height: 20,
          fill: '#ffffff',
          stroke: component.style.borderColor || '#cbd5e1',
          strokeWidth: 2,
          rx: 4,
          ry: 4,
        });
        labelText = component.label;
        break;

      case 'dropdown':
        // Dropdown/Select representation
        obj = new Rect({
          left: component.position.x,
          top: component.position.y,
          width: component.size.width,
          height: component.size.height,
          fill: '#ffffff',
          stroke: component.style.borderColor || '#cbd5e1',
          strokeWidth: component.style.borderWidth || 1,
          rx: 4,
          ry: 4,
        });
        labelText = `▼ ${component.label}`;
        break;

      case 'gauge':
      case 'indicator':
        obj = new Circle({
          left: component.position.x,
          top: component.position.y,
          radius: Math.min(component.size.width, component.size.height) / 2,
          fill: component.style.backgroundColor,
          stroke: component.style.borderColor,
          strokeWidth: component.style.borderWidth || 2,
        });
        labelText = `${component.label}\n${component.variable}`;
        break;

      case 'shape':
        if (component.config?.shape === 'circle') {
          obj = new Circle({
            left: component.position.x,
            top: component.position.y,
            radius: Math.min(component.size.width, component.size.height) / 2,
            fill: component.style.backgroundColor,
            stroke: component.style.borderColor,
            strokeWidth: component.style.borderWidth || 2,
          });
        } else {
          obj = new Rect({
            left: component.position.x,
            top: component.position.y,
            width: component.size.width,
            height: component.size.height,
            fill: component.style.backgroundColor,
            stroke: component.style.borderColor,
            strokeWidth: component.style.borderWidth || 2,
          });
        }
        break;

      case 'text':
        obj = new FabricText(component.label, {
          left: component.position.x,
          top: component.position.y,
          fontSize: component.style.fontSize || 16,
          fill: component.style.textColor,
          fontWeight: component.style.fontWeight || 'normal',
        });
        break;

      default:
        obj = new Rect({
          left: component.position.x,
          top: component.position.y,
          width: component.size.width,
          height: component.size.height,
          fill: component.style.backgroundColor,
          stroke: component.style.borderColor,
          strokeWidth: component.style.borderWidth || 2,
        });
        labelText = `${component.label}\n${component.variable}`;
    }

    if (obj) {
      (obj as any).data = component;
      canvas.add(obj);

      // Add label text if needed
      if (labelText && component.type !== 'text' && component.type !== 'label') {
        const label = new FabricText(labelText, {
          left: component.position.x + (component.type === 'checkbox' ? 30 : component.size.width / 2),
          top: component.position.y + (component.type === 'checkbox' ? 0 : component.size.height / 2),
          fontSize: component.style.fontSize || 12,
          fill: component.style.textColor || '#64748b',
          textAlign: component.type === 'checkbox' ? 'left' : 'center',
          originX: component.type === 'checkbox' ? 'left' : 'center',
          originY: 'center',
        });
        (label as any).data = component;
        canvas.add(label);
      }
    }
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
        gridSize: uiFormData.gridSize,
        showGrid: uiFormData.showGrid,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUis([...uis, newUI]);
    setSelectedUI(newUI);
    setIsCreateDialogOpen(false);
    toast.success('UI created successfully');

    // Reset form
    setUiFormData({
      name: '',
      description: '',
      width: 1200,
      height: 800,
      backgroundColor: '#1e1e1e',
      showGrid: true,
      gridSize: 20
    });
  };

  const handleDeleteUI = (id: string) => {
    setUis(uis.filter(ui => ui.id !== id));
    if (selectedUI?.id === id) {
      setSelectedUI(null);
      fabricCanvas?.clear();
    }
    toast.success('UI deleted');
  };

  const handleAddComponent = (type: UIComponent['type']) => {
    if (!selectedUI) {
      toast.error('Please select a UI first');
      return;
    }

    const newComponent: UIComponent = {
      id: Date.now().toString(),
      type,
      label: `${type} ${selectedUI.components.length + 1}`,
      integrationId: mockIntegrations[0].id,
      variable: mockIntegrations[0].variables[0],
      position: { x: 50, y: 50 },
      size: { width: type === 'text' ? 150 : 200, height: type === 'text' ? 40 : 150 },
      style: {
        backgroundColor: type === 'text' ? 'transparent' : '#2563eb',
        textColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 2,
        fontSize: 14,
        fontWeight: 'normal',
        opacity: 1,
        rotation: 0,
      },
      config: {
        min: 0,
        max: 100,
        unit: '',
        decimals: 2,
        shape: 'rectangle',
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

  const componentTypes = [
    { value: 'input', label: 'Input Field', icon: '📝', category: 'Form' },
    { value: 'form', label: 'Form Container', icon: '📋', category: 'Form' },
    { value: 'label', label: 'Label', icon: '🏷️', category: 'Form' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️', category: 'Form' },
    { value: 'dropdown', label: 'Dropdown', icon: '▼', category: 'Form' },
    { value: 'button', label: 'Button', icon: '🔘', category: 'Form' },
    { value: 'table', label: 'Data Table', icon: '📊', category: 'Data' },
    { value: 'list', label: 'List', icon: '📝', category: 'Data' },
    { value: 'card', label: 'Card', icon: '🃏', category: 'Data' },
    { value: 'gauge', label: 'Gauge', icon: '⏱️', category: 'Visualization' },
    { value: 'chart', label: 'Chart', icon: '📈', category: 'Visualization' },
    { value: 'indicator', label: 'Indicator', icon: '🚥', category: 'Visualization' },
    { value: 'value', label: 'Value Display', icon: '🔢', category: 'Visualization' },
    { value: 'toggle', label: 'Toggle', icon: '🔄', category: 'Control' },
    { value: 'slider', label: 'Slider', icon: '🎚️', category: 'Control' },
    { value: 'text', label: 'Text', icon: '📄', category: 'Basic' },
    { value: 'shape', label: 'Shape', icon: '⬜', category: 'Basic' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Integration UI Builder</h1>
            <p className="text-muted-foreground">Build custom 2D interfaces for your integrations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New UI
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Sidebar - UI List */}
        <div className="w-64 border-r bg-card p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            My UIs
          </h2>
          <ScrollArea className="h-[calc(100vh-200px)]">
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
                      {ui.canvasConfig.width}x{ui.canvasConfig.height}
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 p-6 overflow-auto bg-secondary/20">
          {selectedUI ? (
            <div className="flex flex-col items-center">
              <div className="mb-4 flex gap-2 items-center">
                <h2 className="text-xl font-semibold">{selectedUI.name}</h2>
                <Badge variant="secondary">{selectedUI.components.length} components</Badge>
              </div>
              <div className="border-2 border-border rounded-lg shadow-2xl" style={{ 
                backgroundColor: selectedUI.canvasConfig.backgroundColor,
                padding: '20px'
              }}>
                <canvas ref={canvasRef} />
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Drag and resize components on the canvas. Select them to edit properties.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Grid3x3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No UI Selected</h3>
                <p className="text-muted-foreground mb-4">Select a UI from the list or create a new one to start building</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First UI
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Toolbox & Properties */}
        <div className="w-80 border-l bg-card">
          <Tabs defaultValue="components" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="properties" disabled={!selectedComponent}>
                Properties
              </TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="p-4">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <h3 className="text-sm font-semibold mb-4">Add Component</h3>
                
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
                            <span className="text-xs text-center">{type.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {selectedUI && selectedUI.components.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold mb-4 mt-6">Components List</h3>
                    <div className="space-y-2">
                      {selectedUI.components.map(comp => (
                        <Card key={comp.id} className="p-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{comp.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {comp.type} - {comp.variable}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteComponent(comp.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="properties" className="p-4">
              {selectedComponent && (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Component Properties
                    </h3>

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
      </div>

      {/* Create UI Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New UI</DialogTitle>
            <p className="text-sm text-muted-foreground">Configure your new integration UI canvas</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>UI Name</Label>
              <Input
                value={uiFormData.name}
                onChange={(e) => setUiFormData({ ...uiFormData, name: e.target.value })}
                placeholder="My Control Panel"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={uiFormData.description}
                onChange={(e) => setUiFormData({ ...uiFormData, description: e.target.value })}
                placeholder="Description of the UI"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Canvas Width</Label>
                <Input
                  type="number"
                  value={uiFormData.width}
                  onChange={(e) => setUiFormData({ ...uiFormData, width: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Canvas Height</Label>
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
            <Button onClick={handleCreateUI}>Create UI</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationUIBuilder;
