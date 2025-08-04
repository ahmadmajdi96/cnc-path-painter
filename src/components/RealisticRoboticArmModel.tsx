import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface RealisticRoboticArmProps {
  joints: number;
  jointAngles: number[];
  maxReach: number;
  targetPosition?: [number, number, number];
}

export function RealisticRoboticArmModel({ joints, jointAngles, maxReach, targetPosition }: RealisticRoboticArmProps) {
  const groupRef = useRef<THREE.Group>(null);
  const segmentLength = (maxReach / 800) / Math.max(joints, 1);
  
  // Calculate joint angles based on target position if provided
  const calculateInverseKinematics = (target: [number, number, number]) => {
    const [targetX, targetY, targetZ] = target;
    const angles = [...jointAngles];
    
    if (joints >= 2) {
      // First joint: horizontal rotation only (around Y axis) to point towards target
      const horizontalAngle = Math.atan2(targetX, targetZ) * 180 / Math.PI;
      angles[0] = horizontalAngle;
      
      // Second joint: vertical rotation only (around Z axis) to reach target height
      const horizontalDistance = Math.sqrt(targetX * targetX + targetZ * targetZ);
      const heightDiff = targetY - 0.2; // Subtract base height
      const verticalAngle = Math.atan2(heightDiff, horizontalDistance) * 180 / Math.PI;
      angles[3] = verticalAngle; // Second joint vertical angle (index 3)
      
      // Keep other joints as provided
      for (let i = 2; i < joints; i++) {
        if (angles[i * 2] === undefined) angles[i * 2] = 0;
        if (angles[i * 2 + 1] === undefined) angles[i * 2 + 1] = 0;
      }
    }
    
    return angles;
  };
  
  // Use inverse kinematics if target position is provided
  const finalAngles = targetPosition ? calculateInverseKinematics(targetPosition) : jointAngles;
  
  // Ensure we have angles for all joints (2 angles per joint: horizontal and vertical)
  const angles = Array(joints * 2).fill(0).map((_, i) => finalAngles[i] || 0);
  
  // Base configuration - smaller joints, thinner connectors
  const baseHeight = 0.2;
  const baseRadius = 0.2;
  const linkRadius = 0.025; // Thinner connectors
  const jointRadius = 0.05; // Smaller joints
  const linkLength = segmentLength;
  
  // Calculate joint positions and rotations with proper forward kinematics
  const calculateJointTransforms = () => {
    const transforms = [];
    let currentTransform = new THREE.Matrix4();
    
    for (let i = 0; i < joints; i++) {
      let horizontalAngle = 0;
      let verticalAngle = 0;
      
      // First joint: only horizontal movement + fixed 75-degree vertical rotation
      if (i === 0) {
        horizontalAngle = (angles[i * 2] || 0) * Math.PI / 180;
        verticalAngle = 75 * Math.PI / 180; // Fixed 75-degree vertical rotation
      }
      // Second joint: only vertical movement  
      else if (i === 1) {
        horizontalAngle = 0; // Fixed horizontal
        verticalAngle = (angles[i * 2 + 1] || 0) * Math.PI / 180;
      }
      // Other joints: both movement directions
      else {
        horizontalAngle = (angles[i * 2] || 0) * Math.PI / 180;
        verticalAngle = (angles[i * 2 + 1] || 0) * Math.PI / 180;
      }
      
      if (i === 0) {
        // Base joint - starts at base height with fixed vertical rotation
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

  // Helper function to create link geometry between two points
  const createLinkGeometry = (start: THREE.Vector3, end: THREE.Vector3) => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    // Calculate rotation to align cylinder with direction
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize());
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    
    return { center, length, rotation: euler };
  };

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

      {/* Target position indicator */}
      {targetPosition && (
        <mesh position={targetPosition}>
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Joint assemblies and links */}
      {jointTransforms.map((transform, index) => {
        const [x, y, z] = transform.position;
        const [rx, ry, rz] = transform.rotation;
        
        return (
          <group key={index}>
            {/* Link from previous joint (except for first joint) - thinner and longer */}
            {index > 0 && (
              (() => {
                const startPos = new THREE.Vector3(...jointTransforms[index-1].position);
                const endPos = new THREE.Vector3(x, y, z);
                const linkGeom = createLinkGeometry(startPos, endPos);
                
                return (
                  <mesh 
                    position={[linkGeom.center.x, linkGeom.center.y, linkGeom.center.z]}
                    rotation={[linkGeom.rotation.x, linkGeom.rotation.y, linkGeom.rotation.z]}
                  >
                    <cylinderGeometry args={[linkRadius, linkRadius, linkGeom.length]} />
                    <meshStandardMaterial color="#3182ce" metalness={0.6} roughness={0.4} />
                  </mesh>
                );
              })()
            )}
            
            {/* Joint housing - smaller and circular */}
            <group position={[x, y, z]} rotation={[rx, ry, rz]}>
              {/* Main joint body - smaller circular design */}
              <mesh>
                <sphereGeometry args={[jointRadius, 16, 16]} />
                <meshStandardMaterial 
                  color={index === 0 ? "#2b6cb0" : "#4299e1"} 
                  metalness={0.7} 
                  roughness={0.3} 
                />
              </mesh>
              
              {/* Joint ring for mechanical detail */}
              <mesh>
                <torusGeometry args={[jointRadius * 0.9, jointRadius * 0.15, 8, 16]} />
                <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.1} />
              </mesh>
              
              {/* Movement indicators based on joint constraints */}
              {index === 0 && (
                <>
                  {/* Horizontal movement indicator */}
                  <mesh position={[0, jointRadius * 1.2, 0]} rotation={[0, transform.horizontalAngle, 0]}>
                    <boxGeometry args={[0.02, 0.015, jointRadius * 0.8]} />
                    <meshStandardMaterial color="#e53e3e" />
                  </mesh>
                  {/* Fixed vertical indicator (75 degrees) */}
                  <mesh position={[jointRadius * 0.8, 0, 0]} rotation={[0, 0, 75 * Math.PI / 180]}>
                    <boxGeometry args={[0.015, 0.02, 0.015]} />
                    <meshStandardMaterial color="#ffa500" />
                  </mesh>
                </>
              )}
              
              {index === 1 && (
                // Second joint: only vertical movement indicator
                <mesh position={[jointRadius * 0.8, 0, 0]} rotation={[0, 0, transform.verticalAngle]}>
                  <boxGeometry args={[0.015, 0.02, 0.015]} />
                  <meshStandardMaterial color="#38a169" />
                </mesh>
              )}
              
              {index > 1 && (
                // Other joints: both movement indicators
                <>
                  <mesh position={[0, jointRadius * 1.2, 0]} rotation={[0, transform.horizontalAngle, 0]}>
                    <boxGeometry args={[0.02, 0.015, jointRadius * 0.8]} />
                    <meshStandardMaterial color="#e53e3e" />
                  </mesh>
                  <mesh position={[jointRadius * 0.8, 0, 0]} rotation={[0, 0, transform.verticalAngle]}>
                    <boxGeometry args={[0.015, 0.02, 0.015]} />
                    <meshStandardMaterial color="#38a169" />
                  </mesh>
                </>
              )}
              
              {/* Dual movement levers - adjusted for joint constraints */}
              {index === 0 && (
                <>
                  {/* Horizontal lever */}
                  <mesh position={[0, jointRadius + 0.03, 0]} rotation={[0, transform.horizontalAngle, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.06]} />
                    <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.2} />
                  </mesh>
                  {/* Fixed vertical lever (75 degrees) */}
                  <mesh position={[0, 0, jointRadius + 0.03]} rotation={[75 * Math.PI / 180, 0, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.06]} />
                    <meshStandardMaterial color="#ff8c00" metalness={0.8} roughness={0.2} />
                  </mesh>
                </>
              )}
              
              {index === 1 && (
                // Second joint: only vertical lever
                <mesh position={[0, 0, jointRadius + 0.03]} rotation={[transform.verticalAngle, 0, 0]}>
                  <cylinderGeometry args={[0.01, 0.01, 0.06]} />
                  <meshStandardMaterial color="#059669" metalness={0.8} roughness={0.2} />
                </mesh>
              )}
              
              {index > 1 && (
                // Other joints: both levers
                <>
                  <mesh position={[0, jointRadius + 0.03, 0]} rotation={[0, transform.horizontalAngle, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.06]} />
                    <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.2} />
                  </mesh>
                  <mesh position={[0, 0, jointRadius + 0.03]} rotation={[transform.verticalAngle, 0, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.06]} />
                    <meshStandardMaterial color="#059669" metalness={0.8} roughness={0.2} />
                  </mesh>
                </>
              )}
            </group>
          </group>
        );
      })}

      {/* End Effector - adjusted size */}
      {jointTransforms.length > 0 && (
        <group position={jointTransforms[jointTransforms.length - 1].position}>
          {/* End effector body */}
          <mesh>
            <boxGeometry args={[0.1, 0.08, 0.1]} />
            <meshStandardMaterial color="#38a169" metalness={0.5} roughness={0.3} />
          </mesh>
          
          {/* Gripper jaws */}
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.04, 0.06, 0.02]} />
            <meshStandardMaterial color="#2d3748" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[-0.08, 0, 0]}>
            <boxGeometry args={[0.04, 0.06, 0.02]} />
            <meshStandardMaterial color="#2d3748" metalness={0.6} roughness={0.4} />
          </mesh>
          
          {/* Tool tip indicator */}
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.015]} />
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
