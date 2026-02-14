import { Canvas, useFrame } from '@react-three/fiber';
import { useInfluenceZones, type ZoneType } from '../context/InfluenceZoneContext';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';

// Zone type to shape mapping
const ZoneShapes: Record<ZoneType, 'sphere' | 'torus' | 'icosahedron' | 'octahedron' | 'cube'> = {
  'ice': 'icosahedron',
  'jump_boost': 'octahedron',
  'damage': 'cube',
  'slow': 'torus',
  'speed_boost': 'sphere',
};

const ZoneShapeColors: Record<ZoneType, string> = {
  'ice': '#87CEEB',
  'jump_boost': '#FFD700',
  'damage': '#FF6B6B',
  'slow': '#8B4513',
  'speed_boost': '#00FF00',
};

interface MorphingShapeProps {
  shapeType: 'sphere' | 'torus' | 'icosahedron' | 'octahedron' | 'cube';
  color: THREE.Color;
  intensity: number;
}

const MorphingShape: React.FC<MorphingShapeProps> = ({ shapeType, color, intensity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color },
        uIntensity: { value: intensity },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vTime;
        
        uniform float uTime;
        uniform float uIntensity;
        
        vec3 morph(vec3 pos, float t) {
          vec3 morphed = pos;
          morphed += normalize(pos) * sin(uTime * 2.0 + t) * 0.3 * uIntensity;
          return morphed;
        }
        
        void main() {
          vPosition = morph(position, 0.5);
          vNormal = normalize(normalMatrix * normal);
          vTime = uTime;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vTime;
        
        uniform vec3 uColor;
        uniform float uIntensity;
        
        void main() {
          vec3 light = normalize(vec3(1.0, 1.0, 1.0));
          float diffuse = max(dot(vNormal, light), 0.0);
          
          float glow = (sin(vTime * 3.0) * 0.5 + 0.5) * uIntensity;
          
          vec3 finalColor = uColor * (diffuse * 0.8 + 0.2) + vec3(1.0) * glow * 0.3;
          
          gl_FragColor = vec4(finalColor, 0.9);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uColor.value = color;
      materialRef.current.uniforms.uIntensity.value = intensity;
    }

    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
      meshRef.current.rotation.z += 0.003;
    }
  });

  return (
    <mesh ref={meshRef}>
      {shapeType === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
      {shapeType === 'torus' && <torusGeometry args={[0.7, 0.3, 16, 100]} />}
      {shapeType === 'icosahedron' && <icosahedronGeometry args={[1, 4]} />}
      {shapeType === 'octahedron' && <octahedronGeometry args={[1, 2]} />}
      {shapeType === 'cube' && <boxGeometry args={[1.5, 1.5, 1.5]} />}

      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
};

interface MiniVisualizerProps {
  size?: number;
}

const MiniVisualizerCanvas: React.FC<MiniVisualizerProps> = ({ size = 200 }) => {
  const { playerZoneState } = useInfluenceZones();
  const { dominantZone, isInZone } = playerZoneState;

  const shapeType = useMemo(() => {
    return dominantZone ? ZoneShapes[dominantZone.type] : 'sphere';
  }, [dominantZone]);

  const color = useMemo(() => {
    return new THREE.Color(dominantZone ? ZoneShapeColors[dominantZone.type] : '#666666');
  }, [dominantZone]);

  const intensity = isInZone ? 1.0 : 0.3;

  return (
    <Canvas
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        border: dominantZone ? `2px solid ${ZoneShapeColors[dominantZone.type]}` : '2px solid #666',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        cursor: 'pointer',
      }}
      camera={{ position: [0, 0, 3], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <MorphingShape shapeType={shapeType} color={color} intensity={intensity} />
    </Canvas>
  );
};

export const ZoneMiniVisualizer: React.FC<{ size?: number }> = ({ size = 200 }) => {
  return <MiniVisualizerCanvas size={size} />;
};
