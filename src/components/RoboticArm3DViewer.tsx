import React, { useRef, useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Environment } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Square, Home, Save, Download, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RealisticRoboticArmModel } from './RealisticRoboticArmModel';
import { MotionStepManager } from './MotionStepManager';

interface MotionStep {
  id: string;
  jointAngles: number[];
  duration: number;
  description?: string;
}

interface RoboticArm3DViewerProps {
  joints: number;
  maxReach: number;
  maxPayload: number;
  selectedMachineId?: string;
  selectedEndpoint?: string;
  roboticArmParams?: any;
}

export const RoboticArm3DViewer = ({
  joints,
  maxReach,
  maxPayload,
  selectedMachineId,
  selectedEndpoint,
  roboticArmParams
}: RoboticArm3DViewerProps) => {
  // Initialize with 2 angles per joint (horizontal and vertical)
  const [jointAngles, setJointAngles] = useState<number[]>(new Array(joints * 2).fill(0));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [motionSequence, setMotionSequence] = useState<MotionStep[]>([]);
  const [savedSequences, setSavedSequences] = useState<any[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const { toast } = useToast();
  const playbackRef = useRef<{ shouldStop: boolean }>({ shouldStop: false });
  const animationRef = useRef<number>();

  // Update joint angles when roboticArmParams changes
  useEffect(() => {
    if (roboticArmParams?.jointAngles) {
      const newAngles = new Array(joints * 2).fill(0);
      Object.keys(roboticArmParams.jointAngles).forEach(key => {
        const jointIndex = parseInt(key.replace('joint_', '')) - 1;
        if (jointIndex >= 0 && jointIndex < joints) {
          // Assume the first value is horizontal, second is vertical
          const angles = roboticArmParams.jointAngles[key];
          newAngles[jointIndex * 2] = angles[0] || 0; // Horizontal
          newAngles[jointIndex * 2 + 1] = angles[1] || 0; // Vertical
        }
      });
      setJointAngles(newAngles);
      console.log('Updated joint angles:', newAngles);
    }
  }, [roboticArmParams, joints]);

  // Load saved sequences on mount
  useEffect(() => {
    if (selectedMachineId) {
      loadSavedSequences();
    }
  }, [selectedMachineId]);

  const loadSavedSequences = async () => {
    if (!selectedMachineId) return;
    
    try {
      const { data, error } = await supabase
        .from('motion_paths')
        .select('*')
        .eq('robotic_arm_id', selectedMachineId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSavedSequences(data || []);
    } catch (error) {
      console.error('Error loading sequences:', error);
    }
  };

  const smoothTransition = (startAngles: number[], endAngles: number[], progress: number): number[] => {
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    const easedProgress = easeInOutCubic(progress);
    
    return startAngles.map((start, i) => {
      const end = endAngles[i] || 0;
      return start + (end - start) * easedProgress;
    });
  };

  const handlePlaySequence = async () => {
    if (motionSequence.length === 0) {
      toast({
        title: "No Sequence",
        description: "Please add some motion steps first",
        variant: "destructive"
      });
      return;
    }

    await playSequenceFromStep(0, motionSequence);
  };

  const handlePlayFromStep = async (stepIndex: number) => {
    const sequenceToPlay = motionSequence.slice(stepIndex);
    if (sequenceToPlay.length === 0) {
      toast({
        title: "No Steps",
        description: "No steps available to play from this position",
        variant: "destructive"
      });
      return;
    }
    
    await playSequenceFromStep(stepIndex, motionSequence);
  };

  const playSequenceFromStep = async (startIndex: number, sequence: MotionStep[]) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    playbackRef.current.shouldStop = false;
    
    try {
      for (let i = startIndex; i < sequence.length; i++) {
        if (playbackRef.current.shouldStop) break;
        
        setCurrentStep(i + 1);
        const targetAngles = sequence[i].jointAngles.slice(0, joints * 2);
        const duration = sequence[i].duration / animationSpeed;
        
        toast({
          title: `Playing: ${sequence[i].description || `Step ${i + 1}`}`,
          description: `Step ${i + 1} of ${sequence.length}`,
          duration: Math.min(duration, 3000)
        });
        
        const stepStartTime = Date.now();
        const previousAngles = [...jointAngles];
        
        await new Promise<void>((resolve) => {
          const animate = () => {
            if (playbackRef.current.shouldStop) {
              resolve();
              return;
            }
            
            const elapsed = Date.now() - stepStartTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentAngles = smoothTransition(previousAngles, targetAngles, progress);
            setJointAngles(currentAngles);
            
            if (progress >= 1) {
              resolve();
            } else {
              animationRef.current = requestAnimationFrame(animate);
            }
          };
          
          animate();
        });
        
        if (!playbackRef.current.shouldStop && i < sequence.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      if (!playbackRef.current.shouldStop) {
        toast({
          title: "Sequence Complete",
          description: `Finished playing ${sequence.length} steps`
        });
      }
    } catch (error) {
      console.error('Error during sequence playback:', error);
      toast({
        title: "Playback Error",
        description: "An error occurred during sequence playback",
        variant: "destructive"
      });
    } finally {
      setIsPlaying(false);
      setCurrentStep(0);
      playbackRef.current.shouldStop = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const handleStopSequence = () => {
    playbackRef.current.shouldStop = true;
    setIsPlaying(false);
    setCurrentStep(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    toast({
      title: "Sequence Stopped",
      description: "Playback has been stopped"
    });
  };

  const handleHomePosition = () => {
    if (isPlaying) {
      handleStopSequence();
    }
    const homeAngles = new Array(joints * 2).fill(0);
    setJointAngles(homeAngles);
    toast({
      title: "Home Position",
      description: "Robotic arm returned to home position"
    });
  };

  const handleAddCurrentStep = (description: string, duration: number) => {
    const newStep: MotionStep = {
      id: Date.now().toString(),
      jointAngles: [...jointAngles],
      duration: duration,
      description: description
    };
    setMotionSequence([...motionSequence, newStep]);
    toast({
      title: "Step Added",
      description: `Added "${description}" to sequence`
    });
  };

  const clearSequence = () => {
    if (isPlaying) {
      handleStopSequence();
    }
    setMotionSequence([]);
    setCurrentStep(0);
    toast({
      title: "Sequence Cleared",
      description: "Motion sequence cleared"
    });
  };

  const handleSaveSequence = async () => {
    if (!selectedMachineId) {
      toast({
        title: "Error",
        description: "Please select a robotic arm first",
        variant: "destructive"
      });
      return;
    }

    if (motionSequence.length === 0) {
      toast({
        title: "Error",
        description: "No sequence to save",
        variant: "destructive"
      });
      return;
    }

    try {
      const sequenceData = {
        robotic_arm_id: selectedMachineId,
        name: `Sequence_${Date.now()}`,
        path_data: motionSequence.map((step, index) => ({
          step: index + 1,
          jointAngles: step.jointAngles.slice(0, joints),
          duration: step.duration,
          description: step.description
        })),
        duration_seconds: motionSequence.reduce((total, step) => total + step.duration, 0) / 1000
      };

      const { error } = await supabase
        .from('motion_paths')
        .insert(sequenceData);

      if (error) throw error;

      toast({
        title: "Sequence Saved",
        description: "Motion sequence saved successfully"
      });
      
      loadSavedSequences();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save sequence",
        variant: "destructive"
      });
    }
  };

  const generateGCode = (angles: number[]): string => {
    let gcode = '; Robotic Arm G-Code\n';
    gcode += '; Generated by Robotic Arms Control System\n';
    gcode += `; Joints: ${joints}\n`;
    gcode += `; Max Reach: ${maxReach}mm\n`;
    gcode += `; Max Payload: ${maxPayload}kg\n\n`;
    
    angles.slice(0, joints).forEach((angle, index) => {
      gcode += `G1 J${index + 1}${angle.toFixed(3)} ; Joint ${index + 1} to ${angle.toFixed(3)} degrees\n`;
    });
    
    gcode += '\n; End of program\n';
    return gcode;
  };

  const handleDownloadGCode = () => {
    const gcode = generateGCode(jointAngles);
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robotic_arm_${selectedMachineId}_${Date.now()}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "G-Code Downloaded",
      description: "G-Code file downloaded successfully"
    });
  };

  const handleSendToConfiguration = async () => {
    if (!selectedMachineId || !selectedEndpoint) {
      toast({
        title: "Configuration Error",
        description: "Please select both a robotic arm and endpoint",
        variant: "destructive"
      });
      return;
    }

    const configData = {
      machineId: selectedMachineId,
      endpoint: selectedEndpoint,
      jointAngles: jointAngles.slice(0, joints),
      maxReach: maxReach,
      maxPayload: maxPayload,
      sequence: motionSequence,
      timestamp: new Date().toISOString()
    };

    try {
      console.log('Sending configuration to endpoint:', configData);
      
      // Here you would typically send to the actual endpoint
      // For now, we'll just log and show success
      
      toast({
        title: "Configuration Sent",
        description: `Configuration sent to ${selectedEndpoint}`
      });
    } catch (error) {
      console.error('Error sending configuration:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send configuration to endpoint",
        variant: "destructive"
      });
    }
  };

  const updateJointAngle = (jointIndex: number, angleType: 'horizontal' | 'vertical', value: number) => {
    const newAngles = [...jointAngles];
    const angleIndex = jointIndex * 2 + (angleType === 'horizontal' ? 0 : 1);
    newAngles[angleIndex] = value;
    setJointAngles(newAngles);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Robotic Arm - 3D Visualization</h3>
          <div className="flex gap-2">
            <Button onClick={handlePlaySequence} disabled={isPlaying} size="sm">
              <Play className="w-4 h-4 mr-2" />
              Play Sequence
            </Button>
            <Button onClick={handleStopSequence} disabled={!isPlaying} size="sm" variant="outline">
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
            <Button onClick={handleHomePosition} size="sm" variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button onClick={clearSequence} size="sm" variant="outline" disabled={isPlaying}>
              Clear Sequence
            </Button>
          </div>
        </div>

        {/* Configuration Status */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span>Configuration Status:</span>
            <div className="flex items-center gap-2">
              <span className={selectedMachineId ? "text-green-600" : "text-orange-600"}>
                Machine: {selectedMachineId ? "Selected" : "Not Selected"}
              </span>
              <span>•</span>
              <span className={selectedEndpoint ? "text-green-600" : "text-orange-600"}>
                Endpoint: {selectedEndpoint ? "Selected" : "Not Selected"}
              </span>
            </div>
          </div>
        </div>

        {/* Playback Status */}
        {(isPlaying || motionSequence.length > 0) && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Sequence: {motionSequence.length} steps</span>
              <span>Current Step: {currentStep}</span>
              <span className={isPlaying ? "text-green-600" : "text-gray-600"}>
                Status: {isPlaying ? "Playing" : "Stopped"}
              </span>
            </div>
          </div>
        )}

        <div className="h-96 bg-gray-50 rounded-lg border">
          <Canvas 
            camera={{
              position: [3, 3, 3],
              fov: 50
            }}
          >
            <Suspense fallback={null}>
              <Environment preset="city" />
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={1} 
                castShadow 
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <RealisticRoboticArmModel 
                joints={joints}
                jointAngles={jointAngles}
                maxReach={maxReach}
              />
            </Suspense>
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Joints: {joints} | Max Reach: {maxReach}mm | Max Payload: {maxPayload}kg</p>
          <p>Use mouse to rotate, scroll to zoom, right-click to pan</p>
        </div>
      </Card>

      {/* Joint Control Panel */}
      <Card className="p-4">
        <h4 className="text-md font-semibold mb-4">Joint Controls</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: joints }, (_, i) => (
            <div key={i} className="p-3 border rounded-lg bg-gray-50">
              <h5 className="font-medium mb-3">Joint {i + 1}</h5>
              
              {/* Horizontal Control */}
              <div className="mb-3">
                <Label className="text-xs text-gray-600">Horizontal: {jointAngles[i * 2]?.toFixed(1)}°</Label>
                <Slider
                  value={[jointAngles[i * 2] || 0]}
                  onValueChange={([value]) => updateJointAngle(i, 'horizontal', value)}
                  min={-180}
                  max={180}
                  step={1}
                  className="mt-1"
                />
              </div>
              
              {/* Vertical Control */}
              <div>
                <Label className="text-xs text-gray-600">Vertical: {jointAngles[i * 2 + 1]?.toFixed(1)}°</Label>
                <Slider
                  value={[jointAngles[i * 2 + 1] || 0]}
                  onValueChange={([value]) => updateJointAngle(i, 'vertical', value)}
                  min={-90}
                  max={90}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <MotionStepManager
        steps={motionSequence}
        onStepsChange={setMotionSequence}
        onPlayFromStep={handlePlayFromStep}
        onAddCurrentStep={handleAddCurrentStep}
        currentStep={currentStep}
        isPlaying={isPlaying}
        joints={joints}
      />
    </div>
  );
};
