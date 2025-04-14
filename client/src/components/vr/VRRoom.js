import React, { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Text, 
  useFBX, 
  useGLTF, 
  Html,
  useAnimations,
  PerspectiveCamera,
  PositionalAudio,
  Plane,
  RoundedBox,
  Line,
  Sky,
  Stars,
  Texture,
} from '@react-three/drei';
import { XR, Controllers, Hands, useXR, useController, Interactive } from '@react-three/xr';
import { Box, IconButton, Typography, Button } from '@mui/material';
import { MicOff, Mic, VideocamOff, Videocam, Warning } from '@mui/icons-material';
import useVRStore from '../../store/vrStore';
import BasicRoom from './BasicRoom';
import { Vector3, MathUtils, Raycaster } from 'three';
import * as THREE from 'three';
// Import FBXLoader from three.js
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { getRoom } from './RoomTemplates';
import { 
  GestureMenu, 
  GestureButton, 
  useAvatarGestures, 
  AvatarGestureEffect 
} from './AvatarGestures';
import { SimpleAvatar } from './SimpleAvatar';
import Avatar3DModel from './Avatar3DModel';
import { EmoteMenu, EmoteButton, useAvatarEmotes } from './EmoteMenu';
import CursorController from './CursorController';

// Import Room components
import { ConferenceRoom, Classroom, OutdoorSetting, FuturisticSpace, BoardRoom, Auditorium } from './RoomTemplates';

// Create a proper audio manager for spatial audio
const SpatialAudioSystem = () => {
  const [audioContext, setAudioContext] = useState(null);
  const audioSources = useRef({});
  const listener = useRef(null);
  const { camera } = useThree();
  
  // Initialize audio context
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      
      // Create audio listener that follows the camera
      const audioListener = ctx.listener;
      listener.current = audioListener;
      
      // Set initial listener position
      if (audioListener.positionX) {
        audioListener.positionX.value = camera.position.x;
        audioListener.positionY.value = camera.position.y;
        audioListener.positionZ.value = camera.position.z;
        
        // Set orientation (forward and up)
        audioListener.forwardX.value = 0;
        audioListener.forwardY.value = 0;
        audioListener.forwardZ.value = -1;
        audioListener.upX.value = 0;
        audioListener.upY.value = 1;
        audioListener.upZ.value = 0;
      } else {
        // Fallback for browsers without AudioParam automation
        audioListener.setPosition(camera.position.x, camera.position.y, camera.position.z);
        audioListener.setOrientation(0, 0, -1, 0, 1, 0);
      }
      
      return () => {
        // Clean up audio context when component unmounts
        ctx.close();
        Object.values(audioSources.current).forEach(source => {
          if (source.mediaStreamSource) {
            source.mediaStreamSource.disconnect();
          }
          if (source.panner) {
            source.panner.disconnect();
          }
        });
      };
    } catch (err) {
      console.error("Error initializing audio context:", err);
      return null;
    }
  }, []);
  
  // Update listener position to match camera
  useFrame(() => {
    if (!audioContext || !listener.current) return;
    
    if (listener.current.positionX) {
      listener.current.positionX.value = camera.position.x;
      listener.current.positionY.value = camera.position.y;
      listener.current.positionZ.value = camera.position.z;
      
      // Get camera direction
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      listener.current.forwardX.value = direction.x;
      listener.current.forwardY.value = direction.y;
      listener.current.forwardZ.value = direction.z;
    } else {
      listener.current.setPosition(camera.position.x, camera.position.y, camera.position.z);
      
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      listener.current.setOrientation(direction.x, direction.y, direction.z, 0, 1, 0);
    }
  });
  
  // Add audio source for a participant
  const addAudioSource = (id, stream, position) => {
    if (!audioContext) return;
    
    try {
      if (audioSources.current[id]) {
        // Clean up existing source
        if (audioSources.current[id].mediaStreamSource) {
          audioSources.current[id].mediaStreamSource.disconnect();
        }
        if (audioSources.current[id].panner) {
          audioSources.current[id].panner.disconnect();
        }
      }
      
      // Create media stream source
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      
      // Create panner for positional audio
      const panner = audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 360;
      panner.coneOuterGain = 0;
      
      // Set initial panner position
      if (panner.positionX) {
        panner.positionX.value = position.x;
        panner.positionY.value = position.y;
        panner.positionZ.value = position.z;
      } else {
        panner.setPosition(position.x, position.y, position.z);
      }
      
      // Connect the nodes
      mediaStreamSource.connect(panner);
      panner.connect(audioContext.destination);
      
      // Store references
      audioSources.current[id] = {
        mediaStreamSource,
        panner,
        position
      };
    } catch (err) {
      console.error(`Error creating spatial audio for participant ${id}:`, err);
    }
  };
  
  // Update audio source position
  const updateAudioSourcePosition = (id, position) => {
    if (!audioContext || !audioSources.current[id]) return;
    
    const source = audioSources.current[id];
    source.position = position;
    
    if (source.panner.positionX) {
      source.panner.positionX.value = position.x;
      source.panner.positionY.value = position.y;
      source.panner.positionZ.value = position.z;
    } else {
      source.panner.setPosition(position.x, position.y, position.z);
    }
  };
  
  // Remove audio source
  const removeAudioSource = (id) => {
    if (!audioSources.current[id]) return;
    
    if (audioSources.current[id].mediaStreamSource) {
      audioSources.current[id].mediaStreamSource.disconnect();
    }
    if (audioSources.current[id].panner) {
      audioSources.current[id].panner.disconnect();
    }
    
    delete audioSources.current[id];
  };
  
  return {
    addAudioSource,
    updateAudioSourcePosition,
    removeAudioSource,
    isReady: !!audioContext
  };
};

// Update the HumanAvatar component to use spatial audio
function HumanAvatar({ position, name, avatarData, isSpeaking, stream, muted, videoOff, audioSystem }) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelRef = useRef();
  const videoRef = useRef();
  const speechIntensity = useRef(0);
  const audioRef = useRef(null);
  const positionRef = useRef(position);
  
  // Keep reference to latest position for audio updates
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  
  // Set up spatial audio if stream is available and audioSystem is ready
  useEffect(() => {
    if (stream && !muted && audioSystem?.isReady && avatarData?.id) {
      // Add audio source for this participant
      audioSystem.addAudioSource(
        avatarData.id, 
        stream, 
        new THREE.Vector3(position[0], position[1], position[2])
      );
      
      // Set up position updates
      const updateInterval = setInterval(() => {
        audioSystem.updateAudioSourcePosition(
          avatarData.id,
          new THREE.Vector3(
            positionRef.current[0], 
            positionRef.current[1], 
            positionRef.current[2]
          )
        );
      }, 200); // Update every 200ms
      
      return () => {
        clearInterval(updateInterval);
        audioSystem.removeAudioSource(avatarData.id);
      };
    }
  }, [stream, muted, audioSystem, avatarData?.id]);
  
  // Try to load the model but handle failures gracefully
  const [modelError, setModelError] = useState(false);
  
  useEffect(() => {
    let modelLoadTimeout = null;
    
    try {
      const loader = new FBXLoader();
      const modelPath = avatarData?.model === 'dragon' 
        ? '/models/fbx2/Dragon_Baked_Actions_fbx_7.4_binary.fbx'
        : '/models/fbx2/Wolf_fbx.fbx';
      
      // Set timeout to prevent hanging on model load
      modelLoadTimeout = setTimeout(() => {
        console.warn(`${avatarData?.model} model load timed out - using fallback`);
        setModelError(true);
      }, 5000); // 5 second timeout
      
      loader.load(
        modelPath,
        (model) => {
          if (modelLoadTimeout) clearTimeout(modelLoadTimeout);
          console.log(`${avatarData?.model} model loaded successfully`);
          setModelLoaded(true);
          setModelError(false);
        },
        (xhr) => {
          console.log(`Loading ${avatarData?.model} model: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        (error) => {
          if (modelLoadTimeout) clearTimeout(modelLoadTimeout);
          console.error(`Failed to load ${avatarData?.model} model:`, error);
          setModelLoaded(false);
          setModelError(true);
        }
      );
    } catch (error) {
      if (modelLoadTimeout) clearTimeout(modelLoadTimeout);
      console.error(`Exception loading ${avatarData?.model} model:`, error);
      setModelLoaded(false);
      setModelError(true);
    }
    
    // Cleanup timeout if component unmounts
    return () => {
      if (modelLoadTimeout) clearTimeout(modelLoadTimeout);
    };
  }, [avatarData?.model]);
  
  // Set up audio visualization if stream is available
  useEffect(() => {
    if (stream && !muted) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 32;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateSpeechIntensity = () => {
          analyser.getByteFrequencyData(dataArray);
          // Get average frequency volume
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          // Map 0-255 to 0-1 with some dampening
          speechIntensity.current = MathUtils.lerp(
            speechIntensity.current, 
            Math.min(average / 128, 1), 
            0.1
          );
          
          requestAnimationFrame(updateSpeechIntensity);
        };
        
        updateSpeechIntensity();
        return () => source.disconnect();
      } catch (err) {
        console.error("Error setting up audio visualization:", err);
      }
    }
  }, [stream, muted]);

  // Set up standard HTML audio for simple playback
  useEffect(() => {
    if (stream && !muted && audioRef.current) {
      try {
        audioRef.current.srcObject = stream;
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
      } catch (err) {
        console.error("Error setting up audio element:", err);
      }
    }
  }, [stream, muted]);
  
  // Choose avatar color based on data or defaults
  const avatarColor = avatarData?.color || '#4a90e2';
  const avatarScale = avatarData?.scale || 1;

  // Use SimpleAvatar as fallback
  if (modelError || !modelLoaded) {
    return (
      <SimpleAvatar
        position={position}
        color={avatarColor}
        scale={avatarScale}
        name={name}
        isMuted={muted}
        isVideoOff={videoOff}
        stream={stream}
      />
    );
  }

  return (
    <group position={position}>
      {/* 3D Model if loaded successfully */}
      <Avatar3DModel 
        id={avatarData?.id}
        type={avatarData?.model || 'wolf'} 
        position={[0, -1, 0]}
        isVideoOff={videoOff}
        isMuted={muted}
        name={name}
        stream={stream}
        participant={avatarData}
        audioSystem={audioSystem}
      />
      
      {/* Status indicators */}
      <group position={[0, 1.4, 0]}>
        {muted && (
          <Html transform distanceFactor={8}>
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
        {videoOff && (
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
      
      {/* Audio visualization */}
      <mesh 
        position={[0, 1.5, 0]} 
        scale={[
          0.1 + speechIntensity.current * 0.1,
          0.1 + speechIntensity.current * 0.1,
          0.1 + speechIntensity.current * 0.1
        ]}
        visible={!muted && speechIntensity.current > 0.05}
      >
        <sphereGeometry args={[1, 16, 8]} />
        <meshBasicMaterial color="#4fc3f7" wireframe transparent opacity={0.6} />
      </mesh>
      
      {/* Hidden audio element for standard HTML audio */}
      <Html>
        <audio ref={audioRef} autoPlay playsInline style={{ display: 'none' }} />
      </Html>
    </group>
  );
}

// Interactive Whiteboard Component
function Whiteboard({ position, rotation }) {
  const [drawings, setDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const planeRef = useRef();
  const { isPresenting } = useXR();
  const rightController = useController('right');
  
  // Handle drawing with controller
  useFrame(() => {
    if (isPresenting && rightController && planeRef.current) {
      const { gripSpace } = rightController;
      
      // Check if trigger button is pressed
      if (rightController.inputSource.gamepad?.buttons[0]?.pressed) {
        const raycaster = new Raycaster();
        raycaster.set(
          gripSpace.position,
          new THREE.Vector3(0, 0, -1).applyQuaternion(gripSpace.quaternion)
        );
        
        const intersects = raycaster.intersectObject(planeRef.current);
        
        if (intersects.length > 0) {
          const point = intersects[0].point;
          
          if (!isDrawing) {
            // Start new drawing
            setDrawings([...drawings, { 
              points: [point], 
              color: currentColor 
            }]);
            setIsDrawing(true);
          } else {
            // Continue drawing
            const newDrawings = [...drawings];
            const currentDrawing = newDrawings[newDrawings.length - 1];
            currentDrawing.points.push(point);
            setDrawings(newDrawings);
          }
        }
      } else if (isDrawing) {
        setIsDrawing(false);
      }
    }
  });
  
  // Color selector buttons
  const colors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'];
  
  return (
    <group position={position} rotation={rotation}>
      {/* Whiteboard background */}
      <mesh ref={planeRef}>
        <planeGeometry args={[4, 3]} />
        <meshBasicMaterial color="#222222" />
      </mesh>
      
      {/* Drawings */}
      {drawings.map((drawing, index) => (
        <Line 
          key={index}
          points={drawing.points}
          color={drawing.color}
          lineWidth={5}
        />
      ))}
      
      {/* Color selector */}
      <group position={[0, -1.7, 0.1]}>
        {colors.map((color, index) => (
          <Interactive 
            key={color}
            onSelect={() => setCurrentColor(color)}
          >
            <mesh position={[(index - 2) * 0.3, 0, 0]}>
              <boxGeometry args={[0.2, 0.2, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </Interactive>
        ))}
        
        {/* Clear button */}
        <Interactive onSelect={() => setDrawings([])}>
          <mesh position={[2, 0, 0]}>
            <boxGeometry args={[0.4, 0.2, 0.05]} />
            <meshBasicMaterial color="#444444" />
          </mesh>
          <Text 
            position={[2, 0, 0.1]} 
            fontSize={0.1}
            color="white"
          >
            Clear
          </Text>
        </Interactive>
      </group>
    </group>
  );
}

// Improve the PollControlPanel to be more prominent and ensure it works
const PollControlPanel = ({ startPoll, examplePolls }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <group position={[0, 1.2, -1]} rotation={[0, 0, 0]}>
      {/* Make poll button larger and more visible */}
      <Interactive onSelect={() => setShowMenu(!showMenu)}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.1]} />
          <meshStandardMaterial color="#2196f3" emissive="#1565c0" emissiveIntensity={0.5} />
        </mesh>
        <Text 
          position={[0, 0, 0.06]} 
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Start Poll
        </Text>
      </Interactive>
      
      {/* Poll menu */}
      {showMenu && (
        <group position={[0, -0.6, 0.2]}>
          {examplePolls.map((poll, index) => (
            <Interactive 
              key={poll.id} 
              onSelect={() => {
                console.log("Starting poll:", poll.id);
                startPoll(poll.id);
                setShowMenu(false);
              }}
            >
              <mesh position={[0, -index * 0.6, 0]}>
                <boxGeometry args={[1.5, 0.5, 0.1]} />
                <meshStandardMaterial 
                  color="#64b5f6" 
                  emissive="#1976d2" 
                  emissiveIntensity={0.3}
                />
              </mesh>
              <Text 
                position={[0, -index * 0.6, 0.06]} 
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.4}
              >
                {poll.question}
              </Text>
            </Interactive>
          ))}
        </group>
      )}
    </group>
  );
};

// Improve the PresentationSystem component for better screen sharing
const PresentationSystem = ({ roomType, activeMedia, currentSlide, hasScreenShare, screenShareStream }) => {
  const videoRef = useRef();
  const videoTextureRef = useRef();
  const screenMeshRef = useRef();
  const contentMeshRef = useRef();
  const [videoReady, setVideoReady] = useState(false);
  const [slideTexture, setSlideTexture] = useState(null);
  const [debugInfo, setDebugInfo] = useState({ status: "Initializing", details: "" });
  
  // Update texture every frame
  useFrame(() => {
    if (hasScreenShare && videoReady && videoTextureRef.current) {
      videoTextureRef.current.needsUpdate = true;
    }
  });
  
  // Position and size based on room type
  let screenPosition, screenRotation, screenSize;
  
  switch (roomType) {
    case 'classroom':
      screenPosition = [0, 2.5, -6.5];
      screenRotation = [0, 0, 0];
      screenSize = [6, 3.5, 0.1];
      break;
    case 'conference':
      screenPosition = [0, 2.3, -4.8];
      screenRotation = [0, 0, 0];
      screenSize = [5, 3, 0.1];
      break;
    case 'boardroom':
      screenPosition = [0, 2.4, -5.2];
      screenRotation = [0, 0, 0];
      screenSize = [5.5, 3.2, 0.1];
      break;
    case 'auditorium':
      screenPosition = [0, 3.5, -8];
      screenRotation = [0, 0, 0];
      screenSize = [8, 4.5, 0.1];
      break;
    case 'outdoor':
      screenPosition = [-2, 2.2, -3];
      screenRotation = [0, Math.PI / 6, 0];
      screenSize = [4.5, 2.5, 0.1];
      break;
    case 'futuristic':
      screenPosition = [0, 2.5, -5];
      screenRotation = [0, 0, 0];
      screenSize = [7, 4, 0.1];
      break;
    default:
      screenPosition = [0, 2.5, -5];
      screenRotation = [0, 0, 0];
      screenSize = [5, 3, 0.1];
  }
  
  // Load slide texture
  useEffect(() => {
    if (activeMedia === 'slides' && !hasScreenShare) {
      const loader = new THREE.TextureLoader();
      loader.load(`/slides/slide${currentSlide}.jpg`, 
        (texture) => {
          setSlideTexture(texture);
          setDebugInfo({ status: "Slide loaded", details: `Slide ${currentSlide}` });
        },
        undefined,
        (err) => {
          console.error('Error loading slide texture:', err);
          setDebugInfo({ status: "Slide error", details: err.message });
          // Create a fallback texture with text
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 256;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#333333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = '24px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Slide not available', canvas.width / 2, canvas.height / 2);
            const fallbackTexture = new THREE.CanvasTexture(canvas);
            setSlideTexture(fallbackTexture);
          }
        }
      );
    }
  }, [activeMedia, currentSlide, hasScreenShare]);

  // Setup video element for screen sharing
  useEffect(() => {
    if (hasScreenShare && screenShareStream) {
      try {
        console.log("Setting up screen share video element with stream:", screenShareStream);
        setDebugInfo({ status: "Loading stream", details: "Preparing video element" });
        
        // Create video element
        const video = document.createElement('video');
        video.playsInline = true;
        video.autoplay = true;
        video.muted = true;
        
        // Add debug display
        if (process.env.NODE_ENV === 'development') {
          // Make it visible for debugging
          video.style.position = 'fixed';
          video.style.width = '160px';
          video.style.height = '120px';
          video.style.bottom = '10px';
          video.style.right = '10px';
          video.style.zIndex = '1000';
          video.style.opacity = '0.7';
          video.style.borderRadius = '5px';
          video.style.border = '1px solid white';
          document.body.appendChild(video);
        } else {
          // In production, keep the video but make it invisible
          video.style.display = 'none';
          document.body.appendChild(video);
        }
        
        // Set stream to video
        video.srcObject = screenShareStream;
        videoRef.current = video;
        
        // Create texture
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;
        texture.generateMipmaps = false;
        videoTextureRef.current = texture;
        
        // Handle video ready state
        const handleVideoLoaded = () => {
          console.log("Screen share video loaded, dimensions:", video.videoWidth, "x", video.videoHeight);
          setDebugInfo({ 
            status: "Stream ready", 
            details: `${video.videoWidth}x${video.videoHeight}` 
          });
          setVideoReady(true);
          
          // Ensure texture is updated and applied
          if (contentMeshRef.current && contentMeshRef.current.material) {
            contentMeshRef.current.material.map = videoTextureRef.current;
            contentMeshRef.current.material.needsUpdate = true;
          }
        };
        
        video.addEventListener('loadeddata', handleVideoLoaded);
        
        // In case loadeddata doesn't fire, try canplay as a backup
        video.addEventListener('canplay', () => {
          if (!videoReady) handleVideoLoaded();
        });
        
        video.addEventListener('error', (e) => {
          console.error("Video error:", e);
          setDebugInfo({ status: "Video error", details: e.message || "Unknown error" });
        });
        
        // Start playing
        let playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error("Error playing video:", err);
            setDebugInfo({ status: "Play error", details: err.message });
            
            // Try to recover by muting if autoplay was blocked
            if (err.name === 'NotAllowedError') {
              console.log("Autoplay blocked, trying with mute...");
              video.muted = true;
              video.play().catch(e => {
                console.error("Still failed after muting:", e);
              });
            }
          });
        }
        
        return () => {
          console.log("Cleaning up screen share video");
          
          // Remove event listeners
          video.removeEventListener('loadeddata', handleVideoLoaded);
          video.removeEventListener('canplay', handleVideoLoaded);
          
          // Clean up video
          if (video) {
            if (video.srcObject) {
              // Stop all tracks before removing
              const tracks = video.srcObject.getTracks();
              tracks.forEach(track => track.stop());
              video.srcObject = null;
            }
            if (video.parentNode) {
              video.parentNode.removeChild(video);
            }
          }
          
          // Clean up three.js resources
          if (videoTextureRef.current) {
            videoTextureRef.current.dispose();
          }
          
          setVideoReady(false);
          videoTextureRef.current = null;
          videoRef.current = null;
        };
      } catch (err) {
        console.error("Error setting up screen share video element:", err);
        setDebugInfo({ status: "Setup error", details: err.message || "Unknown error" });
      }
    } else if (!hasScreenShare) {
      setDebugInfo({ status: "No screen share", details: "" });
    }
  }, [hasScreenShare, screenShareStream]);
  
  // Generate more detailed status message
  const screenShareStatus = hasScreenShare 
    ? (videoReady ? `Screen sharing active (${debugInfo.details})` : `Loading screen share: ${debugInfo.status}`) 
    : "No screen sharing";
  
  return (
    <group position={screenPosition} rotation={screenRotation}>
      {/* Screen backdrop */}
      <mesh
        ref={screenMeshRef}
        position={[0, 0, 0]}
        receiveShadow
      >
        <boxGeometry args={screenSize} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          emissive="#111111"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Content display - Slides or Screen Share */}
      <mesh 
        ref={contentMeshRef}
        position={[0, 0, 0.06]} 
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[screenSize[0] - 0.2, screenSize[1] - 0.2]} />
        {hasScreenShare && videoTextureRef.current ? (
          <meshBasicMaterial 
            map={videoTextureRef.current}
            toneMapped={false}
            side={THREE.FrontSide}
          />
        ) : (
          <meshBasicMaterial 
            color="white" 
            map={slideTexture}
            side={THREE.FrontSide}
          />
        )}
      </mesh>
      
      {/* Screen frame */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[screenSize[0] + 0.2, screenSize[1] + 0.2, 0.05]} />
        <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Status indicator for screen sharing */}
      <Html position={[0, screenSize[1] / 2 + 0.3, 0]} transform distanceFactor={10}>
        <div style={{
          background: hasScreenShare ? 'rgba(33,150,243,0.8)' : 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontFamily: 'Arial',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          fontWeight: 'bold'
        }}>
          {screenShareStatus}
        </div>
      </Html>
    </group>
  );
};

// TeleportationMarker component for showing where the user will teleport
const TeleportationMarker = ({ position, isValid }) => {
  return (
    <mesh position={[position.x, position.y + 0.01, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.1, 0.3, 16]} />
      <meshBasicMaterial 
        color={isValid ? '#00ff00' : '#ff0000'} 
        transparent={true} 
        opacity={0.6} 
      />
    </mesh>
  );
};

// Custom hook for avatar movement
const useAvatarMovement = (vrStore) => {
  const [position, setPosition] = useState([0, 1, 0]);
  const [targetPosition, setTargetPosition] = useState(null);
  const [teleportMarker, setTeleportMarker] = useState({ visible: false, position: new THREE.Vector3(), isValid: false });
  
  const { controllers, isPresenting } = useXR();
  
  // Keyboard controls for non-VR mode
  useEffect(() => {
    const moveSpeed = 0.2; // Increased from 0.1 to 0.2 for faster movement
    const keys = {};
    
    const handleKeyDown = (e) => {
      keys[e.key] = true;
    };
    
    const handleKeyUp = (e) => {
      keys[e.key] = false;
      
      // Spacebar for teleport
      if (e.key === ' ' && teleportMarker.visible && teleportMarker.isValid) {
        setPosition([teleportMarker.position.x, position[1], teleportMarker.position.z]);
        vrStore.updateAvatarPosition(teleportMarker.position.x, position[1], teleportMarker.position.z);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Animation loop for continuous movement
    const interval = setInterval(() => {
      let dx = 0, dz = 0;
      
      // WASD or arrow keys
      if (keys['w'] || keys['ArrowUp']) dz -= moveSpeed;
      if (keys['s'] || keys['ArrowDown']) dz += moveSpeed;
      if (keys['a'] || keys['ArrowLeft']) dx -= moveSpeed;
      if (keys['d'] || keys['ArrowRight']) dx += moveSpeed;
      
      if (dx !== 0 || dz !== 0) {
        const newX = position[0] + dx;
        const newZ = position[2] + dz;
        setPosition([newX, position[1], newZ]);
        vrStore.updateAvatarPosition(newX, position[1], newZ);
      }
    }, 16); // ~60fps
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [position, teleportMarker, vrStore]);
  
  // VR Controller movement
  useFrame((state) => {
    if (isPresenting && controllers.length > 0) {
      // Get the right controller
      const controller = controllers[1] || controllers[0];
      
      if (controller) {
        // Teleportation logic
        const raycaster = new THREE.Raycaster();
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, -1, 0).applyMatrix4(tempMatrix);
        
        // Check for floor intersection
        const intersects = raycaster.intersectObjects(
          state.scene.children.filter(obj => 
            obj.userData && obj.userData.isFloor || 
            (obj.element && obj.element.className && obj.element.className.includes('floor-target'))
          ), 
          true
        );
        
        if (intersects.length > 0) {
          const intersection = intersects[0];
          setTeleportMarker({
            visible: true,
            position: intersection.point,
            isValid: true
          });
          
          // Teleport on trigger press
          if (controller.userData.isButtonPressed) {
            setPosition([intersection.point.x, position[1], intersection.point.z]);
            vrStore.updateAvatarPosition(intersection.point.x, position[1], intersection.point.z);
          }
        } else {
          setTeleportMarker({
            visible: true,
            position: new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld),
            isValid: false
          });
        }
        
        // Direct movement with thumbstick
        if (controller.gamepad) {
          const [x, y] = controller.gamepad.axes;
          
          if (Math.abs(x) > 0.2 || Math.abs(y) > 0.2) {
            // Get camera direction
            const camera = state.camera;
            const moveSpeed = 0.1;
            
            // Calculate forward and right vectors relative to camera view
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            forward.y = 0;
            forward.normalize();
            
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            right.y = 0;
            right.normalize();
            
            // Calculate movement
            const moveX = right.multiplyScalar(x * moveSpeed);
            const moveZ = forward.multiplyScalar(-y * moveSpeed);
            
            const newPos = [
              position[0] + moveX.x + moveZ.x,
              position[1],
              position[2] + moveX.z + moveZ.z
            ];
            
            setPosition(newPos);
            vrStore.updateAvatarPosition(newPos[0], newPos[1], newPos[2]);
          }
        }
      }
    }
  });
  
  return { position, teleportMarker };
};

// Local Participant Avatar component with emote menu integration
const LocalParticipantAvatar = ({ vrStore, roomType }) => {
  const { position, teleportMarker } = useAvatarMovement(vrStore);
  const localParticipant = vrStore.localParticipant;
  
  return (
    <>
      {localParticipant && (
        <SimpleAvatar 
          position={position}
          color={localParticipant.avatarColor || '#4FC3F7'}
          scale={localParticipant.avatarScale || 1}
          name={localParticipant.displayName || 'You'}
          isMuted={localParticipant.isMuted}
          isVideoOff={localParticipant.isVideoOff}
          stream={localParticipant.stream}
          style={localParticipant.avatarStyle || 'robot'}
          emote={localParticipant.emote}
        />
      )}
      
      {/* Teleportation marker */}
      {teleportMarker.visible && (
        <TeleportationMarker 
          position={teleportMarker.position} 
          isValid={teleportMarker.isValid} 
        />
      )}
      
      {/* Emote menu */}
      <EmoteMenu position={position} vrStore={vrStore} />
    </>
  );
};

// Remote Participant Avatar component
const RemoteParticipantAvatar = ({ participant, vrStore }) => {
  // Use position from store, or default if not available
  const position = vrStore.avatarPositions[participant.id] || [
    Math.random() * 4 - 2,  // Random X between -2 and 2
    1,                     // Y position (height)
    Math.random() * 4 - 2   // Random Z between -2 and 2
  ];
  
  return (
    <SimpleAvatar 
      position={position}
      color={participant.avatarColor || '#FF8A65'}
      scale={participant.avatarScale || 1}
      name={participant.displayName || 'User'}
      isMuted={participant.isMuted}
      isVideoOff={participant.isVideoOff}
      stream={participant.stream}
      style={participant.avatarStyle || 'robot'}
      emote={participant.emote}
    />
  );
};

// Add new InteractivePoll component
const InteractivePoll = ({ position = [0, 1.5, -3], question, options = [], onVote, results, isActive = false }) => {
  const [selected, setSelected] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const pollWidth = 3;
  const pollHeight = 2;
  
  // Calculate the maximum votes for scaling
  const maxVotes = results ? Math.max(...Object.values(results), 1) : 1;
  
  // Submit vote
  const handleVote = (optionIndex) => {
    if (!isSubmitted) {
      setSelected(optionIndex);
    }
  };
  
  // Submit the selected option
  const handleSubmit = () => {
    if (selected !== null && !isSubmitted) {
      onVote(selected);
      setIsSubmitted(true);
      setShowResults(true);
    }
  };
  
  // Only render if the poll is active
  if (!isActive) return null;
  
  return (
    <group position={position}>
      {/* Poll background */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[pollWidth + 0.2, pollHeight + 0.2, 0.05]} />
        <meshStandardMaterial color="#2a3b4c" />
      </mesh>
      
      {/* Question display */}
      <Text 
        position={[0, pollHeight * 0.4, 0]} 
        fontSize={0.15}
        color="white"
        maxWidth={pollWidth - 0.2}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {question}
      </Text>
      
      {/* Options or Results */}
      <group position={[0, 0, 0]}>
        {options.map((option, index) => {
          const yPos = pollHeight * 0.2 - index * 0.3;
          
          return (
            <group key={index} position={[0, yPos, 0]}>
              {/* Option selection button */}
              {!showResults && (
                <Interactive onSelect={() => handleVote(index)}>
                  <mesh position={[-pollWidth * 0.4, 0, 0]}>
                    <boxGeometry args={[0.2, 0.2, 0.05]} />
                    <meshStandardMaterial 
                      color={selected === index ? "#4fc3f7" : "#666666"} 
                      emissive={selected === index ? "#4fc3f7" : "#444444"}
                    />
                  </mesh>
                </Interactive>
              )}
              
              {/* Option text */}
              <Text 
                position={[0, 0, 0]} 
                fontSize={0.12}
                color="white"
                maxWidth={showResults ? pollWidth * 0.4 : pollWidth * 0.7}
                textAlign="left"
                anchorX="left"
                anchorY="middle"
              >
                {option}
              </Text>
              
              {/* Result bars */}
              {showResults && results && (
                <group position={[pollWidth * 0.2, 0, 0]}>
                  <mesh 
                    position={[results[index] / maxVotes * (pollWidth * 0.3) / 2, 0, 0]}
                    scale={[
                      Math.max(results[index] / maxVotes * (pollWidth * 0.3), 0.05), 
                      0.15, 
                      0.03
                    ]}
                  >
                    <boxGeometry />
                    <meshStandardMaterial 
                      color={["#FF8A65", "#64B5F6", "#81C784", "#FFD54F", "#BA68C8"][index % 5]} 
                    />
                  </mesh>
                  
                  {/* Vote count */}
                  <Text 
                    position={[pollWidth * 0.4, 0, 0]} 
                    fontSize={0.11}
                    color="#aaaaaa"
                    anchorX="left"
                    anchorY="middle"
                  >
                    {results[index] || 0}
                  </Text>
                </group>
              )}
            </group>
          );
        })}
      </group>
      
      {/* Submit button */}
      {!showResults && (
        <Interactive onSelect={handleSubmit}>
          <mesh position={[0, -pollHeight * 0.4, 0]}>
            <boxGeometry args={[1, 0.3, 0.05]} />
            <meshStandardMaterial 
              color={selected !== null ? "#4CAF50" : "#777777"} 
              emissive={selected !== null ? "#81C784" : "#444444"}
            />
          </mesh>
          <Text 
            position={[0, -pollHeight * 0.4, 0.03]} 
            fontSize={0.12}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Submit
          </Text>
        </Interactive>
      )}
      
      {/* Close button */}
      {showResults && (
        <Interactive onSelect={() => setShowResults(false)}>
          <mesh position={[pollWidth * 0.43, pollHeight * 0.43, 0]}>
            <boxGeometry args={[0.2, 0.2, 0.05]} />
            <meshStandardMaterial color="#f44336" />
          </mesh>
          <Text 
            position={[pollWidth * 0.43, pollHeight * 0.43, 0.03]} 
            fontSize={0.14}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            ×
          </Text>
        </Interactive>
      )}
    </group>
  );
};

// Improve the VRRoom component to better manage the control panels and ensure room switching works
const VRRoom = ({ roomData }) => {
  const vrStore = useVRStore();
  const [hasModelError, setHasModelError] = useState(false);
  const [roomType, setRoomType] = useState('auditorium'); // Default to auditorium
  const [activeMedia, setActiveMedia] = useState('slides');
  const [currentSlide, setCurrentSlide] = useState(1);
  const [hasScreenShare, setHasScreenShare] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState(null);
  
  // Poll state
  const [activePoll, setActivePoll] = useState(null);
  const [pollResults, setPollResults] = useState({});

  // Example poll data
  const examplePolls = [
    {
      id: 1,
      question: "What feature would you like to see next?",
      options: [
        "Whiteboard collaboration", 
        "3D object sharing", 
        "Customizable avatars", 
        "Voice commands"
      ]
    },
    {
      id: 2,
      question: "How would you rate this VR experience?",
      options: [
        "Excellent", 
        "Good", 
        "Average", 
        "Needs improvement"
      ]
    }
  ];
  
  // Debug state for tracking events
  const [debugLog, setDebugLog] = useState([]);
  const addDebugLog = (message) => {
    console.log(message);
    setDebugLog(prev => [...prev.slice(-4), message]); // Keep last 5 messages
  };
  
  // Start a new poll
  const startPoll = (pollId) => {
    addDebugLog(`Starting poll: ${pollId}`);
    const poll = examplePolls.find(p => p.id === pollId);
    if (poll) {
      setActivePoll(poll);
      // Initialize results
      const initialResults = {};
      poll.options.forEach((_, index) => {
        initialResults[index] = 0;
      });
      setPollResults(initialResults);
      
      // In a real app, you would broadcast this poll to all participants
      vrStore.broadcastMessage({
        type: 'poll_started',
        pollId: poll.id,
        poll: poll
      });
    }
  };
  
  // Handle poll vote
  const handleVote = (optionIndex) => {
    addDebugLog(`Vote received for option: ${optionIndex}`);
    // Update local results
    setPollResults(prev => {
      const newResults = { ...prev };
      newResults[optionIndex] = (newResults[optionIndex] || 0) + 1;
      return newResults;
    });
    
    // In a real app, you would send this vote to all participants
    vrStore.broadcastMessage({
      type: 'poll_vote',
      pollId: activePoll.id,
      optionIndex: optionIndex
    });
  };
  
  // Set room type from room data on mount
  useEffect(() => {
    if (roomData && roomData.roomTemplate) {
      addDebugLog(`Initial room set to: ${roomData.roomTemplate}`);
      setRoomType(roomData.roomTemplate);
    } else {
      // Default to auditorium if no roomTemplate is provided
      addDebugLog(`No room template provided, using auditorium`);
      setRoomType('auditorium');
      if (vrStore.setRoomType) {
        vrStore.setRoomType('auditorium');
      }
    }
  }, [roomData, vrStore]);
  
  // Initialize screen sharing from roomData prop
  useEffect(() => {
    if (roomData && roomData.screenShare) {
      const { active, stream } = roomData.screenShare;
      
      if (active && stream) {
        console.log("VRRoom: Received screen share stream from parent component", stream);
        addDebugLog(`Received screen share stream from parent component`);
        setHasScreenShare(true);
        setScreenShareStream(stream);
      } else if (active && !stream) {
        addDebugLog('Screen sharing active but no stream available');
      }
    }
  }, [roomData]);

  // Check for screen sharing
  useEffect(() => {
    const checkScreenShare = () => {
      // First, check if we have screen share from roomData
      if (roomData && roomData.screenShare && roomData.screenShare.active && roomData.screenShare.stream) {
        if (!hasScreenShare || screenShareStream !== roomData.screenShare.stream) {
          addDebugLog(`Using screen share stream from roomData`);
          setHasScreenShare(true);
          setScreenShareStream(roomData.screenShare.stream);
        }
        return;
      }
      
      const participants = [...vrStore.remoteParticipants, vrStore.localParticipant];
      
      for (const participant of participants) {
        if (!participant) continue;
        
        // Check for screen sharing flag and stream
        if (participant.isScreenSharing) {
          // Get screen share stream from the participant
          let stream = participant.screenStream;
          
          // If screenStream isn't available directly, try to find the screen track in the regular stream
          if (!stream && participant.stream) {
            const videoTracks = participant.stream.getVideoTracks();
            if (videoTracks.length > 0) {
              // Check if any video track is screen capture
              for (const track of videoTracks) {
                if (track.label && (
                    track.label.toLowerCase().includes('screen') || 
                    track.label.toLowerCase().includes('display') ||
                    track.label.toLowerCase().includes('window')
                )) {
                  // Create a new stream with just this track
                  stream = new MediaStream([track]);
                  addDebugLog(`Created screen share stream from track: ${track.label}`);
                  break;
                }
              }
            }
          }
          
          if (stream) {
            if (!hasScreenShare) {
              addDebugLog(`Screen share started: ${participant.displayName || participant.name || participant.id}`);
            }
            setHasScreenShare(true);
            setScreenShareStream(stream);
            return;
          } else {
            addDebugLog(`Participant ${participant.id} marked as screen sharing but no stream found`);
          }
        }
      }
      
      if (hasScreenShare) {
        addDebugLog('Screen share ended');
        setHasScreenShare(false);
        setScreenShareStream(null);
      }
    };
    
    checkScreenShare();
    
    // Set up interval to periodically check for screen shares
    const intervalId = setInterval(checkScreenShare, 2000);
    
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vrStore.remoteParticipants, vrStore.localParticipant, roomData]);

  return (
    <Canvas shadows>
      <XR>
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />
        
        {/* Room Template - Only show Auditorium by default */}
        <Suspense fallback={null}>
          {roomType === 'auditorium' && <Auditorium />}
          {roomType === 'classroom' && <Classroom />}
          {roomType === 'conference' && <ConferenceRoom />}
          {roomType === 'outdoor' && <OutdoorSetting />}
          {roomType === 'futuristic' && <FuturisticSpace />}
          {roomType === 'boardroom' && <BoardRoom />}
        </Suspense>
        
        {/* Presentation System */}
        <PresentationSystem 
          roomType={roomType}
          activeMedia={activeMedia}
          currentSlide={currentSlide}
          hasScreenShare={hasScreenShare}
          screenShareStream={screenShareStream}
        />
        
        {/* Interactive Poll */}
        <InteractivePoll 
          question={activePoll?.question}
          options={activePoll?.options || []}
          onVote={handleVote}
          results={pollResults}
          isActive={!!activePoll}
          position={[0, 2, -4]} // Position in front of the user
        />
        
        {/* Only keep Poll Control Panel, remove Room Selector */}
        <group>
          {/* Poll Control Panel */}
          <PollControlPanel 
            startPoll={startPoll} 
            examplePolls={examplePolls}
          />
        </group>
        
        {/* Status indicator for screen sharing only */}
        {hasScreenShare && (
          <Html position={[0, 0.6, -1.5]} transform distanceFactor={10}>
            <div style={{
              background: 'rgba(33,150,243,0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontFamily: 'Arial',
              fontSize: '12px',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              Screen Sharing Active
            </div>
          </Html>
        )}
        
        {/* Local Participant */}
        <LocalParticipantAvatar vrStore={vrStore} roomType={roomType} />
        
        {/* Remote Participants */}
        {vrStore.remoteParticipants.map(participant => (
          <RemoteParticipantAvatar 
            key={participant.id} 
            participant={participant} 
            vrStore={vrStore}
          />
        ))}
        
        {/* Controllers */}
        <Controllers />
        
        {/* Orbit controls for non-VR mode */}
        <OrbitControls enableZoom={true} enablePan={true} />
      </XR>
    </Canvas>
  );
};

export default VRRoom; 