import React, { useEffect, useState } from 'react';
import { Interactive, useXR } from '@react-three/xr';
import { useFBX } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Text } from '@react-three/drei';
import useVRStore from '../../store/vrStore';
import { SimpleAvatar } from './SimpleAvatar';

// 3D Avatar component that handles loading and displaying 3D models
const Avatar3DModel = ({ id, type, position, isVideoOff, isMuted, name, stream, participant, audioSystem }) => {
  const [hasError, setHasError] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [model, setModel] = useState(null);
  const { isPresenting } = useXR();
  
  // Get the avatar data from the store or set default scale
  const avatarData = useVRStore(state => state.avatars[id] || {});
  const defaultScale = 0.05;
  const modelScale = avatarData.scale || defaultScale;
  
  const updateAvatarScale = useVRStore(state => state.updateAvatarScale);
  
  // Provide actual paths to your model files
  const modelPaths = {
    dragon: '/models/fbx2/Dragon_Baked_Actions_fbx_7.4_binary.fbx',
    wolf: '/models/fbx2/Wolf_fbx.fbx'
  };
  
  // Load models using Suspense-friendly hooks
  const dragonModel = useFBX(modelPaths.dragon);
  const wolfModel = useFBX(modelPaths.wolf);
  
  const increaseSize = () => {
    const newScale = modelScale * 1.2;
    updateAvatarScale(id, newScale);
  };
  
  const decreaseSize = () => {
    const newScale = modelScale * 0.8;
    updateAvatarScale(id, newScale);
  };
  
  useEffect(() => {
    try {
      if (type === 'dragon' && dragonModel) {
        setModel(dragonModel.clone());
        setModelLoaded(true);
      } else if (type === 'wolf' && wolfModel) {
        setModel(wolfModel.clone());
        setModelLoaded(true);
      }
    } catch (error) {
      console.error('Error loading 3D model:', error);
      setHasError(true);
    }
  }, [type, dragonModel, wolfModel]);
  
  // Explicitly handle loading errors
  useEffect(() => {
    // Create a flag to track if component is still mounted
    let isMounted = true;
    let modelLoadTimeout = null;
    
    const loadModel = async () => {
      try {
        const loader = new FBXLoader();
        const modelPath = type === 'dragon' ? modelPaths.dragon : modelPaths.wolf;
        
        // Set timeout to prevent hanging
        modelLoadTimeout = setTimeout(() => {
          if (isMounted) {
            console.warn(`${type} model load timed out`);
            setHasError(true);
          }
        }, 5000);
        
        loader.load(
          modelPath,
          (loadedModel) => {
            if (isMounted) {
              clearTimeout(modelLoadTimeout);
              console.log('Model loaded successfully:', modelPath);
              setHasError(false);
            }
          },
          (xhr) => {
            // Loading progress
            console.log(`Loading model: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
          },
          (error) => {
            if (isMounted) {
              clearTimeout(modelLoadTimeout);
              console.error('Error loading model:', error);
              setHasError(true);
            }
          }
        );
      } catch (err) {
        if (isMounted) {
          clearTimeout(modelLoadTimeout);
          console.error('Exception while loading model:', err);
          setHasError(true);
        }
      }
    };
    
    loadModel();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (modelLoadTimeout) clearTimeout(modelLoadTimeout);
    };
  }, [type]);
  
  if (hasError || !modelLoaded) {
    return <SimpleAvatar position={position} isVideoOff={isVideoOff} isMuted={isMuted} name={name} stream={stream} />;
  }

  return (
    <group position={position}>
      {model && (
        <Interactive onSelect={() => console.log(`Avatar ${id} selected`)}>
          <group scale={[modelScale, modelScale, modelScale]}>
            <primitive object={model} />
          </group>
        </Interactive>
      )}
      
      {/* Size controls - only shown in VR mode */}
      {isPresenting && (
        <group position={[0, 1, 0]}>
          <Interactive onSelect={increaseSize}>
            <mesh position={[0.3, 0, 0]} scale={0.1}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="green" />
              <Text position={[0, 0, 0.6]} scale={0.5} color="white">
                +
              </Text>
            </mesh>
          </Interactive>
          
          <Interactive onSelect={decreaseSize}>
            <mesh position={[-0.3, 0, 0]} scale={0.1}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="red" />
              <Text position={[0, 0, 0.6]} scale={0.5} color="white">
                -
              </Text>
            </mesh>
          </Interactive>
        </group>
      )}
      
      {/* Name display */}
      <Text
        position={[0, -0.5, 0]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {name || (participant?.isGuest ? 'Guest' : 'Unknown')}
      </Text>
      
      {/* Status indicators */}
      {isMuted && (
        <mesh position={[0.4, -0.3, 0]} scale={0.1}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
      
      {isVideoOff && (
        <mesh position={[-0.4, -0.3, 0]} scale={0.1}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      )}
    </group>
  );
};

export default Avatar3DModel; 