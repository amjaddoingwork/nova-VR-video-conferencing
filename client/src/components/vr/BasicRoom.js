import React from 'react';
import { Box, Plane } from '@react-three/drei';

const BasicRoom = ({ type = 'auditorium' }) => {
  // Room dimensions based on type
  const dimensions = {
    auditorium: { width: 20, height: 10, depth: 20 },
    boardroom: { width: 15, height: 8, depth: 15 },
    classroom: { width: 12, height: 6, depth: 12 }
  };

  const { width, height, depth } = dimensions[type] || dimensions.auditorium;

  return (
    <group>
      {/* Floor */}
      <Plane
        args={[width, depth]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -height/2, 0]}
      >
        <meshStandardMaterial color="#808080" />
      </Plane>

      {/* Ceiling */}
      <Plane
        args={[width, depth]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height/2, 0]}
      >
        <meshStandardMaterial color="#ffffff" />
      </Plane>

      {/* Walls */}
      <Box args={[width, height, 0.1]} position={[0, 0, -depth/2]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>
      <Box args={[width, height, 0.1]} position={[0, 0, depth/2]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>
      <Box args={[0.1, height, depth]} position={[-width/2, 0, 0]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>
      <Box args={[0.1, height, depth]} position={[width/2, 0, 0]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>
    </group>
  );
};

export default BasicRoom; 