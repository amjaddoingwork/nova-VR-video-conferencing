import React from 'react';
import * as THREE from 'three';
import { Sky } from '@react-three/drei';

// Modern Conference Room with corporate styling
export const ConferenceRoom = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} className="floor-target">
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.5} />
      </mesh>
      
      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, 4, -20]}>
        <boxGeometry args={[40, 9, 0.3]} />
        <meshStandardMaterial color="#EAEAEA" roughness={0.5} />
      </mesh>
      
      {/* Front wall with opening for door */}
      <mesh position={[-14, 4, 20]}>
        <boxGeometry args={[12, 9, 0.3]} />
        <meshStandardMaterial color="#EAEAEA" roughness={0.5} />
      </mesh>
      <mesh position={[14, 4, 20]}>
        <boxGeometry args={[12, 9, 0.3]} />
        <meshStandardMaterial color="#EAEAEA" roughness={0.5} />
      </mesh>
      <mesh position={[0, 7, 20]}>
        <boxGeometry args={[16, 2, 0.3]} />
        <meshStandardMaterial color="#EAEAEA" roughness={0.5} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-20, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[40, 9, 0.3]} />
        <meshStandardMaterial color="#EAEAEA" roughness={0.5} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[20, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[40, 9, 0.3]} />
        <meshStandardMaterial color="#EAEAEA" roughness={0.5} />
      </mesh>
      
      {/* Large conference table */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[12, 0.2, 6]} />
        <meshStandardMaterial color="#5d4037" roughness={0.2} metalness={0.3} />
      </mesh>
      
      {/* Table supports */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[10, 1, 4]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.3} metalness={0.4} />
      </mesh>
      
      {/* Chairs - 10 chairs around the table */}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={`chair-left-${i}`} position={[-5 + i * 2.5, 0, -3.5]} rotation={[0, Math.PI, 0]}>
          {/* Chair seat */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {/* Chair back */}
          <mesh position={[0, 1.2, -0.5]}>
            <boxGeometry args={[1, 1.5, 0.1]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {/* Chair legs */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
            <meshStandardMaterial color="#555555" metalness={0.7} />
          </mesh>
        </group>
      ))}
      
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={`chair-right-${i}`} position={[-5 + i * 2.5, 0, 3.5]}>
          {/* Chair seat */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {/* Chair back */}
          <mesh position={[0, 1.2, 0.5]}>
            <boxGeometry args={[1, 1.5, 0.1]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {/* Chair legs */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
            <meshStandardMaterial color="#555555" metalness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* Windows on both sides */}
      {[-15, -10, -5, 5, 10, 15].map((x, i) => (
        <mesh key={`window-left-${i}`} position={[-19.9, 4, x]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4, 3]} />
          <meshStandardMaterial color="#90caf9" emissive="#64b5f6" emissiveIntensity={0.3} transparent opacity={0.7} />
        </mesh>
      ))}
      
      {[-15, -10, -5, 5, 10, 15].map((x, i) => (
        <mesh key={`window-right-${i}`} position={[19.9, 4, x]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[4, 3]} />
          <meshStandardMaterial color="#90caf9" emissive="#64b5f6" emissiveIntensity={0.3} transparent opacity={0.7} />
        </mesh>
      ))}
      
      {/* Ceiling lights - 6 large rectangular panels */}
      {[-10, 0, 10].map((x, i) => (
        <group key={`lights-${i}`}>
          <mesh position={[x, 7.9, -6]}>
            <boxGeometry args={[7, 0.1, 3]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[x, 7.9, 6]}>
            <boxGeometry args={[7, 0.1, 3]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Decorative elements */}
      {/* TV Screen */}
      <group position={[0, 4, -19.5]}>
        <mesh>
          <boxGeometry args={[12, 7, 0.2]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[11.5, 6.5]} />
          <meshStandardMaterial color="#111111" emissive="#333333" emissiveIntensity={0.2} />
        </mesh>
      </group>
      
      {/* Plants in corners */}
      {[[-18, -18], [18, -18], [-18, 18], [18, 18]].map(([x, z], i) => (
        <group key={`plant-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.8, 1, 1, 16]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#388E3C" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Outdoor Nature Setting with mountains and sky
export const OutdoorSetting = () => {
  return (
    <group>
      {/* Ground plane with texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} className="floor-target">
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#7CFC00" />
      </mesh>
      
      {/* Sky elements */}
      <Sky 
        distance={450000} 
        sunPosition={[0, 1, 0]} 
        inclination={0.6}
        azimuth={0.25}
      />
      
      {/* Mountains in the distance - more varied */}
      <group position={[0, 0, -60]}>
        {/* Large central mountain range */}
        <mesh position={[0, 20, 0]}>
          <coneGeometry args={[30, 40, 6]} />
          <meshStandardMaterial color="#4b5320" />
        </mesh>
        
        {/* Secondary peaks */}
        <mesh position={[-25, 15, 5]}>
          <coneGeometry args={[15, 30, 6]} />
          <meshStandardMaterial color="#556b2f" />
        </mesh>
        
        <mesh position={[30, 18, 10]}>
          <coneGeometry args={[18, 36, 6]} />
          <meshStandardMaterial color="#4b5320" />
        </mesh>
        
        <mesh position={[-45, 10, 20]}>
          <coneGeometry args={[10, 20, 6]} />
          <meshStandardMaterial color="#556b2f" />
        </mesh>
        
        <mesh position={[50, 12, 15]}>
          <coneGeometry args={[14, 24, 6]} />
          <meshStandardMaterial color="#4b5320" />
        </mesh>
      </group>
      
      {/* Dense forest surroundings */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 35 + Math.random() * 40;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const scale = 0.8 + Math.random() * 0.7;
        return (
          <group key={i} position={[x, 0, z]} scale={[scale, scale, scale]}>
            {/* Tree trunk */}
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            
            {/* Tree foliage - multi-layered */}
            <mesh position={[0, 4, 0]}>
              <coneGeometry args={[2, 4, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            <mesh position={[0, 5, 0]}>
              <coneGeometry args={[1.5, 3, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            <mesh position={[0, 6, 0]}>
              <coneGeometry args={[1, 2, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        );
      })}
      
      {/* Large rocks forming a meeting circle - more natural looking */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 10;
        const z = Math.sin(angle) * 10;
        const rotationY = Math.random() * Math.PI;
        const scale = 0.7 + Math.random() * 0.6;
        return (
          <mesh 
            key={i} 
            position={[x, 0.3 + Math.random() * 0.2, z]} 
            rotation={[Math.random() * 0.2, rotationY, Math.random() * 0.2]} 
            scale={[scale, scale * 0.8, scale]}
          >
            <dodecahedronGeometry args={[1.2, 0]} />
            <meshStandardMaterial 
              color={Math.random() > 0.5 ? "#808080" : "#707070"} 
              roughness={0.8}
            />
          </mesh>
        );
      })}
      
      {/* Central campfire with emissive effects */}
      <group position={[0, 0, 0]}>
        {/* Fire pit stones in a more natural circle */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 1.5 + Math.random() * 0.3;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const scale = 0.7 + Math.random() * 0.3;
          return (
            <mesh 
              key={i} 
              position={[x, 0.15 + Math.random() * 0.1, z]} 
              rotation={[Math.random(), Math.random(), Math.random()]}
              scale={[scale, scale * 0.7, scale]}
            >
              <dodecahedronGeometry args={[0.4, 0]} />
              <meshStandardMaterial color="#696969" roughness={0.8} />
            </mesh>
          );
        })}
        
        {/* Logs arranged in a teepee shape */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <mesh 
              key={`log-${i}`} 
              position={[
                Math.cos(angle) * 0.3, 
                0.3, 
                Math.sin(angle) * 0.3
              ]} 
              rotation={[
                Math.PI * 0.25, 
                angle + Math.PI, 
                0
              ]}
            >
              <cylinderGeometry args={[0.1, 0.15, 2, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          );
        })}
        
        {/* Flames - animated with emissive material */}
        <mesh position={[0, 0.7, 0]}>
          <coneGeometry args={[0.7, 1.5, 8]} />
          <meshStandardMaterial color="#FF6600" emissive="#FF4500" emissiveIntensity={3} />
        </mesh>
        
        {/* Inner flame */}
        <mesh position={[0, 0.8, 0]} scale={[0.6, 0.8, 0.6]}>
          <coneGeometry args={[0.7, 1.5, 8]} />
          <meshStandardMaterial color="#FFCC00" emissive="#FFAA00" emissiveIntensity={5} />
        </mesh>
        
        {/* Subtle light to illuminate surroundings */}
        <pointLight position={[0, 1, 0]} intensity={2} color="#FF6600" distance={15} decay={2} />
      </group>
      
      {/* Scatter some small rocks and details around the scene */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 25;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const scale = 0.2 + Math.random() * 0.3;
        return (
          <mesh 
            key={`detail-${i}`} 
            position={[x, 0.1, z]} 
            rotation={[Math.random(), Math.random(), Math.random()]}
            scale={[scale, scale * 0.5, scale]}
          >
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial 
              color={Math.random() > 0.5 ? "#555555" : "#776655"} 
              roughness={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Futuristic Tech Space
export const FuturisticSpace = () => {
  return (
    <group>
      {/* Floor with grid pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} className="floor-target">
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#0a192f" 
          emissive="#64ffda" 
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#020c1b" />
      </mesh>
      
      {/* Walls with glowing edges */}
      {/* Back wall */}
      <group position={[0, 2.25, -15]}>
        <mesh>
          <boxGeometry args={[30, 5.5, 0.2]} />
          <meshStandardMaterial color="#020c1b" />
        </mesh>
        {/* Glowing edge */}
        <mesh position={[0, -2.75, 0.15]}>
          <boxGeometry args={[30, 0.05, 0.05]} />
          <meshStandardMaterial color="#64ffda" emissive="#64ffda" emissiveIntensity={1} />
        </mesh>
      </group>
      
      {/* Front wall */}
      <group position={[0, 2.25, 15]}>
        <mesh>
          <boxGeometry args={[30, 5.5, 0.2]} />
          <meshStandardMaterial color="#020c1b" />
        </mesh>
        {/* Glowing edge */}
        <mesh position={[0, -2.75, -0.15]}>
          <boxGeometry args={[30, 0.05, 0.05]} />
          <meshStandardMaterial color="#64ffda" emissive="#64ffda" emissiveIntensity={1} />
        </mesh>
      </group>
      
      {/* Left wall */}
      <group position={[-15, 2.25, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[30, 5.5, 0.2]} />
          <meshStandardMaterial color="#020c1b" />
        </mesh>
        {/* Glowing edge */}
        <mesh position={[0, -2.75, 0.15]}>
          <boxGeometry args={[30, 0.05, 0.05]} />
          <meshStandardMaterial color="#64ffda" emissive="#64ffda" emissiveIntensity={1} />
        </mesh>
      </group>
      
      {/* Right wall */}
      <group position={[15, 2.25, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[30, 5.5, 0.2]} />
          <meshStandardMaterial color="#020c1b" />
        </mesh>
        {/* Glowing edge */}
        <mesh position={[0, -2.75, -0.15]}>
          <boxGeometry args={[30, 0.05, 0.05]} />
          <meshStandardMaterial color="#64ffda" emissive="#64ffda" emissiveIntensity={1} />
        </mesh>
      </group>
      
      {/* Central holographic table */}
      <group position={[0, 0.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[3, 3.5, 0.2, 32]} />
          <meshStandardMaterial color="#0a192f" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Holographic display */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[1.5, 32, 16]} />
          <meshStandardMaterial 
            color="#64ffda"
            transparent
            opacity={0.3}
            emissive="#64ffda"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Base ring with glow */}
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[3.2, 0.1, 16, 32]} />
          <meshStandardMaterial color="#64ffda" emissive="#64ffda" emissiveIntensity={1} />
        </mesh>
      </group>
      
      {/* Floating info panels */}
      {[1, 2, 3].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        const x = Math.cos(angle) * 8;
        const z = Math.sin(angle) * 8;
        return (
          <group key={i} position={[x, 2, z]} rotation={[0, -angle + Math.PI, 0]}>
            <mesh>
              <planeGeometry args={[3, 2]} />
              <meshStandardMaterial 
                color="#0a192f"
                emissive="#64ffda"
                emissiveIntensity={0.1}
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Panel frame */}
            <mesh position={[0, 0, 0.01]}>
              <boxGeometry args={[3, 2, 0.05]} />
              <meshBasicMaterial color="#0a192f" transparent opacity={0} wireframe />
            </mesh>
            {/* Connection beam to floor */}
            <mesh position={[0, -2, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 2]} />
              <meshStandardMaterial color="#64ffda" emissive="#64ffda" emissiveIntensity={0.5} />
            </mesh>
          </group>
        );
      })}
      
      {/* Ambient lighting columns */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 12;
        const z = Math.sin(angle) * 12;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 5]} />
              <meshStandardMaterial color="#0a192f" />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 5]} />
              <meshStandardMaterial 
                color="#64ffda" 
                emissive="#64ffda" 
                emissiveIntensity={0.5}
                transparent
                opacity={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Educational Classroom Environment
export const Classroom = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} className="floor-target">
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#d7ccc8" />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Walls */}
      {/* Back wall with whiteboard */}
      <mesh position={[0, 2, -7.5]}>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Whiteboard */}
      <mesh position={[0, 2, -7.4]}>
        <boxGeometry args={[10, 3, 0.05]} />
        <meshStandardMaterial color="white" roughness={0.1} />
      </mesh>
      
      {/* Front wall with door */}
      <mesh position={[-6, 2, 7.5]}>
        <boxGeometry args={[8, 5, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      <mesh position={[6, 2, 7.5]}>
        <boxGeometry args={[8, 5, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      <mesh position={[0, 3.75, 7.5]}>
        <boxGeometry args={[4, 1.5, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Left wall with windows */}
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[15, 5, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Windows on left wall */}
      {[-5, 0, 5].map((z, i) => (
        <mesh key={i} position={[-9.9, 2, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2, 2]} />
          <meshStandardMaterial 
            color="#90caf9" 
            transparent 
            opacity={0.7} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      ))}
      
      {/* Right wall */}
      <mesh position={[10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[15, 5, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* Teacher's desk */}
      <group position={[0, 0, -5]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[3, 0.1, 1.5]} />
          <meshStandardMaterial color="#795548" />
        </mesh>
        <mesh position={[-1.4, 0, 0]}>
          <boxGeometry args={[0.1, 1.2, 1.5]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        <mesh position={[1.4, 0, 0]}>
          <boxGeometry args={[0.1, 1.2, 1.5]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
      </group>
      
      {/* Student desks in rows */}
      {[0, 1, 2].map((row) => {
        return [-3, 0, 3].map((col, i) => (
          <group key={`${row}-${i}`} position={[col, 0, row * 2.5]}>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[1.5, 0.05, 1]} />
              <meshStandardMaterial color="#a1887f" />
            </mesh>
            <mesh position={[0, 0, 0.4]}>
              <boxGeometry args={[1.5, 0.8, 0.05]} />
              <meshStandardMaterial color="#8d6e63" />
            </mesh>
            <mesh position={[-0.7, -0.1, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1]} />
              <meshStandardMaterial color="#5d4037" />
            </mesh>
            <mesh position={[0.7, -0.1, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1]} />
              <meshStandardMaterial color="#5d4037" />
            </mesh>
          </group>
        ));
      })}
      
      {/* Lighting */}
      {[-3, 3].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 3.9, -3]}>
            <boxGeometry args={[4, 0.1, 1]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[x, 3.9, 3]}>
            <boxGeometry args={[4, 0.1, 1]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
      
      {/* Decorations - posters on walls */}
      <mesh position={[8, 2, -7]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#4fc3f7" />
      </mesh>
      <mesh position={[-8, 2, -7]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#ff8a65" />
      </mesh>
      <mesh position={[8, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#81c784" />
      </mesh>
    </group>
  );
};

// Executive Boardroom with premium finishes
export const BoardRoom = () => {
  return (
    <group>
      {/* Floor - premium dark wood */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} className="floor-target">
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#3E2723" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Ceiling - coffered design */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 9, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.5} />
      </mesh>
      
      {/* Decorative ceiling coffers */}
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 5 }).map((_, j) => (
          <mesh key={`coffer-${i}-${j}`} position={[i * 8 - 16, 8.9, j * 8 - 16]}>
            <boxGeometry args={[7, 0.2, 7]} />
            <meshStandardMaterial color="#E0E0E0" roughness={0.5} />
          </mesh>
        ))
      )}
      
      {/* Walls - wood paneling */}
      {/* Back wall */}
      <mesh position={[0, 4.5, -25]}>
        <boxGeometry args={[50, 10, 0.4]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>
      
      {/* Front wall with double doors */}
      <mesh position={[-15, 4.5, 25]}>
        <boxGeometry args={[20, 10, 0.4]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>
      <mesh position={[15, 4.5, 25]}>
        <boxGeometry args={[20, 10, 0.4]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>
      <mesh position={[0, 8, 25]}>
        <boxGeometry args={[10, 3, 0.4]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>
      
      {/* Doors */}
      <group position={[0, 3, 25]}>
        <mesh position={[-2.5, 0, 0]}>
          <boxGeometry args={[4.5, 7, 0.2]} />
          <meshStandardMaterial color="#8D6E63" roughness={0.5} />
        </mesh>
        <mesh position={[2.5, 0, 0]}>
          <boxGeometry args={[4.5, 7, 0.2]} />
          <meshStandardMaterial color="#8D6E63" roughness={0.5} />
        </mesh>
        
        {/* Door handles */}
        <mesh position={[-0.5, 0, 0.15]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.5, 0, 0.15]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      {/* Side walls */}
      <mesh position={[-25, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[50, 10, 0.4]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>
      <mesh position={[25, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[50, 10, 0.4]} />
        <meshStandardMaterial color="#5D4037" roughness={0.6} />
      </mesh>
      
      {/* Large executive boardroom table - boat shaped */}
      <group position={[0, 1.5, 0]}>
        {/* Main table top */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[18, 0.2, 6]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.2} metalness={0.3} />
        </mesh>
        
        {/* Table base */}
        <mesh position={[0, -0.8, 0]}>
          <boxGeometry args={[16, 1.4, 4]} />
          <meshStandardMaterial color="#212121" roughness={0.3} metalness={0.4} />
        </mesh>
        
        {/* Table edging */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[18.2, 0.1, 6.2]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Executive chairs - 16 chairs around the table */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`chair-left-${i}`} position={[-7.5 + i * 2.2, 0, -3.5]} rotation={[0, Math.PI, 0]}>
          {/* Chair seat */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1, 0.2, 1]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          {/* Chair back */}
          <mesh position={[0, 2, -0.5]}>
            <boxGeometry args={[1, 2, 0.2]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          {/* Chair arms */}
          <mesh position={[-0.6, 1.5, 0]}>
            <boxGeometry args={[0.1, 0.5, 1]} />
            <meshStandardMaterial color="#212121" />
          </mesh>
          <mesh position={[0.6, 1.5, 0]}>
            <boxGeometry args={[0.1, 0.5, 1]} />
            <meshStandardMaterial color="#212121" />
          </mesh>
          {/* Chair base */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
            <meshStandardMaterial color="#424242" metalness={0.5} />
          </mesh>
        </group>
      ))}
      
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`chair-right-${i}`} position={[-7.5 + i * 2.2, 0, 3.5]}>
          {/* Chair seat */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1, 0.2, 1]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          {/* Chair back */}
          <mesh position={[0, 2, 0.5]}>
            <boxGeometry args={[1, 2, 0.2]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          {/* Chair arms */}
          <mesh position={[-0.6, 1.5, 0]}>
            <boxGeometry args={[0.1, 0.5, 1]} />
            <meshStandardMaterial color="#212121" />
          </mesh>
          <mesh position={[0.6, 1.5, 0]}>
            <boxGeometry args={[0.1, 0.5, 1]} />
            <meshStandardMaterial color="#212121" />
          </mesh>
          {/* Chair base */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
            <meshStandardMaterial color="#424242" metalness={0.5} />
          </mesh>
        </group>
      ))}
      
      {/* Presentation display wall with premium finishes */}
      <group position={[0, 4.5, -24.5]}>
        {/* Display frame */}
        <mesh position={[0, 0, 0.3]}>
          <boxGeometry args={[25, 7, 0.5]} />
          <meshStandardMaterial color="#212121" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0, 0.6]}>
          <boxGeometry args={[24, 6, 0.1]} />
          <meshStandardMaterial color="#111111" emissive="#222222" emissiveIntensity={0.2} />
        </mesh>
      </group>
      
      {/* Recessed ceiling lights */}
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <mesh key={`light-${i}-${j}`} position={[i * 10 - 20, 8.95, j * 15 - 15]}>
            <circleGeometry args={[1.5, 24]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
          </mesh>
        ))
      )}
      
      {/* Wall sconces */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`sconce-left-${i}`}>
          <mesh position={[-24.8, 5, i * 8 - 20]}>
            <boxGeometry args={[0.2, 1, 0.5]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[-24.7, 5, i * 8 - 20]}>
            <boxGeometry args={[0.1, 0.8, 0.4]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`sconce-right-${i}`}>
          <mesh position={[24.8, 5, i * 8 - 20]}>
            <boxGeometry args={[0.2, 1, 0.5]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[24.7, 5, i * 8 - 20]}>
            <boxGeometry args={[0.1, 0.8, 0.4]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Large art pieces */}
      <mesh position={[-24.8, 4.5, -10]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#0288D1" />
      </mesh>
      
      <mesh position={[-24.8, 4.5, 10]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#D32F2F" />
      </mesh>
      
      <mesh position={[24.8, 4.5, -10]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#C2185B" />
      </mesh>
      
      <mesh position={[24.8, 4.5, 10]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#7B1FA2" />
      </mesh>
    </group>
  );
};

// Large Auditorium with stadium seating
export const Auditorium = () => {
  return (
    <group>
      {/* Floor - central area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} className="floor-target">
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#212121" roughness={0.8} />
      </mesh>
      
      {/* Ceiling - curved */}
      <mesh position={[0, 15, 0]}>
        <sphereGeometry args={[40, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#222222" side={THREE.BackSide} roughness={0.9} />
      </mesh>
      
      {/* Stage */}
      <group position={[0, 0, -20]}>
        {/* Stage platform */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[30, 1, 15]} />
          <meshStandardMaterial color="#4E342E" roughness={0.6} />
        </mesh>
        
        {/* Stage front */}
        <mesh position={[0, -0.25, 7.5]}>
          <boxGeometry args={[30, 0.5, 0.2]} />
          <meshStandardMaterial color="#3E2723" roughness={0.5} />
        </mesh>
        
        {/* Podium */}
        <group position={[-10, 1.5, -5]}>
          {/* Podium stand */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.5, 1, 1.5]} />
            <meshStandardMaterial color="#212121" roughness={0.3} />
          </mesh>
          
          {/* Podium top */}
          <mesh position={[0, 0.6, -0.5]} rotation={[Math.PI / 8, 0, 0]}>
            <boxGeometry args={[2.5, 0.2, 2]} />
            <meshStandardMaterial color="#212121" roughness={0.3} />
          </mesh>
          
          {/* Podium front logo */}
          <mesh position={[0, 0, 0.8]}>
            <planeGeometry args={[2, 0.8]} />
            <meshStandardMaterial color="#1976D2" emissive="#1565C0" emissiveIntensity={0.5} />
          </mesh>
        </group>
        
        {/* Large presentation screens */}
        <mesh position={[0, 7, -7]}>
          <boxGeometry args={[24, 12, 0.5]} />
          <meshStandardMaterial color="#121212" />
        </mesh>
        
        <mesh position={[0, 7, -6.7]}>
          <planeGeometry args={[23, 11]} />
          <meshStandardMaterial color="#171717" emissive="#333333" emissiveIntensity={0.2} />
        </mesh>
      </group>
      
      {/* Seating - stadium style in semicircle */}
      {Array.from({ length: 5 }).map((_, row) => {
        const radius = 25 + row * 7;
        return Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 19) * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius + 10;
          
          return (
            <group key={`seat-${row}-${i}`} position={[x, row * 1.2, z]} rotation={[0, -angle, 0]}>
              {/* Seat base */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.2, 0.4, 2]} />
                <meshStandardMaterial color="#1A237E" roughness={0.8} />
              </mesh>
              
              {/* Seat back */}
              <mesh position={[0, 0.8, -0.9]}>
                <boxGeometry args={[2.2, 1.2, 0.2]} />
                <meshStandardMaterial color="#1A237E" roughness={0.8} />
              </mesh>
              
              {/* Armrests */}
              <mesh position={[-1, 0.5, 0]}>
                <boxGeometry args={[0.2, 0.2, 2]} />
                <meshStandardMaterial color="#303F9F" roughness={0.5} />
              </mesh>
              
              <mesh position={[1, 0.5, 0]}>
                <boxGeometry args={[0.2, 0.2, 2]} />
                <meshStandardMaterial color="#303F9F" roughness={0.5} />
              </mesh>
            </group>
          );
        });
      })}
      
      {/* Main walls - circular */}
      <mesh position={[0, 7, 0]}>
        <cylinderGeometry args={[40, 40, 15, 32, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#424242" side={THREE.BackSide} roughness={0.7} />
      </mesh>
      
      {/* Entrance at the back */}
      <group position={[0, 3, 39.5]}>
        {/* Door frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 7, 1]} />
          <meshStandardMaterial color="#616161" roughness={0.6} />
        </mesh>
        
        {/* Door opening */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8, 6, 1.2]} />
          <meshStandardMaterial color="#0D0D0D" roughness={0.9} />
        </mesh>
      </group>
      
      {/* Side entrances */}
      <group position={[-38, 3, 5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 5, 1]} />
          <meshStandardMaterial color="#616161" roughness={0.6} />
        </mesh>
        
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 4, 1.2]} />
          <meshStandardMaterial color="#0D0D0D" roughness={0.9} />
        </mesh>
      </group>
      
      <group position={[38, 3, 5]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 5, 1]} />
          <meshStandardMaterial color="#616161" roughness={0.6} />
        </mesh>
        
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 4, 1.2]} />
          <meshStandardMaterial color="#0D0D0D" roughness={0.9} />
        </mesh>
      </group>
      
      {/* Ceiling lights */}
      {Array.from({ length: 3 }).map((_, row) => {
        const radius = 10 + row * 10;
        return Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          if (z > 0) { // Only place lights in front half
            return (
              <mesh key={`light-${row}-${i}`} position={[x, 14.7, z]}>
                <circleGeometry args={[1.5, 24]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
              </mesh>
            );
          }
          return null;
        });
      })}
      
      {/* Stage spotlights */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI - Math.PI / 2;
        const radius = 25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={`spotlight-${i}`} position={[x, 14, z]} rotation={[Math.PI / 4, -angle, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.4, 0.8, 1.5, 16]} />
              <meshStandardMaterial color="#212121" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.8, 2, 16]} />
              <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.3} opacity={0.1} transparent={true} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Update getRoom function to include the new room types
export const getRoom = (type) => {
  switch (type) {
    case 'conference':
      return <ConferenceRoom />;
    case 'classroom':
      return <Classroom />;
    case 'outdoor':
      return <OutdoorSetting />;
    case 'futuristic':
      return <FuturisticSpace />;
    case 'boardroom':
      return <BoardRoom />;
    case 'auditorium':
      return <Auditorium />;
    default:
      return <ConferenceRoom />;
  }
}; 