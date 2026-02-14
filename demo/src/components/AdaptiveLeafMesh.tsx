import * as THREE from 'three';
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  generateLeafGeometry,
  getLeafPropertiesFromZone,
} from '../systems/LeafGeometrySystem';
import { SporeEffectMesh } from './SporeEffectMesh';

interface LeafMorphState {
  currentLeafGeometry: THREE.BufferGeometry;
  targetLeafGeometry: THREE.BufferGeometry;
  morphProgress: number;
  isTransitioning: boolean;
}

/**
 * Animated leaf that morphs based on environmental conditions
 * Shows botanical adaptation to zone influence
 */
const AdaptiveLeafMesh = ({
  zoneType,
  color,
}: {
  zoneType: string;
  color: THREE.Color;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const morphStateRef = useRef<LeafMorphState>({
    currentLeafGeometry: new THREE.BufferGeometry(),
    targetLeafGeometry: new THREE.BufferGeometry(),
    morphProgress: 0,
    isTransitioning: false,
  });
  const materialRef = useRef<THREE.RawShaderMaterial | null>(null);
  const previousZoneType = useRef<string>('');
  const showSporesRef = useRef(false);

  // Botanical leaf shader material
  const leafMaterial = useMemo(() => {
    return new THREE.RawShaderMaterial({
      uniforms: {
        uColor: { value: color },
        uTime: { value: 0 },
        uMorphProgress: { value: 0 },
        uLightPos: { value: new THREE.Vector3(5, 10, 5) },
        uVeinIntensity: { value: 0.3 },
        uGlossiness: { value: 0.5 },
      },
      vertexShader: `
        precision highp float;
        
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;
        
        uniform mat4 modelMatrix;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
        uniform float uTime;
        uniform float uMorphProgress;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vMorphProgress;
        
        // Simplex-like noise for organic vein patterns
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float noise2d(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          vMorphProgress = uMorphProgress;
          
          // Subtle wave animation during morphing
          vec3 pos = position;
          if (uMorphProgress > 0.0 && uMorphProgress < 1.0) {
            float wave = sin(uTime * 3.0 + position.y * 5.0) * 0.05 * uMorphProgress;
            pos = pos + normal * wave;
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vMorphProgress;
        
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uMorphProgress;
        uniform vec3 uLightPos;
        uniform float uVeinIntensity;
        uniform float uGlossiness;
        
        // Vein pattern generation
        float veinPattern(vec2 uv) {
          float mainVein = smoothstep(0.1, 0.0, abs(uv.x - 0.5));
          float secondaryVein = smoothstep(0.08, 0.0, abs(uv.y - sin(uv.x * 6.0) * 0.3));
          return max(mainVein, secondaryVein) * 0.4;
        }
        
        // Stomata (pores) simulation
        float stomata(vec2 uv) {
          vec2 gridUv = fract(uv * 20.0);
          float dist = length(gridUv - vec2(0.5));
          return smoothstep(0.15, 0.0, dist) * 0.15;
        }
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(uLightPos);
          
          // Diffuse lighting
          float diffuse = max(dot(normal, lightDir), 0.2);
          
          // Vein patterns
          float veins = veinPattern(vUv) * uVeinIntensity;
          
          // Stomata (small pores)
          float pores = stomata(vUv) * 0.2;
          
          // Base leaf color with vein detail
          vec3 baseColor = uColor * (0.8 + veins + pores);
          
          // Morphing transition glow
          vec3 finalColor = baseColor * diffuse;
          
          if (vMorphProgress > 0.0 && vMorphProgress < 1.0) {
            // Glow effect during transition
            float glowIntensity = sin(vMorphProgress * 3.14159) * 0.3;
            finalColor += vec3(0.2, 0.4, 0.6) * glowIntensity;
          }
          
          // Opacity pulse during morphing
          float alpha = 0.85;
          if (vMorphProgress > 0.0 && vMorphProgress < 1.0) {
            alpha = 0.7 + sin(vMorphProgress * 3.14159) * 0.15;
          }
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      wireframe: false,
    });
  }, [color]);

  materialRef.current = leafMaterial;

  // Update leaf geometry when zone changes
  useEffect(() => {
    if (zoneType === previousZoneType.current) return;

    const currentProps = getLeafPropertiesFromZone(
      previousZoneType.current || 'default'
    );
    const targetProps = getLeafPropertiesFromZone(zoneType);

    morphStateRef.current.currentLeafGeometry = generateLeafGeometry(currentProps);
    morphStateRef.current.targetLeafGeometry = generateLeafGeometry(targetProps);
    morphStateRef.current.morphProgress = 0;
    morphStateRef.current.isTransitioning = true;
    showSporesRef.current = true;

    previousZoneType.current = zoneType;
  }, [zoneType]);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const morphState = morphStateRef.current;
    const delta = state.clock.getDelta();

    // Update morph progress
    if (morphState.isTransitioning) {
      morphState.morphProgress += delta * 2.0; // 0.5 second transition

      if (morphState.morphProgress >= 1.0) {
        morphState.morphProgress = 1.0;
        morphState.isTransitioning = false;
        showSporesRef.current = false;
      }
    }

    // Update uniforms
    if (materialRef.current.uniforms) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uMorphProgress.value = morphState.morphProgress;
    }

    // Continuous rotation to showcase leaf from different angles
    meshRef.current.rotation.y += 0.5 * delta;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={morphStateRef.current.currentLeafGeometry}
        material={leafMaterial}
        scale={1.5}
      />

      {/* Spore particles during morphing */}
      {showSporesRef.current && morphStateRef.current.morphProgress < 1.0 && (
        <SporeEffectMesh color={color} count={48} intensity={morphStateRef.current.morphProgress} />
      )}
    </group>
  );
};

export { AdaptiveLeafMesh };
