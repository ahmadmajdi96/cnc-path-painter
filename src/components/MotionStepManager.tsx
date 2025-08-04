
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trash2, Play, Edit2, Check, X } from 'lucide-react';
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
  currentStep: number;
  isPlaying: boolean;
  joints: number;
}

export const MotionStepManager = ({
  steps,
  onStepsChange,
  onPlayFromStep,
  currentStep,
  isPlaying,
  joints
}: MotionStepManagerProps) => {
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState(2000);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Motion Sequence ({steps.length} steps)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No motion steps defined. Use "Add Step" to create your first motion step.
          </div>
        ) : (
          steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-3 border rounded-lg ${
                currentStep === index + 1 && isPlaying
                  ? 'bg-green-50 border-green-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
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
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Step {index + 1}</Badge>
                        {currentStep === index + 1 && isPlaying && (
                          <Badge variant="default" className="bg-green-500">Playing</Badge>
                        )}
                        <span className="text-sm font-medium">
                          {step.description || `Motion Step ${index + 1}`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Duration: {step.duration}ms | Angles: {step.jointAngles.slice(0, joints).map(a => a.toFixed(1)).join(', ')}°
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <Button
                    onClick={() => onPlayFromStep(index)}
                    disabled={isPlaying}
                    size="sm"
                    variant="outline"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleEditStep(step)}
                    disabled={editingStep !== null}
                    size="sm"
                    variant="outline"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDuplicateStep(step)}
                    disabled={editingStep !== null}
                    size="sm"
                    variant="outline"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={() => handleDeleteStep(step.id)}
                    disabled={editingStep !== null}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="w-4 h-4" />
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
