import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { Text } from '@react-three/drei';
import { MathUtils } from 'three';
import useVRStore from '../../store/vrStore';

// Available gesture animations
export const GESTURES = {
  WAVE: 'wave',
  THUMBS_UP: 'thumbsUp',
  CLAP: 'clap',
  RAISE_HAND: 'raiseHand',
  AGREE: 'agree',
  DISAGREE: 'disagree',
};

// Gesture Menu Component
export const GestureMenu = ({ onSelectGesture, position = [0, 0, 0], visible = false }) => {
  if (!visible) return null;
  
  const gestures = [
    { id: GESTURES.WAVE, label: '👋 Wave' },
    { id: GESTURES.THUMBS_UP, label: '👍 Thumbs Up' },
    { id: GESTURES.CLAP, label: '👏 Clap' },
    { id: GESTURES.RAISE_HAND, label: '✋ Raise Hand' },
    { id: GESTURES.AGREE, label: '✅ Agree' },
    { id: GESTURES.DISAGREE, label: '❌ Disagree' },
  ];
  
  return (
    <group position={position}>
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        backgroundColor="#000000"
        backgroundOpacity={0.5}
        padding={0.05}
      >
        Select Gesture
      </Text>
      
      <group position={[0, 0, 0]}>
        {gestures.map((gesture, index) => {
          // Arrange in a 3x2 grid
          const row = Math.floor(index / 2);
          const col = index % 2;
          const x = col * 0.8 - 0.4;
          const y = -row * 0.5 + 0.15;
          
          return (
            <Interactive
              key={gesture.id}
              onSelect={() => onSelectGesture(gesture.id)}
            >
              <group position={[x, y, 0]}>
                <mesh>
                  <boxGeometry args={[0.7, 0.4, 0.05]} />
                  <meshStandardMaterial 
                    color="#2196f3" 
                    transparent 
                    opacity={0.8} 
                  />
                </mesh>
                <Text
                  position={[0, 0, 0.03]}
                  fontSize={0.11}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {gesture.label}
                </Text>
              </group>
            </Interactive>
          );
        })}
      </group>
    </group>
  );
};

// Avatar Gesture System
export const useAvatarGestures = (avatarId) => {
  const [activeGesture, setActiveGesture] = useState(null);
  const [gestureProgress, setGestureProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const gestureTimer = useRef(null);
  
  const updateAvatarGesture = useVRStore(state => state.updateAvatarGesture);
  
  useEffect(() => {
    if (activeGesture) {
      // Update the global store with current gesture
      updateAvatarGesture(avatarId, activeGesture);
      
      // Clear any existing timer
      if (gestureTimer.current) clearTimeout(gestureTimer.current);
      
      // Set a timer to clear the gesture after 3 seconds
      gestureTimer.current = setTimeout(() => {
        setActiveGesture(null);
        updateAvatarGesture(avatarId, null);
      }, 3000);
      
      // Reset progress
      setGestureProgress(0);
    }
    
    return () => {
      if (gestureTimer.current) clearTimeout(gestureTimer.current);
    };
  }, [activeGesture, avatarId, updateAvatarGesture]);
  
  // Update animation progress
  useFrame((state, delta) => {
    if (activeGesture) {
      setGestureProgress(prev => {
        // Progress from 0 to 1 over 3 seconds
        const newProgress = Math.min(prev + delta / 3, 1);
        return newProgress;
      });
    }
  });
  
  const playGesture = (gestureId) => {
    setActiveGesture(gestureId);
    setIsMenuOpen(false);
  };
  
  const toggleGestureMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return {
    activeGesture,
    gestureProgress,
    isMenuOpen,
    playGesture,
    toggleGestureMenu
  };
};

// Component to render gesture effects on an avatar
export const AvatarGestureEffect = ({ gesture, progress, position = [0, 0, 0] }) => {
  if (!gesture) return null;
  
  // Simple emoji for the gesture
  const getEmoji = () => {
    switch (gesture) {
      case GESTURES.WAVE: return '👋';
      case GESTURES.THUMBS_UP: return '👍';
      case GESTURES.CLAP: return '👏';
      case GESTURES.RAISE_HAND: return '✋';
      case GESTURES.AGREE: return '✅';
      case GESTURES.DISAGREE: return '❌';
      default: return '?';
    }
  };
  
  // Animation parameters based on gesture type
  const getAnimationParams = () => {
    switch (gesture) {
      case GESTURES.WAVE: 
        return {
          position: [0, 1.8 + Math.sin(progress * Math.PI * 4) * 0.1, 0],
          rotation: [0, 0, Math.sin(progress * Math.PI * 8) * 0.5],
          scale: 1 + Math.sin(progress * Math.PI) * 0.2
        };
      case GESTURES.THUMBS_UP:
        return {
          position: [0, 1.8 + progress * 0.3, 0],
          rotation: [0, 0, 0],
          scale: 1 + progress * 0.5
        };
      case GESTURES.CLAP:
        return {
          position: [0, 1.8, 0],
          rotation: [0, 0, Math.sin(progress * Math.PI * 12) * 0.2],
          scale: 1 + Math.sin(progress * Math.PI * 12) * 0.2
        };
      case GESTURES.RAISE_HAND:
        return {
          position: [0, 1.8 + progress * 0.5, 0],
          rotation: [0, 0, 0],
          scale: 1 + Math.sin(progress * Math.PI * 2) * 0.1
        };
      case GESTURES.AGREE:
        return {
          position: [0, 1.8 + Math.sin(progress * Math.PI * 2) * 0.1, 0],
          rotation: [0, 0, 0],
          scale: 1 + Math.sin(progress * Math.PI * 2) * 0.3
        };
      case GESTURES.DISAGREE:
        return {
          position: [0, 1.8 + Math.sin(progress * Math.PI * 2) * 0.1, 0],
          rotation: [0, 0, Math.sin(progress * Math.PI * 6) * 0.4],
          scale: 1 + Math.sin(progress * Math.PI * 2) * 0.2
        };
      default:
        return { position: [0, 1.8, 0], rotation: [0, 0, 0], scale: 1 };
    }
  };
  
  const animParams = getAnimationParams();
  const finalPosition = [
    position[0] + animParams.position[0],
    position[1] + animParams.position[1],
    position[2] + animParams.position[2]
  ];
  
  return (
    <group position={finalPosition} rotation={animParams.rotation}>
      <Text
        fontSize={0.3 * animParams.scale}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {getEmoji()}
      </Text>
    </group>
  );
};

// Gesture Button Component for quick access
export const GestureButton = ({ onToggleMenu, position = [0, 0, 0] }) => {
  return (
    <Interactive onSelect={onToggleMenu}>
      <group position={position}>
        <mesh>
          <boxGeometry args={[0.4, 0.4, 0.05]} />
          <meshStandardMaterial color="#2196f3" />
        </mesh>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          😀
        </Text>
      </group>
    </Interactive>
  );
}; 