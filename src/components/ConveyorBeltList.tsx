
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Zap, Gauge, Package, MapPin } from 'lucide-react';

interface ConveyorBelt {
  id: string;
  name: string;
  type: 'flat' | 'modular' | 'cleated' | 'inclined' | 'curved' | 'roller';
  status: 'running' | 'idle' | 'error' | 'maintenance';
  speed: number;
  length: number;
  width: number;
  load: number;
  maxCapacity: number;
  direction: 'forward' | 'reverse' | 'stopped';
  motor: {
    power: number;
    voltage: number;
    current: number;
    temperature: number;
  };
  sensors: {
    photoelectric: boolean;
    proximity: boolean;
    loadCell: boolean;
    encoder: boolean;
  };
  location: string;
  manufacturer: string;
  model: string;
  installDate: string;
}

interface ConveyorBeltListProps {
  conveyorBelts: ConveyorBelt[];
  selectedBelt: ConveyorBelt | null;
  onBeltSelect: (belt: ConveyorBelt) => void;
  onBeltAdd: (belt: Omit<ConveyorBelt, 'id'>) => void;
  onBeltEdit: (id: string, belt: Omit<ConveyorBelt, 'id'>) => void;
  onBeltDelete: (id: string) => void;
}

export const ConveyorBeltList = ({
  conveyorBelts,
  selectedBelt,
  onBeltSelect,
  onBeltAdd,
  onBeltEdit,
  onBeltDelete
}: ConveyorBeltListProps) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBelt, setEditingBelt] = useState<ConveyorBelt | null>(null);
  const [formData, setFormData] = useState<Omit<ConveyorBelt, 'id'>>({
    name: '',
    type: 'flat',
    status: 'idle',
    speed: 0,
    length: 10,
    width: 0.6,
    load: 0,
    maxCapacity: 500,
    direction: 'stopped',
    motor: {
      power: 5.5,
      voltage: 380,
      current: 0,
      temperature: 25
    },
    sensors: {
      photoelectric: true,
      proximity: true,
      loadCell: true,
      encoder: true
    },
    location: '',
    manufacturer: '',
    model: '',
    installDate: new Date().toISOString().split('T')[0]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flat': return '▬';
      case 'modular': return '⬛';
      case 'cleated': return '⧨';
      case 'inclined': return '⟋';
      case 'curved': return '◗';
      case 'roller': return '⚪';
      default: return '▬';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBelt) {
      onBeltEdit(editingBelt.id, formData);
      toast({ title: "Conveyor belt updated successfully" });
      setEditingBelt(null);
    } else {
      onBeltAdd(formData);
      toast({ title: "Conveyor belt added successfully" });
      setIsAddDialogOpen(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'flat',
      status: 'idle',
      speed: 0,
      length: 10,
      width: 0.6,
      load: 0,
      maxCapacity: 500,
      direction: 'stopped',
      motor: {
        power: 5.5,
        voltage: 380,
        current: 0,
        temperature: 25
      },
      sensors: {
        photoelectric: true,
        proximity: true,
        loadCell: true,
        encoder: true
      },
      location: '',
      manufacturer: '',
      model: '',
      installDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (belt: ConveyorBelt) => {
    setFormData({
      name: belt.name,
      type: belt.type,
      status: belt.status,
      speed: belt.speed,
      length: belt.length,
      width: belt.width,
      load: belt.load,
      maxCapacity: belt.maxCapacity,
      direction: belt.direction,
      motor: { ...belt.motor },
      sensors: { ...belt.sensors },
      location: belt.location,
      manufacturer: belt.manufacturer,
      model: belt.model,
      installDate: belt.installDate
    });
    setEditingBelt(belt);
  };

  const handleDelete = (id: string) => {
    onBeltDelete(id);
    toast({ title: "Conveyor belt deleted" });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Conveyor Belts
            </span>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Belt
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {conveyorBelts.map((belt) => (
              <div
                key={belt.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedBelt?.id === belt.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onBeltSelect(belt)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{getTypeIcon(belt.type)}</div>
                    <div>
                      <h4 className="font-medium">{belt.name}</h4>
                      <p className="text-sm text-muted-foreground">{belt.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getStatusColor(belt.status)} text-white`}>
                      {belt.status}
                    </Badge>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(belt)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(belt.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <span>{belt.speed} m/min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span>{belt.load}/{belt.maxCapacity} kg</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{belt.location}</span>
                  </div>
                </div>
              </div>
            ))}
            {conveyorBelts.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No conveyor belts found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || !!editingBelt} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingBelt(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBelt ? 'Edit Conveyor Belt' : 'Add Conveyor Belt'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Belt Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Main Assembly Line"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Belt Type</Label>
                <Select value={formData.type} onValueChange={(value: ConveyorBelt['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Belt</SelectItem>
                    <SelectItem value="modular">Modular Belt</SelectItem>
                    <SelectItem value="cleated">Cleated Belt</SelectItem>
                    <SelectItem value="inclined">Inclined Belt</SelectItem>
                    <SelectItem value="curved">Curved Belt</SelectItem>
                    <SelectItem value="roller">Roller Conveyor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="FlexMove Systems"
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="FM-5000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="length">Length (m)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  value={formData.length}
                  onChange={(e) => setFormData(prev => ({ ...prev, length: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="width">Width (m)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxCapacity">Max Capacity (kg)</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Production Hall A"
                  required
                />
              </div>
              <div>
                <Label htmlFor="motorPower">Motor Power (kW)</Label>
                <Input
                  id="motorPower"
                  type="number"
                  step="0.1"
                  value={formData.motor.power}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    motor: { ...prev.motor, power: parseFloat(e.target.value) }
                  }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="installDate">Install Date</Label>
                <Input
                  id="installDate"
                  type="date"
                  value={formData.installDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, installDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingBelt(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBelt ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
