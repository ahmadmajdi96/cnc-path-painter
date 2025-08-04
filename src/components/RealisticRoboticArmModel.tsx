
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
  const segmentLength = (maxReach / 1000) / Math.max(joints, 1); // Convert to meters
  
  // Ensure we have angles for all joints (2 angles per joint: horizontal and vertical)
  const angles = Array(joints * 2).fill(0).map((_, i) => jointAngles[i] || 0);
  
  // Base configuration
  const baseHeight = 0.25;
  const baseRadius = 0.25;
  const linkRadius = 0.04;
  const jointRadius = 0.08;
  const linkLength = segmentLength;
  
  // Calculate joint positions and rotations with proper forward kinematics
  const calculateJointTransforms = () => {
    const transforms = [];
    let currentTransform = new THREE.Matrix4();
    
    for (let i = 0; i < joints; i++) {
      const horizontalAngle = (angles[i * 2] || 0) * Math.PI / 180; // First angle - horizontal
      const verticalAngle = (angles[i * 2 + 1] || 0) * Math.PI / 180; // Second angle - vertical
      
      if (i === 0) {
        // Base joint - starts at base height
        const translation = new THREE.Matrix4().makeTranslation(0, baseHeight, 0);
        const rotationY = new THREE.Matrix4().makeRotationY(horizontalAngle);
        const rotationZ = new THREE.Matrix4().makeRotationZ(verticalAngle);
        currentTransform.multiplyMatrices(translation, rotationY);
        currentTransform.multiply(rotationZ);
      } else {
        // Subsequent joints - move along local Z axis then rotate
        const translation = new THREE.Matrix4().makeTranslation(0, 0, linkLength);
        const rotationY = new THREE.Matrix4().makeRotationY(horizontalAngle);
        const rotationZ = new THREE.Matrix4().makeRotationZ(verticalAngle);
        
        currentTransform.multiply(translation);
        currentTransform.multiply(rotationY);
        currentTransform.multiply(rotationZ);
      }
      
      // Extract position and rotation from transform matrix
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      currentTransform.decompose(position, quaternion, scale);
      
      const euler = new THREE.Euler().setFromQuaternion(quaternion);
      
      transforms.push({
        position: [position.x, position.y, position.z],
        rotation: [euler.x, euler.y, euler.z],
        horizontalAngle,
        verticalAngle
      });
    }
    
    return transforms;
  };

  const jointTransforms = calculateJointTransforms();

  return (
    <group ref={groupRef}>
      {/* Base Platform */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[baseRadius, baseRadius, baseHeight]} />
        <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Base top plate */}
      <mesh position={[0, baseHeight/2 + 0.02, 0]}>
        <cylinderGeometry args={[baseRadius * 0.8, baseRadius * 0.8, 0.04]} />
        <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Joint assemblies and links */}
      {jointTransforms.map((transform, index) => {
        const [x, y, z] = transform.position;
        const [rx, ry, rz] = transform.rotation;
        
        return (
          <group key={index}>
            {/* Link from previous joint (except for first joint) */}
            {index > 0 && (
              <group 
                position={[
                  (jointTransforms[index-1].position[0] + x) / 2,
                  (jointTransforms[index-1].position[1] + y) / 2,
                  (jointTransforms[index-1].position[2] + z) / 2
                ]}
              >
                <mesh
                  lookAt={[x, y, z]}
                  rotation={[Math.PI/2, 0, 0]}
                >
                  <cylinderGeometry args={[linkRadius, linkRadius, linkLength]} />
                  <meshStandardMaterial color="#3182ce" metalness={0.6} roughness={0.4} />
                </mesh>
              </group>
            )}
            
            {/* Joint housing */}
            <group position={[x, y, z]} rotation={[rx, ry, rz]}>
              {/* Main joint body */}
              <mesh>
                <cylinderGeometry args={[jointRadius, jointRadius, 0.12]} />
                <meshStandardMaterial 
                  color={index === 0 ? "#2b6cb0" : "#4299e1"} 
                  metalness={0.7} 
                  roughness={0.3} 
                />
              </mesh>
              
              {/* Horizontal rotation indicator */}
              <mesh position={[0, 0.07, 0]} rotation={[0, transform.horizontalAngle, 0]}>
                <boxGeometry args={[0.03, 0.02, jointRadius * 1.2]} />
                <meshStandardMaterial color="#e53e3e" />
              </mesh>
              
              {/* Vertical rotation indicator */}
              <mesh position={[jointRadius * 0.6, 0, 0]} rotation={[0, 0, transform.verticalAngle]}>
                <boxGeometry args={[0.02, 0.03, 0.02]} />
                <meshStandardMaterial color="#38a169" />
              </mesh>
              
              {/* Joint connection ring */}
              <mesh>
                <torusGeometry args={[jointRadius * 0.7, 0.02, 8, 16]} />
                <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* End Effector */}
      {jointTransforms.length > 0 && (
        <group position={jointTransforms[jointTransforms.length - 1].position}>
          {/* End effector body */}
          <mesh>
            <boxGeometry args={[0.15, 0.1, 0.15]} />
            <meshStandardMaterial color="#38a169" metalness={0.5} roughness={0.3} />
          </mesh>
          
          {/* Gripper jaws */}
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.05, 0.08, 0.03]} />
            <meshStandardMaterial color="#2d3748" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[-0.1, 0, 0]}>
            <boxGeometry args={[0.05, 0.08, 0.03]} />
            <meshStandardMaterial color="#2d3748" metalness={0.6} roughness={0.4} />
          </mesh>
          
          {/* Tool tip indicator */}
          <mesh position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.02]} />
            <meshStandardMaterial color="#f56565" emissive="#f56565" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}

      {/* Work area indicator */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[maxReach / 1200, maxReach / 1000, 64]} />
        <meshBasicMaterial color="#805ad5" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Grid reference */}
      <gridHelper args={[maxReach / 500, 10]} position={[0, 0.005, 0]} />
    </group>
  );
}
