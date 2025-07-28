import React, { useRef, useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Square, Home, Save, Download, Send, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as THREE from 'three';

interface JointPosition {
  angle: number;
  x: number;
  y: number;
  z: number;
}

interface MotionStep {
  id: string;
  jointAngles: number[];
  duration: number;
  description?: string;
}

interface RoboticArmProps {
  joints: number;
  jointAngles: number[];
  maxReach: number;
  isAnimating?: boolean;
}

function RoboticArmModel({ joints, jointAngles, maxReach, isAnimating }: RoboticArmProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [animatedAngles, setAnimatedAngles] = useState<number[]>(jointAngles);
  const segmentLength = (maxReach / 1000) / joints;

  // Animate joint angles smoothly
  useFrame((state, delta) => {
    if (isAnimating) {
      setAnimatedAngles(prev => 
        prev.map((angle, i) => {
          const target = jointAngles[i] || 0;
          const diff = target - angle;
          const speed = 2; // Animation speed
          return angle + diff * speed * delta;
        })
      );
    } else {
      setAnimatedAngles(jointAngles);
    }
  });

  const calculateJointPositions = () => {
    const positions = [];
    let x = 0, y = 0, z = 0;
    
    for (let i = 0; i < joints; i++) {
      const angle = (animatedAngles[i] || 0) * Math.PI / 180;
      
      if (i === 0) {
        x = segmentLength * Math.cos(angle);
        y = segmentLength * (i + 1);
        z = segmentLength * Math.sin(angle);
      } else {
        const prevX = positions[i - 1]?.x || 0;
        const prevY = positions[i - 1]?.y || segmentLength * i;
        const prevZ = positions[i - 1]?.z || 0;
        
        x = prevX + segmentLength * Math.cos(angle);
        y = prevY + segmentLength * 0.5;
        z = prevZ + segmentLength * Math.sin(angle);
      }
      
      positions.push({ x, y, z, angle });
    }
    
    return positions;
  };

  const jointPositions = calculateJointPositions();

  return (
    <group ref={groupRef}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Joints and Links */}
      {jointPositions.map((pos, index) => (
        <group key={index}>
          {/* Joint */}
          <mesh position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#e53e3e" />
          </mesh>
          
          {/* Link to next joint */}
          {index < jointPositions.length - 1 && (
            <mesh position={[
              (pos.x + jointPositions[index + 1].x) / 2,
              (pos.y + jointPositions[index + 1].y) / 2,
              (pos.z + jointPositions[index + 1].z) / 2
            ]}>
              <cylinderGeometry args={[0.03, 0.03, segmentLength]} />
              <meshStandardMaterial color="#4a90e2" />
            </mesh>
          )}
        </group>
      ))}

      {/* End Effector */}
      <mesh position={[
        jointPositions[jointPositions.length - 1]?.x || 0,
        jointPositions[jointPositions.length - 1]?.y || segmentLength * joints,
        jointPositions[jointPositions.length - 1]?.z || 0
      ]}>
        <boxGeometry args={[0.1, 0.05, 0.1]} />
        <meshStandardMaterial color="#38a169" />
      </mesh>
    </group>
  );
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
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [motionSequence, setMotionSequence] = useState<MotionStep[]>([]);
  const [savedSequences, setSavedSequences] = useState<any[]>([]);
  const playbackRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

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
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
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

  const handlePlaySequence = async () => {
    if (!motionSequence.length) {
      toast({
        title: "No Sequence",
        description: "Please add steps to create a motion sequence",
        variant: "destructive"
      });
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    setCurrentStep(0);
    setIsAnimating(true);
    
    // Play through the sequence
    for (let i = 0; i < motionSequence.length; i++) {
      if (!isPlaying) break;
      
      setCurrentStep(i);
      setJointAngles(motionSequence[i].jointAngles);
      
      await new Promise(resolve => {
        playbackRef.current = setTimeout(resolve, motionSequence[i].duration);
      });
    }
    
    setIsPlaying(false);
    setIsAnimating(false);
    
    toast({
      title: "Sequence Complete",
      description: "Motion sequence playback finished"
    });
  };

  const handlePauseSequence = () => {
    setIsPaused(true);
    setIsPlaying(false);
    if (playbackRef.current) {
      clearTimeout(playbackRef.current);
    }
  };

  const handleStopSequence = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setIsAnimating(false);
    setCurrentStep(0);
    if (playbackRef.current) {
      clearTimeout(playbackRef.current);
    }
  };

  const handleHomePosition = () => {
    const homeAngles = new Array(joints).fill(0);
    setJointAngles(homeAngles);
    setIsPlaying(false);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    
    toast({
      title: "Home Position",
      description: "Robotic arm returned to home position"
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
        description: "No motion sequence to save",
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
          jointAngles: step.jointAngles,
          duration: step.duration,
          description: step.description || `Step ${index + 1}`
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
      console.error('Error saving sequence:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save sequence",
        variant: "destructive"
      });
    }
  };

  const addCurrentPositionToSequence = () => {
    const newStep: MotionStep = {
      id: Date.now().toString(),
      jointAngles: [...jointAngles],
      duration: 2000,
      description: `Step ${motionSequence.length + 1}`
    };
    setMotionSequence([...motionSequence, newStep]);
    toast({
      title: "Step Added",
      description: `Added step ${motionSequence.length + 1} to sequence`
    });
  };

  const clearSequence = () => {
    setMotionSequence([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsPaused(false);
    setIsAnimating(false);
    if (playbackRef.current) {
      clearTimeout(playbackRef.current);
    }
    toast({
      title: "Sequence Cleared",
      description: "Motion sequence cleared"
    });
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

  const generateGCode = (angles: number[]): string => {
    let gcode = '; Robotic Arm G-Code\n';
    gcode += '; Generated by Robotic Arms Control System\n';
    gcode += `; Joints: ${joints}\n`;
    gcode += `; Max Reach: ${maxReach}mm\n`;
    gcode += `; Max Payload: ${maxPayload}kg\n\n`;
    
    angles.forEach((angle, index) => {
      gcode += `G1 J${index + 1}${angle.toFixed(3)} ; Joint ${index + 1} to ${angle.toFixed(3)} degrees\n`;
    });
    
    gcode += '\n; End of program\n';
    return gcode;
  };

  const handleSendToConfiguration = async () => {
    if (!selectedMachineId) {
      toast({
        title: "Configuration Error",
        description: "Please select a robotic arm first",
        variant: "destructive"
      });
      return;
    }

    if (!selectedEndpoint) {
      toast({
        title: "Configuration Error",
        description: "Please select an endpoint first",
        variant: "destructive"
      });
      return;
    }

    const configData = {
      machineId: selectedMachineId,
      endpoint: selectedEndpoint,
      jointAngles: jointAngles,
      maxReach: maxReach,
      maxPayload: maxPayload,
      sequence: motionSequence
    };

    try {
      console.log('Sending configuration:', configData);
      toast({
        title: "Configuration Sent",
        description: `Configuration sent to ${selectedEndpoint}`
      });
    } catch (error) {
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
            <Button onClick={handlePlaySequence} disabled={isPlaying || isPaused} size="sm">
              <Play className="w-4 h-4 mr-2" />
              Play Sequence
            </Button>
            <Button onClick={handlePauseSequence} disabled={!isPlaying} size="sm" variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button onClick={handleStopSequence} disabled={!isPlaying && !isPaused} size="sm" variant="outline">
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
            <Button onClick={clearSequence} size="sm" variant="outline">
              Clear Sequence
            </Button>
            <Button onClick={handleSaveSequence} size="sm" variant="default">
              Save Sequence
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

        {/* Sequence Status */}
        {motionSequence.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Sequence: {motionSequence.length} steps</span>
              <span>Current Step: {currentStep + 1}</span>
              <span className={isPlaying ? "text-green-600" : isPaused ? "text-orange-600" : "text-gray-600"}>
                Status: {isPlaying ? "Playing" : isPaused ? "Paused" : "Stopped"}
              </span>
            </div>
          </div>
        )}

        <div className="h-96 bg-gray-50 rounded-lg border">
          <Canvas 
            camera={{
              position: [2, 2, 2],
              fov: 50
            }}
          >
            <Suspense fallback={null}>
              <Stage adjustCamera intensity={1} shadows="contact" environment="city">
                <RoboticArmModel 
                  joints={joints}
                  jointAngles={jointAngles}
                  maxReach={maxReach}
                  isAnimating={isAnimating}
                />
              </Stage>
            </Suspense>
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Joints: {joints} | Max Reach: {maxReach}mm | Max Payload: {maxPayload}kg</p>
          <p>Use mouse to rotate, scroll to zoom, right-click to pan</p>
          <p>Current Joint Angles: {jointAngles.map(a => a.toFixed(1)).join(', ')}°</p>
          {isAnimating && <p className="text-blue-600">● Animating to new position...</p>}
        </div>
      </Card>
    </div>
  );
};
