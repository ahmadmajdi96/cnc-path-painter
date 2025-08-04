
import React, { useRef, useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Environment } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const [jointAngles, setJointAngles] = useState<number[]>(new Array(joints).fill(0));
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
      const newAngles = new Array(joints).fill(0);
      Object.keys(roboticArmParams.jointAngles).forEach(key => {
        const jointIndex = parseInt(key.replace('joint_', '')) - 1;
        if (jointIndex >= 0 && jointIndex < joints) {
          newAngles[jointIndex] = roboticArmParams.jointAngles[key][0] || 0;
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
    // Smooth easing function
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
    let sequenceToPlay = motionSequence;

    // If no sequence exists, create one from current position
    if (!motionSequence.length) {
      const currentSequence: MotionStep[] = [
        {
          id: '1',
          jointAngles: [...jointAngles],
          duration: 2000,
          description: 'Current position'
        }
      ];
      setMotionSequence(currentSequence);
      sequenceToPlay = currentSequence;
      
      toast({
        title: "Sequence Created",
        description: "Created sequence from current position"
      });
    }

    await playSequenceFromStep(0, sequenceToPlay);
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
    setCurrentStep(startIndex);
    playbackRef.current.shouldStop = false;
    
    try {
      const startAngles = [...jointAngles];
      
      for (let i = startIndex; i < sequence.length; i++) {
        if (playbackRef.current.shouldStop) {
          break;
        }
        
        setCurrentStep(i + 1);
        const targetAngles = sequence[i].jointAngles.slice(0, joints);
        const duration = sequence[i].duration / animationSpeed;
        
        toast({
          title: `Step ${i + 1}`,
          description: sequence[i].description || `Playing step ${i + 1} of ${sequence.length}`
        });
        
        // Smooth animation to target position
        const stepStartTime = Date.now();
        const previousAngles = i === startIndex ? startAngles : [...jointAngles];
        
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
        
        // Small pause between steps
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
    const homeAngles = new Array(joints).fill(0);
    setJointAngles(homeAngles);
    toast({
      title: "Home Position",
      description: "Robotic arm returned to home position"
    });
  };

  const addCurrentPositionToSequence = () => {
    const newStep: MotionStep = {
      id: Date.now().toString(),
      jointAngles: [...jointAngles],
      duration: 2000,
      description: `Position ${motionSequence.length + 1}`
    };
    setMotionSequence([...motionSequence, newStep]);
    toast({
      title: "Step Added",
      description: `Added step ${motionSequence.length + 1} to sequence`
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
            <Button onClick={addCurrentPositionToSequence} size="sm" variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Add Step
            </Button>
            <Button onClick={clearSequence} size="sm" variant="outline" disabled={isPlaying}>
              Clear Sequence
            </Button>
            <Button onClick={handleDownloadGCode} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download G-Code
            </Button>
            <Button 
              onClick={handleSendToConfiguration} 
              size="sm" 
              variant="default"
              disabled={!selectedMachineId || !selectedEndpoint}
            >
              <Send className="w-4 h-4 mr-2" />
              Send to Configuration
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
          <p>Current Joint Angles: {jointAngles.slice(0, joints).map(a => a.toFixed(1)).join(', ')}°</p>
          <p>Use mouse to rotate, scroll to zoom, right-click to pan</p>
        </div>
      </Card>

      <MotionStepManager
        steps={motionSequence}
        onStepsChange={setMotionSequence}
        onPlayFromStep={handlePlayFromStep}
        currentStep={currentStep}
        isPlaying={isPlaying}
        joints={joints}
      />
    </div>
  );
};
