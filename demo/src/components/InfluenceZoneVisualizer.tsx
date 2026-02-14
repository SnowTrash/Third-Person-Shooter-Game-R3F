import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInfluenceZones, type InfluenceZone } from '../context/InfluenceZoneContext';

export const InfluenceZoneVisualizer: React.FC<{ zone: InfluenceZone }> = ({ zone }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { playerZoneState } = useInfluenceZones();

  // Pulse animation when player is in the zone
  useFrame((state) => {
    if (!groupRef.current) return;

    const isActive = playerZoneState.dominantZone?.id === zone.id;
    const scale = isActive ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1 : 1;
    groupRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={groupRef} position={zone.position as any}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[zone.radius, 32, 32]} />
        <meshBasicMaterial
          color={zone.color}
          wireframe
          opacity={0.6}
          transparent
          fog={false}
        />
      </mesh>

      {/* Solid transparent sphere for visual reference */}
      <mesh>
        <sphereGeometry args={[zone.radius, 32, 32]} />
        <meshBasicMaterial
          color={zone.color}
          opacity={0.08}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Rotating ring to indicate zone */}
      <mesh rotation={[0.3, 0, 0]}>
        <torusGeometry args={[zone.radius * 0.95, 0.15, 16, 100]} />
        <meshBasicMaterial color={zone.color} opacity={0.4} transparent />
      </mesh>
    </group>
  );
};
