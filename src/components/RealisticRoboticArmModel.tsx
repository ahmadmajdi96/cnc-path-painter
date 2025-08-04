import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface RealisticRoboticArmProps {
  joints: number;
  jointAngles: number[];
  maxReach: number;
}

export function RealisticRoboticArmModel({ joints, jointAngles, maxReach }: RealisticRoboticArmProps) {
  const groupRef = useRef<THREE.Group>(null);
  const segmentLength = (maxReach / 1000) / Math.max(joints - 1, 1); // Convert to meters
  
  // Ensure we have angles for all joints
  const angles = Array(joints).fill(0).map((_, i) => jointAngles[i] || 0);
  
  // Base configuration
  const baseHeight = 0.2;
  const baseRadius = 0.2;
  const linkRadius = 0.05;
  const jointRadius = 0.08;
  
  // Calculate joint positions and rotations
  const calculateJointTransforms = () => {
    const transforms = [];
    let x = 0, y = baseHeight, z = 0;
    let cumulativeRotationY = 0; // For base rotation
    
    for (let i = 0; i < joints; i++) {
      const angle = (angles[i] || 0) * Math.PI / 180; // Convert to radians
      
      if (i === 0) {
        // Base joint - rotates around Y-axis (horizontal rotation)
        cumulativeRotationY = angle;
        transforms.push({
          position: [x, y, z],
          rotation: [0, angle, 0],
          isBase: true
        });
        y += segmentLength;
      } else if (i === 1) {
        // Shoulder joint - rotates around Z-axis (vertical movement)
        const cosY = Math.cos(cumulativeRotationY);
        const sinY = Math.sin(cumulativeRotationY);
        
        x += segmentLength * Math.cos(angle) * cosY;
        y += segmentLength * Math.sin(angle);
        z += segmentLength * Math.cos(angle) * sinY;
        
        transforms.push({
          position: [x, y, z],
          rotation: [0, cumulativeRotationY, angle],
          isBase: false
        });
      } else {
        // Other joints - alternate between horizontal and vertical movements
        const isHorizontalJoint = i % 2 === 0;
        const prevTransform = transforms[i - 1];
        
        if (isHorizontalJoint) {
          // Horizontal movement (around Y-axis)
          const cosY = Math.cos(cumulativeRotationY + angle);
          const sinY = Math.sin(cumulativeRotationY + angle);
          
          x += segmentLength * cosY;
          z += segmentLength * sinY;
        } else {
          // Vertical movement (around Z-axis)
          const cosY = Math.cos(cumulativeRotationY);
          const sinY = Math.sin(cumulativeRotationY);
          
          x += segmentLength * Math.cos(angle) * cosY;
          y += segmentLength * Math.sin(angle);
          z += segmentLength * Math.cos(angle) * sinY;
        }
        
        transforms.push({
          position: [x, y, z],
          rotation: [0, cumulativeRotationY, isHorizontalJoint ? 0 : angle],
          isBase: false
        });
      }
    }
    
    return transforms;
  };

  const jointTransforms = calculateJointTransforms();

  return (
    <group ref={groupRef}>
      {/* Base Platform */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[baseRadius, baseRadius, baseHeight]} />
        <meshStandardMaterial color="#1a202c" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Joint assemblies */}
      {jointTransforms.map((transform, index) => {
        const [x, y, z] = transform.position;
        const [rx, ry, rz] = transform.rotation;
        
        return (
          <group key={index} position={[x, y, z]} rotation={[rx, ry, rz]}>
            {/* Joint housing */}
            <mesh>
              <cylinderGeometry args={[jointRadius, jointRadius, 0.1]} />
              <meshStandardMaterial 
                color={index === 0 ? "#2d3748" : "#4a5568"} 
                metalness={0.7} 
                roughness={0.3} 
              />
            </mesh>
            
            {/* Joint indicator */}
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.02, 0.02, jointRadius * 1.5]} />
              <meshStandardMaterial color="#e53e3e" />
            </mesh>

            {/* Link to next joint */}
            {index < jointTransforms.length - 1 && (
              <mesh position={[0, segmentLength / 2, 0]}>
                <cylinderGeometry args={[linkRadius, linkRadius, segmentLength]} />
                <meshStandardMaterial color="#2b6cb0" metalness={0.6} roughness={0.4} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* End Effector */}
      {jointTransforms.length > 0 && (
        <group position={jointTransforms[jointTransforms.length - 1].position}>
          <mesh>
            <boxGeometry args={[0.12, 0.08, 0.12]} />
            <meshStandardMaterial color="#38a169" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Gripper indicators */}
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.04, 0.06, 0.02]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>
          <mesh position={[-0.08, 0, 0]}>
            <boxGeometry args={[0.04, 0.06, 0.02]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>
        </group>
      )}

      {/* Work area indicator */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[maxReach / 1200, maxReach / 1000, 32]} />
        <meshBasicMaterial color="#805ad5" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
