import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR, Interactive } from '@react-three/xr';
import { Text, Html } from '@react-three/drei';
import { MicOff, VideocamOff } from '@mui/icons-material';
import * as THREE from 'three';

// Enhanced SimpleAvatar with animations and customization
export const SimpleAvatar = ({ 
  position = [0, 0, 0], 
  color = '#4FC3F7', 
  scale = 1,
  name = 'User',
  isMuted = false,
  isVideoOff = true,
  stream = null,
  style = 'robot', // 'robot', 'human', 'ghost', 'cube'
  emote = null // null, 'wave', 'jump', 'dance'
}) => {
  const groupRef = useRef();
  const videoRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  const armLeftRef = useRef();
  const armRightRef = useRef();
  const legLeftRef = useRef();
  const legRightRef = useRef();
  
  const [hoverState, setHoverState] = useState(false);
  const [speechIntensity, setSpeechIntensity] = useState(0);
  const [emoteProgress, setEmoteProgress] = useState(0);
  const [emoteActive, setEmoteActive] = useState(emote);
  const [bobOffset, setBobOffset] = useState(0);
  const [prevPosition, setPrevPosition] = useState(position);
  const [movementDirection, setMovementDirection] = useState([0, 0, 0]);
  const [isMoving, setIsMoving] = useState(false);
  const { isPresenting } = useXR();
  
  // Track position changes for movement animation
  useEffect(() => {
    // Calculate direction vector between previous and current position
    const dx = position[0] - prevPosition[0];
    const dy = position[1] - prevPosition[1];
    const dz = position[2] - prevPosition[2];
    
    // Check if significant movement has occurred (more than 0.01 units)
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    if (distance > 0.01) {
      setIsMoving(true);
      setMovementDirection([dx/distance, dy/distance, dz/distance]);
      // Reset to false after a delay (simulates motion stopping)
      const timeout = setTimeout(() => setIsMoving(false), 100);
      return () => clearTimeout(timeout);
    }
    
    setPrevPosition(position);
  }, [position, prevPosition]);
  
  // Start emote animation if emote prop changes
  useEffect(() => {
    if (emote) {
      setEmoteActive(emote);
      setEmoteProgress(0);
    }
  }, [emote]);
  
  // Audio visualization
  useEffect(() => {
    let animationFrame;
    let audioContext;
    let analyser;
    let source;
    
    if (stream && !isMuted) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 32;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateSpeechIntensity = () => {
          analyser.getByteFrequencyData(dataArray);
          // Get average frequency volume
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          // Map 0-255 to 0-1 with some dampening
          setSpeechIntensity(Math.min(average / 128, 1));
          
          animationFrame = requestAnimationFrame(updateSpeechIntensity);
        };
        
        updateSpeechIntensity();
      } catch (err) {
        console.error("Error setting up audio visualization:", err);
      }
    }
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (source) source.disconnect();
      if (audioContext) audioContext.close();
    };
  }, [stream, isMuted]);
  
  // Animate the avatar
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // 1. Update position directly from props
    if (groupRef.current) {
      groupRef.current.position.x = position[0];
      groupRef.current.position.y = position[1];
      groupRef.current.position.z = position[2];
    }
    
    // 2. Idle animation - gentle floating/bobbing (only when not moving)
    if (!isMoving) {
      setBobOffset(prev => {
        const newOffset = prev + delta * 1.5;
        // Add gentle hover movement to the position
        if (groupRef.current) {
          groupRef.current.position.y += Math.sin(newOffset) * 0.005;
        }
        return newOffset;
      });
    }
    
    // 3. Movement animation
    if (isMoving && bodyRef.current) {
      // Slight body lean in direction of movement
      if (Math.abs(movementDirection[0]) > 0.5) {
        // Leaning left/right for x movement
        bodyRef.current.rotation.z = -movementDirection[0] * 0.2;
      } else if (Math.abs(movementDirection[2]) > 0.5) {
        // Leaning forward/back for z movement
        bodyRef.current.rotation.x = movementDirection[2] * 0.2;
      }
      
      // Animate legs when moving
      if (legLeftRef.current && legRightRef.current) {
        const walkCycle = Date.now() % 1000 / 500 * Math.PI;
        legLeftRef.current.rotation.x = Math.sin(walkCycle) * 0.4;
        legRightRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.4;
      }
    } else if (bodyRef.current) {
      // Reset body rotation when not moving
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, delta * 5);
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 5);
      
      // Reset leg positions
      if (legLeftRef.current && legRightRef.current) {
        legLeftRef.current.rotation.x = THREE.MathUtils.lerp(legLeftRef.current.rotation.x, 0, delta * 5);
        legRightRef.current.rotation.x = THREE.MathUtils.lerp(legRightRef.current.rotation.x, 0, delta * 5);
      }
    }
    
    // 4. Emote animations
    if (emoteActive) {
      setEmoteProgress(prev => {
        const newProgress = prev + delta;
        
        switch (emoteActive) {
          case 'wave':
            // Wave right arm
            if (armRightRef.current) {
              armRightRef.current.rotation.z = Math.sin(newProgress * 10) * 0.5;
              armRightRef.current.rotation.x = 0.5;
            }
            // Reset after 2 seconds
            if (newProgress > 2) {
              setEmoteActive(null);
              if (armRightRef.current) {
                armRightRef.current.rotation.z = 0;
                armRightRef.current.rotation.x = 0;
              }
              return 0;
            }
            break;
            
          case 'jump':
            // Jump up and down
            if (groupRef.current) {
              const jumpHeight = Math.sin(Math.min(newProgress * 6, Math.PI)) * 0.5;
              groupRef.current.position.y = position[1] + jumpHeight;
            }
            // Reset after 1 second
            if (newProgress > 1) {
              setEmoteActive(null);
              return 0;
            }
            break;
            
          case 'dance':
            // Dance by rotating body and moving arms
            if (bodyRef.current) {
              bodyRef.current.rotation.y = Math.sin(newProgress * 8) * 0.3;
            }
            if (armLeftRef.current) {
              armLeftRef.current.rotation.z = Math.sin(newProgress * 8) * 0.5;
            }
            if (armRightRef.current) {
              armRightRef.current.rotation.z = -Math.sin(newProgress * 8) * 0.5;
            }
            if (legLeftRef.current) {
              legLeftRef.current.position.z = Math.sin(newProgress * 8) * 0.1;
            }
            if (legRightRef.current) {
              legRightRef.current.position.z = -Math.sin(newProgress * 8) * 0.1;
            }
            // Reset after 3 seconds
            if (newProgress > 3) {
              setEmoteActive(null);
              if (bodyRef.current) bodyRef.current.rotation.y = 0;
              if (armLeftRef.current) armLeftRef.current.rotation.z = 0;
              if (armRightRef.current) armRightRef.current.rotation.z = 0;
              if (legLeftRef.current) legLeftRef.current.position.z = 0;
              if (legRightRef.current) legRightRef.current.position.z = 0;
              return 0;
            }
            break;
            
          default:
            break;
        }
        
        return newProgress;
      });
    }
    
    // 5. Speaking animation - pulse the head slightly
    if (headRef.current && speechIntensity > 0.1) {
      headRef.current.scale.setScalar(1 + speechIntensity * 0.1);
    } else if (headRef.current) {
      headRef.current.scale.setScalar(1);
    }
  });
  
  // Handle video texture if stream available
  useEffect(() => {
    let videoElement;
    
    if (stream && !isVideoOff) {
      try {
        // Create video element if it doesn't exist
        if (!videoRef.current) {
          videoElement = document.createElement('video');
          videoElement.autoplay = true;
          videoElement.playsInline = true;
          videoElement.muted = true;
          videoRef.current = videoElement;
        }
        
        // Set the stream
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Error playing video stream:", err);
        });
      } catch (err) {
        console.error("Error setting up video:", err);
      }
    }
    
    return () => {
      if (videoElement) {
        if (videoElement.srcObject) {
          const tracks = videoElement.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }
        videoElement.srcObject = null;
      }
    };
  }, [stream, isVideoOff]);
  
  // Create different avatar styles
  const renderAvatarStyle = () => {
    switch (style) {
      case 'human':
        return (
          <group ref={bodyRef} scale={[scale, scale, scale]}>
            {/* Body */}
            <mesh position={[0, 0, 0]}>
              <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
              <meshStandardMaterial color={color} />
            </mesh>
            
            {/* Head */}
            <mesh ref={headRef} position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                {...(stream && !isVideoOff ? {
                  map: new THREE.VideoTexture(
                    videoRef.current || document.createElement('video')
                  )
                } : {})}
              />
            </mesh>
            
            {/* Left Arm */}
            <mesh ref={armLeftRef} position={[-0.35, 0.15, 0]}>
              <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
              <meshStandardMaterial color={color} />
            </mesh>
            
            {/* Right Arm */}
            <mesh ref={armRightRef} position={[0.35, 0.15, 0]}>
              <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
              <meshStandardMaterial color={color} />
            </mesh>
            
            {/* Left Leg */}
            <mesh ref={legLeftRef} position={[-0.15, -0.5, 0]}>
              <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
              <meshStandardMaterial color={color} />
            </mesh>
            
            {/* Right Leg */}
            <mesh ref={legRightRef} position={[0.15, -0.5, 0]}>
              <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
        
      case 'robot':
        return (
          <group ref={bodyRef} scale={[scale, scale, scale]}>
            {/* Body */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.5, 0.7, 0.3]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Head */}
            <mesh ref={headRef} position={[0, 0.55, 0]}>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial 
                color={color} 
                metalness={0.6} 
                roughness={0.3}
                {...(stream && !isVideoOff ? {
                  map: new THREE.VideoTexture(
                    videoRef.current || document.createElement('video')
                  )
                } : {})}
              />
            </mesh>
            
            {/* Eyes */}
            <mesh position={[-0.1, 0.55, 0.21]} scale={[0.06, 0.1, 0.02]}>
              <boxGeometry />
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.1, 0.55, 0.21]} scale={[0.06, 0.1, 0.02]}>
              <boxGeometry />
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
            </mesh>
            
            {/* Left Arm */}
            <mesh ref={armLeftRef} position={[-0.3, 0.1, 0]}>
              <boxGeometry args={[0.1, 0.6, 0.1]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Right Arm */}
            <mesh ref={armRightRef} position={[0.3, 0.1, 0]}>
              <boxGeometry args={[0.1, 0.6, 0.1]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Left Leg */}
            <mesh ref={legLeftRef} position={[-0.15, -0.6, 0]}>
              <boxGeometry args={[0.15, 0.5, 0.15]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Right Leg */}
            <mesh ref={legRightRef} position={[0.15, -0.6, 0]}>
              <boxGeometry args={[0.15, 0.5, 0.15]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
        
      case 'ghost':
        return (
          <group ref={bodyRef} scale={[scale, scale, scale]}>
            {/* Ghost body */}
            <mesh position={[0, 0, 0]}>
              <capsuleGeometry args={[0.3, 0.5, 8, 16]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.7} 
                emissive={color} 
                emissiveIntensity={0.2} 
              />
            </mesh>
            
            {/* Ghost head/face */}
            <mesh ref={headRef} position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.8}
                emissive={color}
                emissiveIntensity={0.3}
                {...(stream && !isVideoOff ? {
                  map: new THREE.VideoTexture(
                    videoRef.current || document.createElement('video')
                  )
                } : {})}
              />
            </mesh>
            
            {/* Eyes */}
            <mesh position={[-0.08, 0.35, 0.15]} scale={[0.05, 0.05, 0.02]}>
              <sphereGeometry />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[0.08, 0.35, 0.15]} scale={[0.05, 0.05, 0.02]}>
              <sphereGeometry />
              <meshStandardMaterial color="white" />
            </mesh>
            
            {/* Wispy bottom */}
            <mesh position={[-0.15, -0.3, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.5} 
                emissive={color} 
                emissiveIntensity={0.2} 
              />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.5} 
                emissive={color} 
                emissiveIntensity={0.2} 
              />
            </mesh>
            <mesh position={[0.15, -0.3, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.5} 
                emissive={color} 
                emissiveIntensity={0.2} 
              />
            </mesh>
          </group>
        );
        
      case 'cube':
      default:
        return (
          <group ref={bodyRef} scale={[scale, scale, scale]}>
            {/* Cube body */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <meshStandardMaterial 
                color={color}
                {...(stream && !isVideoOff ? {
                  map: new THREE.VideoTexture(
                    videoRef.current || document.createElement('video')
                  )
                } : {})}
              />
            </mesh>
          </group>
        );
    }
  };

  return (
    <Interactive 
      onHover={() => setHoverState(true)} 
      onBlur={() => setHoverState(false)}
    >
      <group 
        ref={groupRef} 
        position={position}
        scale={hoverState ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      >
        {renderAvatarStyle()}
        
        {/* Audio visualization */}
        {!isMuted && speechIntensity > 0.1 && (
          <mesh position={[0, 0.8, 0]} scale={[speechIntensity * 0.3, speechIntensity * 0.3, speechIntensity * 0.3]}>
            <sphereGeometry args={[1, 16, 8]} />
            <meshBasicMaterial color="#4fc3f7" wireframe transparent opacity={0.6} />
          </mesh>
        )}
        
        {/* Name display */}
        <Text
          position={[0, -0.8, 0]}
          rotation={[0, 0, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {name}
        </Text>
        
        {/* Status indicators */}
        <group position={[0, -0.6, 0]}>
          {isMuted && (
            <Html transform distanceFactor={8} position={[-0.2, 0, 0]}>
              <div style={{ 
                background: 'rgba(255,0,0,0.7)', 
                borderRadius: '50%', 
                padding: '5px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <MicOff style={{ color: 'white', fontSize: '12px' }} />
              </div>
            </Html>
          )}
          
          {isVideoOff && (
            <Html transform distanceFactor={8} position={[0.2, 0, 0]}>
              <div style={{ 
                background: 'rgba(0,0,0,0.7)', 
                borderRadius: '50%', 
                padding: '5px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <VideocamOff style={{ color: 'white', fontSize: '12px' }} />
              </div>
            </Html>
          )}
        </group>
        
        {/* Hidden video element for texture */}
        {stream && !isVideoOff && (
          <Html style={{ display: 'none' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
          </Html>
        )}
      </group>
    </Interactive>
  );
};

export default SimpleAvatar; 