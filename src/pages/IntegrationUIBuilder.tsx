import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogActions } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UIComponent {
  id: string;
  type: 'gauge' | 'chart' | 'indicator' | 'button' | 'value' | 'toggle';
  label: string;
  integrationId: string;
  parameter: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
}

interface IntegrationUI {
  id: string;
  name: string;
  description: string;
  integrationId: string;
  components: UIComponent[];
  createdAt: string;
  updatedAt: string;
}

const IntegrationUIBuilder = () => {
  const [uis, setUis] = useState<IntegrationUI[]>([]);
  const [selectedUI, setSelectedUI] = useState<IntegrationUI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  const [editingUI, setEditingUI] = useState<IntegrationUI | null>(null);
  const [editingComponent, setEditingComponent] = useState<UIComponent | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    integrationId: 'integration-1',
  });

  const [componentData, setComponentData] = useState<Partial<UIComponent>>({
    type: 'gauge',
    label: '',
    parameter: '',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
    style: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      borderColor: '#3b82f6',
    }
  });

  const mockIntegrations = [
    { id: 'integration-1', name: 'PLC Integration' },
    { id: 'integration-2', name: 'SCADA Integration' },
    { id: 'integration-3', name: 'Sensor Network' }
  ];

  const handleCreateUI = () => {
    setEditingUI(null);
    setFormData({ name: '', description: '', integrationId: 'integration-1' });
    setIsDialogOpen(true);
  };

  const handleSaveUI = () => {
    if (!formData.name) {
      toast.error('Please enter a name');
      return;
    }

    if (editingUI) {
      setUis(uis.map(ui => ui.id === editingUI.id ? {
        ...ui,
        ...formData,
        updatedAt: new Date().toISOString()
      } : ui));
      toast.success('UI updated');
    } else {
      const newUI: IntegrationUI = {
        id: Date.now().toString(),
        ...formData,
        components: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUis([...uis, newUI]);
      setSelectedUI(newUI);
      toast.success('UI created');
    }
    setIsDialogOpen(false);
  };

  const handleDeleteUI = (id: string) => {
    setUis(uis.filter(ui => ui.id !== id));
    if (selectedUI?.id === id) setSelectedUI(null);
    toast.success('UI deleted');
  };

  const handleSaveComponent = () => {
    if (!selectedUI || !componentData.label || !componentData.parameter) {
      toast.error('Please fill all required fields');
      return;
    }

    let updatedComponents;
    if (editingComponent) {
      updatedComponents = selectedUI.components.map(c => 
        c.id === editingComponent.id ? { ...componentData, id: c.id } as UIComponent : c
      );
      toast.success('Component updated');
    } else {
      const newComponent: UIComponent = {
        ...componentData,
        id: Date.now().toString(),
        integrationId: selectedUI.integrationId
      } as UIComponent;
      updatedComponents = [...selectedUI.components, newComponent];
      toast.success('Component added');
    }

    const updatedUI = {
      ...selectedUI,
      components: updatedComponents,
      updatedAt: new Date().toISOString()
    };

    setSelectedUI(updatedUI);
    setUis(uis.map(ui => ui.id === updatedUI.id ? updatedUI : ui));
    setIsComponentDialogOpen(false);
  };

  const handleDeleteComponent = (componentId: string) => {
    if (!selectedUI) return;
    const updatedUI = {
      ...selectedUI,
      components: selectedUI.components.filter(c => c.id !== componentId),
      updatedAt: new Date().toISOString()
    };
    setSelectedUI(updatedUI);
    setUis(uis.map(ui => ui.id === updatedUI.id ? updatedUI : ui));
    toast.success('Component deleted');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Integration UI Builder</h1>
            <p className="text-muted-foreground">Build custom 2D interfaces for your integrations</p>
          </div>
          <Button onClick={handleCreateUI}>
            <Plus className="w-4 h-4 mr-2" />
            Create New UI
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">My UIs</h2>
              {uis.length === 0 ? (
                <p className="text-sm text-muted-foreground">No UIs created yet</p>
              ) : (
                <div className="space-y-2">
                  {uis.map(ui => (
                    <Card 
                      key={ui.id}
                      className={`p-3 cursor-pointer ${selectedUI?.id === ui.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedUI(ui)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{ui.name}</h3>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteUI(ui.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{ui.components.length} components</p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card className="p-4">
              {selectedUI ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{selectedUI.name}</h2>
                    <Button onClick={() => { setEditingComponent(null); setIsComponentDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Component
                    </Button>
                  </div>
                  <div className="relative bg-secondary/20 rounded-lg" style={{ minHeight: '600px' }}>
                    {selectedUI.components.map(component => (
                      <div
                        key={component.id}
                        className="absolute p-4 rounded border-2 flex flex-col items-center justify-center"
                        style={{
                          left: component.position.x,
                          top: component.position.y,
                          width: component.size.width,
                          height: component.size.height,
                          backgroundColor: component.style.backgroundColor,
                          color: component.style.textColor,
                          borderColor: component.style.borderColor,
                        }}
                      >
                        <div className="absolute top-1 right-1 flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingComponent(component); setComponentData(component); setIsComponentDialogOpen(true); }}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteComponent(component.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-2xl mb-2">{component.type === 'gauge' ? '⌚' : '📊'}</div>
                        <div className="font-semibold">{component.label}</div>
                        <div className="text-xs opacity-70">{component.parameter}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <p className="text-muted-foreground">Select a UI or create one to start building</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUI ? 'Edit UI' : 'Create UI'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <Label>Integration</Label>
              <Select value={formData.integrationId} onValueChange={(value) => setFormData({ ...formData, integrationId: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockIntegrations.map(int => <SelectItem key={int.id} value={int.id}>{int.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogActions>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUI}>{editingUI ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingComponent ? 'Edit Component' : 'Add Component'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={componentData.type} onValueChange={(value: any) => setComponentData({ ...componentData, type: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gauge">Gauge</SelectItem>
                  <SelectItem value="chart">Chart</SelectItem>
                  <SelectItem value="indicator">Indicator</SelectItem>
                  <SelectItem value="button">Button</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="toggle">Toggle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Label</Label>
              <Input value={componentData.label} onChange={(e) => setComponentData({ ...componentData, label: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Parameter</Label>
              <Input value={componentData.parameter} onChange={(e) => setComponentData({ ...componentData, parameter: e.target.value })} />
            </div>
            <div><Label>X</Label><Input type="number" value={componentData.position?.x} onChange={(e) => setComponentData({ ...componentData, position: { ...componentData.position!, x: parseInt(e.target.value) } })} /></div>
            <div><Label>Y</Label><Input type="number" value={componentData.position?.y} onChange={(e) => setComponentData({ ...componentData, position: { ...componentData.position!, y: parseInt(e.target.value) } })} /></div>
            <div><Label>Width</Label><Input type="number" value={componentData.size?.width} onChange={(e) => setComponentData({ ...componentData, size: { ...componentData.size!, width: parseInt(e.target.value) } })} /></div>
            <div><Label>Height</Label><Input type="number" value={componentData.size?.height} onChange={(e) => setComponentData({ ...componentData, size: { ...componentData.size!, height: parseInt(e.target.value) } })} /></div>
          </div>
          <DialogActions>
            <Button variant="outline" onClick={() => setIsComponentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveComponent}>{editingComponent ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationUIBuilder;
