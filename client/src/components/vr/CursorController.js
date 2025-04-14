import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useController, useXR } from '@react-three/xr';
import * as THREE from 'three';

/**
 * Enhanced cursor controller for VR pointer interactions
 * Handles raycast interactions with objects in the environment
 */
export const CursorController = () => {
  const rightController = useController('right');
  const { isPresenting } = useXR();
  const { scene, camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const cursorRef = useRef();
  const [hit, setHit] = useState(false);
  const [distance, setDistance] = useState(0);
  const lineRef = useRef();
  
  // Update raycaster on each frame - moved hook before conditional return
  useFrame(() => {
    if (!isPresenting || !rightController || !cursorRef.current || !lineRef.current) return;
    
    // Update line starting point to match controller
    const controllerMatrix = rightController.controller.matrixWorld;
    const start = new THREE.Vector3().setFromMatrixPosition(controllerMatrix);
    
    // Set direction from controller orientation
    const tempMatrix = new THREE.Matrix4().makeRotationFromQuaternion(
      rightController.controller.quaternion
    );
    const direction = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix);
    
    // Position the ray
    raycaster.current.set(start, direction.normalize());
    
    // Find intersections with interactable objects
    const intersects = raycaster.current.intersectObjects(
      scene.children, true
    );
    
    if (intersects.length > 0) {
      // Check if object is interactable
      const interactable = intersects[0].object.userData.interactable || 
                           intersects[0].object.parent?.userData.interactable;
      
      const hitPoint = intersects[0].point;
      const hitDistance = intersects[0].distance;
      
      // Update cursor position
      cursorRef.current.position.copy(hitPoint);
      setDistance(hitDistance);
      
      // Update cursor appearance based on hit
      if (interactable) {
        setHit(true);
        cursorRef.current.material.color.set('#4CAF50');
      } else {
        setHit(false);
        cursorRef.current.material.color.set('#FFFFFF');
      }
      
      // Update line geometry to extend to hit point
      const points = [start, hitPoint];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = lineGeometry;
    } else {
      // If no hit, position cursor at a fixed distance
      const defaultDistance = 5;
      const targetPosition = new THREE.Vector3()
        .copy(start)
        .add(direction.multiplyScalar(defaultDistance));
      
      cursorRef.current.position.copy(targetPosition);
      setHit(false);
      cursorRef.current.material.color.set('#FFFFFF');
      
      // Update line to extend to default position
      const points = [start, targetPosition];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = lineGeometry;
    }
  });
  
  // Skip rendering if not in VR mode or no controller
  if (!isPresenting || !rightController) return null;
  
  return (
    <group>
      {/* Cursor dot */}
      <mesh ref={cursorRef}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" opacity={0.8} transparent />
      </mesh>
      
      {/* Laser line */}
      <line ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#FFFFFF" opacity={0.6} transparent />
      </line>
    </group>
  );
};

export default CursorController; 