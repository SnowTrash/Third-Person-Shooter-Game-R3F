import { Canvas } from '@react-three/fiber';
import { useInfluenceZones, type ZoneType } from '../context/InfluenceZoneContext';
import { useLeafMorphHistory } from '../context/LeafMorphHistoryContext';
import { getLeafPropertiesFromZone } from '../systems/LeafGeometrySystem';
import * as THREE from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { AdaptiveLeafMesh } from './AdaptiveLeafMesh';
import TailPlant from './ProceduralTailPlant';

// Zone type to botanical color mapping
const ZoneColors: Record<ZoneType, string> = {
  'ice': '#A8D8EA',
  'jump_boost': '#FFE066',
  'damage': '#E85D75',
  'slow': '#9B8B7D',
  'speed_boost': '#7FD8BE',
};

interface MiniVisualizerProps {
  size?: number;
}

const MiniVisualizerCanvas: React.FC<MiniVisualizerProps> = ({ size = 200 }) => {
  const { playerZoneState } = useInfluenceZones();
  const { dominantZone } = playerZoneState;
  const { recordZoneMorph } = useLeafMorphHistory();
  const prevDominantZoneRef = useRef<string | null>(null);
  const visitedZonesRef = useRef<Set<string>>(new Set());

  // Track zone changes and record morph history
  useEffect(() => {
    if (!dominantZone) return;

    const zoneId = dominantZone.id;
    
    // Record morph when entering a new zone
    if (prevDominantZoneRef.current !== zoneId) {
      const morphProps = getLeafPropertiesFromZone(dominantZone.type);
      recordZoneMorph(zoneId, morphProps);
      visitedZonesRef.current.add(zoneId);
      prevDominantZoneRef.current = zoneId;
    }
  }, [dominantZone, recordZoneMorph]);

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

  const zoneColor = useMemo(
    () => (dominantZone ? ZoneColors[dominantZone.type] : '#666666'),
    [dominantZone]
  );

  const showTailPlant = useMemo(() => {
    if (!dominantZone) return false;
    return dominantZone.type === 'speed_boost' || dominantZone.type === 'slow';
  }, [dominantZone]);

  // Get accumulated morph or use current zone morph
  const currentZoneType = useMemo(
    () => dominantZone?.type || 'default',
    [dominantZone]
  );

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
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[8, 8, 8]} intensity={2.0} />
        <directionalLight position={[-5, -5, -5]} intensity={0.8} />
        <pointLight position={[3, 3, 3]} intensity={1.2} color={color} />
        <pointLight position={[-3, -3, 3]} intensity={0.8} color="#fff" />

        {/* 
          Leaf morph that accumulates changes with CLAMP
          Shows the current accumulated leaf state based on visited zones
        */}
        <AdaptiveLeafMesh zoneType={currentZoneType} color={color} />

        {/* Optional tail plant for specific zones */}
        {showTailPlant && (
          <TailPlant
            segments={14}
            length={1.8}
            color={new THREE.Color(zoneColor)}
          />
        )}
      </Canvas>

      {/* Leaf morphology info text */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          right: '8px',
          fontSize: '9px',
          color: dominantZone ? ZoneColors[dominantZone.type] : '#999',
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
          {visitedZonesRef.current.size} zones visited
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
