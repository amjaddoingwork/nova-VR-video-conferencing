import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { Interactive, useXREvent } from '@react-three/xr';
import { Box, IconButton, Typography } from '@mui/material';
import { 
  Mood, 
  SportsMartialArts, 
  DirectionsRun, 
  Celebration, 
  ThumbUp, 
  PanTool, 
  SentimentVerySatisfied 
} from '@mui/icons-material';

// EmoteButton component for toggling emote menu
export const EmoteButton = ({ onClick, isOpen, position }) => {
  return (
    <group position={[position[0], position[1] + 1.5, position[2]]}>
      <Interactive onSelect={onClick}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={isOpen ? "#ffeb3b" : "#64b5f6"} />
        </mesh>
      </Interactive>
      <Html position={[0, 0, 0]} transform distanceFactor={10} center>
        <IconButton 
          onClick={onClick}
          sx={{ 
            backgroundColor: isOpen ? 'rgba(255, 235, 59, 0.8)' : 'rgba(100, 181, 246, 0.8)',
            '&:hover': { backgroundColor: isOpen ? 'rgba(255, 235, 59, 1)' : 'rgba(100, 181, 246, 1)' },
            padding: '4px'
          }}
        >
          <SentimentVerySatisfied sx={{ color: 'white' }} />
        </IconButton>
      </Html>
    </group>
  );
};

// Hook for managing emotes
export const useAvatarEmotes = (vrStore) => {
  const [currentEmote, setCurrentEmote] = useState(null);
  
  const triggerEmote = (emote) => {
    setCurrentEmote(emote);
    vrStore.updateAvatarEmote(vrStore.localParticipant.id, emote);
  };
  
  return { currentEmote, triggerEmote };
};

// Main EmoteMenu component with circular arrangement
export const EmoteMenu = ({ position, vrStore }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { triggerEmote } = useAvatarEmotes(vrStore);
  
  // Toggle menu open/closed
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Close menu on emote selection
  const handleEmoteSelect = (emote) => {
    triggerEmote(emote);
    setIsOpen(false);
  };
  
  // Define available emotes
  const emotes = [
    { name: 'wave', icon: <PanTool />, label: 'Wave' },
    { name: 'dance', icon: <Celebration />, label: 'Dance' },
    { name: 'jump', icon: <DirectionsRun />, label: 'Jump' },
    { name: 'thumbsUp', icon: <ThumbUp />, label: 'Thumbs Up' },
    { name: 'laugh', icon: <Mood />, label: 'Laugh' }
  ];
  
  // Calculate positions in a circle
  const getEmotePosition = (index, total) => {
    const radius = 0.4;
    const angle = (index / total) * Math.PI * 2;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    return [x, 0, z];
  };
  
  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Toggle button */}
      <EmoteButton 
        onClick={toggleMenu} 
        isOpen={isOpen} 
        position={position}
      />
      
      {/* Emote circle menu */}
      {isOpen && (
        <group position={[0, 1.5, 0]}>
          {emotes.map((emote, index) => {
            const [x, y, z] = getEmotePosition(index, emotes.length);
            return (
              <group key={emote.name} position={[x, y, z]}>
                <Interactive onSelect={() => handleEmoteSelect(emote.name)}>
                  <mesh>
                    <sphereGeometry args={[0.07, 16, 16]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                </Interactive>
                <Html position={[0, 0, 0]} transform distanceFactor={10} center>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton 
                      onClick={() => handleEmoteSelect(emote.name)}
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                        padding: '4px'
                      }}
                    >
                      {emote.icon}
                    </IconButton>
                    <Typography variant="caption" sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                      color: 'white',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      fontSize: '8px'
                    }}>
                      {emote.label}
                    </Typography>
                  </Box>
                </Html>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
};

export default EmoteMenu; 