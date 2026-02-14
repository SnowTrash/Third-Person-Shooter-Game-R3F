import { Canvas } from '@react-three/fiber';
import { useInfluenceZones, type ZoneType } from '../context/InfluenceZoneContext';
import * as THREE from 'three';
import { useMemo } from 'react';
import MorphingOrganicMesh from './MorphingOrganicMesh';

// Zone type to botanical color mapping (leaf pigmentation by adaptation)
const ZoneColors: Record<ZoneType, string> = {
  'ice': '#A8D8EA',          // Cool blue - cold stress adaptation
  'jump_boost': '#FFE066',   // Golden - altitude/sun adaptation
  'damage': '#E85D75',       // Deep red - pressure stress response
  'slow': '#9B8B7D',         // Warm brown - drought/waxy leaves
  'speed_boost': '#7FD8BE',  // Vibrant green - optimal conditions
};


interface MiniVisualizerProps {
  size?: number;
}

const MiniVisualizerCanvas: React.FC<MiniVisualizerProps> = ({ size = 200 }) => {
  const { playerZoneState } = useInfluenceZones();
  const { dominantZone } = playerZoneState;

  const color = useMemo(() => {
    return new THREE.Color(
      dominantZone ? ZoneColors[dominantZone.type] : '#666666'
    );
  }, [dominantZone]);

  const zoneLabel = useMemo(() => {
    return dominantZone
      ? dominantZone.type.replace(/_/g, ' ').toUpperCase()
      : 'NO ZONE';
  }, [dominantZone]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: `${size}px`,
        height: `${size}px`,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '12px',
          border: dominantZone
            ? `2px solid ${ZoneColors[dominantZone.type]}`
            : '2px solid #666',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          boxShadow: dominantZone
            ? `0 0 20px ${ZoneColors[dominantZone.type]}80, inset 0 0 20px ${ZoneColors[dominantZone.type]}20`
            : 'none',
          zIndex: 1,
        }}
      />

      <Canvas
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '12px',
          zIndex: 2,
        }}
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.0} />
        <pointLight position={[-3, -3, 3]} intensity={0.6} color={color} />

        <MorphingOrganicMesh
          // map simple zone types to organic shapes for variety
          shape={
            dominantZone
              ? dominantZone.type === 'speed_boost'
                ? 'blob'
                : dominantZone.type === 'jump_boost'
                ? 'spike'
                : dominantZone.type === 'ice'
                ? 'gaussian_invert'
                : dominantZone.type === 'damage'
                ? 'torus'
                : 'smooth'
              : 'smooth'
          }
          color={color}
        />
      </Canvas>

      {/* Leaf morphology info text */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          right: '8px',
          fontSize: '9px',
          color: dominantZone
            ? ZoneColors[dominantZone.type]
            : '#999',
          fontWeight: 'bold',
          textAlign: 'center',
          textTransform: 'uppercase',
          textShadow: '0 0 4px rgba(0,0,0,0.8)',
          zIndex: 3,
          lineHeight: '1.2',
        }}
      >
        <div>{zoneLabel}</div>
        <div style={{ fontSize: '7px', opacity: 0.8, marginTop: '2px' }}>
          Morphing
        </div>
      </div>
    </div>
  );
};

export const ZoneMiniVisualizer: React.FC<{ size?: number }> = ({
  size = 200,
}) => {
  return <MiniVisualizerCanvas size={size} />;
};
