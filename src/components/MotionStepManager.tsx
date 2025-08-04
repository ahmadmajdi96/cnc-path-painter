
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Play, Edit2, Check, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MotionStep {
  id: string;
  jointAngles: number[];
  duration: number;
  description?: string;
}

interface MotionStepManagerProps {
  steps: MotionStep[];
  onStepsChange: (steps: MotionStep[]) => void;
  onPlayFromStep: (stepIndex: number) => void;
  onAddCurrentStep: (description: string, duration: number) => void;
  currentStep: number;
  isPlaying: boolean;
  joints: number;
}

export const MotionStepManager = ({
  steps,
  onStepsChange,
  onPlayFromStep,
  onAddCurrentStep,
  currentStep,
  isPlaying,
  joints
}: MotionStepManagerProps) => {
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState(2000);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDuration, setNewStepDuration] = useState(2000);
  const { toast } = useToast();

  const handleEditStep = (step: MotionStep) => {
    setEditingStep(step.id);
    setEditDescription(step.description || '');
    setEditDuration(step.duration);
  };

  const handleSaveEdit = (stepId: string) => {
    const updatedSteps = steps.map(step => 
      step.id === stepId 
        ? { ...step, description: editDescription, duration: editDuration }
        : step
    );
    onStepsChange(updatedSteps);
    setEditingStep(null);
    
    toast({
      title: "Step Updated",
      description: "Motion step has been updated successfully"
    });
  };

  const handleCancelEdit = () => {
    setEditingStep(null);
    setEditDescription('');
    setEditDuration(2000);
  };

  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = steps.filter(step => step.id !== stepId);
    onStepsChange(updatedSteps);
    
    toast({
      title: "Step Deleted",
      description: "Motion step has been removed from sequence"
    });
  };

  const handleDuplicateStep = (step: MotionStep) => {
    const newStep: MotionStep = {
      ...step,
      id: Date.now().toString(),
      description: `${step.description || 'Step'} (Copy)`
    };
    onStepsChange([...steps, newStep]);
    
    toast({
      title: "Step Duplicated",
      description: "Motion step has been duplicated"
    });
  };

  const handleAddNewStep = () => {
    if (!newStepName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid step name",
        variant: "destructive"
      });
      return;
    }

    onAddCurrentStep(newStepName, newStepDuration);
    setNewStepName('');
    setNewStepDuration(2000);
    setShowAddDialog(false);
  };

  const formatJointAngles = (angles: number[]) => {
    const pairs = [];
    for (let i = 0; i < joints; i++) {
      const h = angles[i * 2] || 0;
      const v = angles[i * 2 + 1] || 0;
      pairs.push(`J${i + 1}(H:${h.toFixed(1)}°, V:${v.toFixed(1)}°)`);
    }
    return pairs.join(', ');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Motion Sequence ({steps.length} steps)</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Current Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Motion Step</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Step Name</label>
                  <Input
                    value={newStepName}
                    onChange={(e) => setNewStepName(e.target.value)}
                    placeholder="Enter step name (e.g., 'Pick Position', 'Home')"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (ms)</label>
                  <Input
                    type="number"
                    value={newStepDuration}
                    onChange={(e) => setNewStepDuration(parseInt(e.target.value) || 2000)}
                    min="100"
                    max="10000"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddDialog(false);
                      setNewStepName('');
                      setNewStepDuration(2000);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddNewStep}>
                    Add Step
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No motion steps defined. Use "Add Current Position" to create your first motion step.
          </div>
        ) : (
          steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 border rounded-lg transition-colors ${
                currentStep === index + 1 && isPlaying
                  ? 'bg-green-50 border-green-500 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingStep === step.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Step description"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editDuration}
                          onChange={(e) => setEditDuration(parseInt(e.target.value) || 2000)}
                          placeholder="Duration (ms)"
                          className="w-32"
                          min="100"
                          max="10000"
                        />
                        <Button
                          onClick={() => handleSaveEdit(step.id)}
                          size="sm"
                          variant="default"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">Step {index + 1}</Badge>
                        {currentStep === index + 1 && isPlaying && (
                          <Badge variant="default" className="bg-green-500 text-xs">Playing</Badge>
                        )}
                        <span className="font-medium text-sm">
                          {step.description || `Motion Step ${index + 1}`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Duration: {step.duration}ms</div>
                        <div className="font-mono">
                          {formatJointAngles(step.jointAngles)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-3">
                  <Button
                    onClick={() => onPlayFromStep(index)}
                    disabled={isPlaying}
                    size="sm"
                    variant="outline"
                    className="px-2"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleEditStep(step)}
                    disabled={editingStep !== null}
                    size="sm"
                    variant="outline"
                    className="px-2"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleDuplicateStep(step)}
                    disabled={editingStep !== null}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={() => handleDeleteStep(step.id)}
                    disabled={editingStep !== null}
                    size="sm"
                    variant="outline"
                    className="px-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
