import { Canvas, useFrame } from '@react-three/fiber';
import { useInfluenceZones, type ZoneType } from '../context/InfluenceZoneContext';
import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ParticleEffectMesh } from './ParticleEffectMesh';

// Zone type to shape mapping
const ZoneShapes: Record<ZoneType, 'sphere' | 'torus' | 'icosahedron' | 'octahedron' | 'cube' | 'dodecahedron'> = {
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
  shapeType: string;
  color: THREE.Color;
  intensity: number;
}

const AdvancedMorphingShape: React.FC<MorphingShapeProps> = ({
  shapeType,
  color,
  intensity,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const previousShapeRef = useRef<string>(shapeType);
  const morphProgressRef = useRef(0);
  const [shouldShowParticles, setShouldShowParticles] = useState(false);

  // Detect shape changes
  useEffect(() => {
    if (previousShapeRef.current !== shapeType) {
      morphProgressRef.current = 1;
      setShouldShowParticles(true);
      previousShapeRef.current = shapeType;

      // Hide particles after morph completes
      const timer = setTimeout(() => setShouldShowParticles(false), 800);
      return () => clearTimeout(timer);
    }
  }, [shapeType]);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color },
        uIntensity: { value: intensity },
        uMorphProgress: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vTime;
        varying float vMorphProgress;
        
        uniform float uTime;
        uniform float uIntensity;
        uniform float uMorphProgress;
        
        vec3 morph(vec3 pos, float t) {
          // Increase morph range during transitions
          float morphAmount = mix(0.2, 0.5, uMorphProgress);
          vec3 morphed = pos;
          morphed += normalize(pos) * sin(uTime * 2.0 + t) * morphAmount * uIntensity;
          
          // Add wave effect during morph
          morphed += normalize(pos) * sin(uMorphProgress * 3.14159) * 0.2;
          
          return morphed;
        }
        
        void main() {
          vPosition = morph(position, 0.5);
          vNormal = normalize(normalMatrix * normal);
          vTime = uTime;
          vMorphProgress = uMorphProgress;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vTime;
        varying float vMorphProgress;
        
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uMorphProgress;
        
        void main() {
          vec3 light = normalize(vec3(1.0, 1.0, 1.0));
          float diffuse = max(dot(vNormal, light), 0.0);
          
          // Enhanced glow during morph
          float glowIntensity = (sin(vTime * 3.0) * 0.5 + 0.5) * uIntensity;
          glowIntensity += sin(vMorphProgress * 3.14159) * 0.4;
          
          // Fresnel effect for edge glow
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
          
          // More vibrant bloom simulation
          vec3 finalColor = uColor * (diffuse * 0.8 + 0.2);
          finalColor += vec3(1.0) * glowIntensity * 0.5;
          finalColor += vec3(1.0) * fresnel * 0.4;
          
          // Add some saturation boost for bloom effect
          finalColor = mix(finalColor, uColor, uIntensity * 0.3);
          
          gl_FragColor = vec4(finalColor, 0.95);
        }
      `,
      transparent: true,
      wireframe: false,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uColor.value = color;
      materialRef.current.uniforms.uIntensity.value = intensity;

      // Smoothly interpolate morph progress
      morphProgressRef.current = THREE.MathUtils.lerp(
        morphProgressRef.current,
        0,
        0.1
      );
      materialRef.current.uniforms.uMorphProgress.value = morphProgressRef.current;
    }

    if (meshRef.current) {
      meshRef.current.rotation.x += 0.008;
      meshRef.current.rotation.y += 0.012;
      meshRef.current.rotation.z += 0.005;

      // Slight scale pulse during morph
      const morphScale = 1 + Math.sin(morphProgressRef.current * Math.PI) * 0.15;
      meshRef.current.scale.setScalar(morphScale);
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.copy(meshRef.current?.rotation || new THREE.Euler());
      if (meshRef.current) {
        wireframeRef.current.scale.copy(meshRef.current.scale);
      }
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        {shapeType === 'sphere' && <icosahedronGeometry args={[1, 6]} />}
        {shapeType === 'torus' && <torusGeometry args={[0.7, 0.3, 16, 100]} />}
        {shapeType === 'icosahedron' && <icosahedronGeometry args={[1, 5]} />}
        {shapeType === 'octahedron' && <octahedronGeometry args={[1, 3]} />}
        {shapeType === 'cube' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
        {shapeType === 'dodecahedron' && <dodecahedronGeometry args={[0.8, 0]} />}

        <primitive object={shaderMaterial} ref={materialRef} attach="material" />
      </mesh>

      {/* Glow outline using wireframe */}
      <mesh ref={wireframeRef}>
        {shapeType === 'sphere' && <icosahedronGeometry args={[1.05, 6]} />}
        {shapeType === 'torus' && <torusGeometry args={[0.75, 0.35, 16, 100]} />}
        {shapeType === 'icosahedron' && <icosahedronGeometry args={[1.05, 5]} />}
        {shapeType === 'octahedron' && <octahedronGeometry args={[1.05, 3]} />}
        {shapeType === 'cube' && <boxGeometry args={[1.6, 1.6, 1.6]} />}
        {shapeType === 'dodecahedron' && <dodecahedronGeometry args={[0.85, 0]} />}

        <meshBasicMaterial
          color={color}
          transparent
          opacity={intensity * 0.3}
          wireframe
          depthWrite={false}
        />
      </mesh>

      {/* Particle effect on morph */}
      {shouldShowParticles && <ParticleEffectMesh color={color} count={48} />}
    </group>
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
    return new THREE.Color(
      dominantZone ? ZoneShapeColors[dominantZone.type] : '#666666'
    );
  }, [dominantZone]);

  const intensity = isInZone ? 1.0 : 0.3;

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
            ? `2px solid ${ZoneShapeColors[dominantZone.type]}`
            : '2px solid #666',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          boxShadow: dominantZone
            ? `0 0 20px ${ZoneShapeColors[dominantZone.type]}80, inset 0 0 20px ${ZoneShapeColors[dominantZone.type]}20`
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
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-3, -3, 3]} intensity={0.8} color={color} />

        <AdvancedMorphingShape
          shapeType={shapeType}
          color={color}
          intensity={intensity}
        />
      </Canvas>

      {/* Info text overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          right: '8px',
          fontSize: '10px',
          color: dominantZone
            ? ZoneShapeColors[dominantZone.type]
            : '#999',
          fontWeight: 'bold',
          textAlign: 'center',
          textTransform: 'uppercase',
          textShadow: '0 0 4px rgba(0,0,0,0.8)',
          zIndex: 3,
        }}
      >
        {dominantZone ? dominantZone.type.replace(/_/g, ' ') : 'No Zone'}
      </div>
    </div>
  );
};

export const ZoneMiniVisualizer: React.FC<{ size?: number }> = ({
  size = 200,
}) => {
  return <MiniVisualizerCanvas size={size} />;
};
