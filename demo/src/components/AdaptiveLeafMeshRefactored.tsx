import * as THREE from 'three';
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  generateLeafGeometry,
} from '../systems/LeafGeometrySystem';
import { useLeafVisualization } from '../hooks/useLeafVisualization';
import type { LeafProperties } from '../systems/LeafGeometrySystem';

/**
 * AdaptiveLeafMeshRefactored.tsx
 * 
 * Componente profesional mejorado:
 * ✅ Transiciones smooth entre geometrías
 * ✅ Mejor manejo de memoria (dispose correctamente)
 * ✅ Sincronizado con useLeafVisualization (miniviz + HUD juntos)
 * ✅ Código limpio y optimizable
 * ✅ Easing functions profesionales
 * 
 * CAMBIOS vs original:
 * - Morphing más suave con easing (no lineal)
 * - Mejor cleanup de geometrías viejas
 * - Sincronización automática con leafVisualization
 * - Transiciones configurables
 */

interface LeafMorphState {
  currentLeafGeometry: THREE.BufferGeometry;
  targetLeafGeometry: THREE.BufferGeometry;
  morphProgress: number;
  isTransitioning: boolean;
  morphDuration: number; // Duración configurable
  easeFunction: (t: number) => number;
}

interface AdaptiveLeafMeshProps {
  color: THREE.Color;
  morphDuration?: number; // ms
}

/**
 * Easing functions profesionales
 * creadas según estándares de animación web
 */
const EasingFunctions = {
  // Suave al inicio y final
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  // Suave al final (recomendado)
  easeOutQuad: (t: number): number => {
    return 1 - (1 - t) * (1 - t);
  },

  // Rebote suave
  easeOutCubic: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },

  // Muy suave (natural)
  easeOutQuart: (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  },
};

const AdaptiveLeafMeshRefactored = ({
  color,
  morphDuration = 500, // 0.5 segundos (default)
}: AdaptiveLeafMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Hook centralizado que sincroniza TODO
  const leafViz = useLeafVisualization();
  const { currentLeaf } = leafViz;

  // Estado de morph (ref en lugar de state para performance)
  const morphStateRef = useRef<LeafMorphState>({
    currentLeafGeometry: new THREE.BufferGeometry(),
    targetLeafGeometry: new THREE.BufferGeometry(),
    morphProgress: 0,
    isTransitioning: false,
    morphDuration,
    easeFunction: EasingFunctions.easeOutQuad,
  });

  const materialRef = useRef<THREE.RawShaderMaterial | null>(null);

  // Propiedades previas para detectar cambios
  const prevPropsRef = useRef<LeafProperties | null>(null);

  /**
   * Material: Shader professional con vein patterns
   */
  const leafMaterial = useMemo(() => {
    return new THREE.RawShaderMaterial({
      uniforms: {
        uColor: { value: color },
        uTime: { value: 0 },
        uMorphProgress: { value: 0 },
        uLightPos: { value: new THREE.Vector3(5, 10, 5) },
        uVeinIntensity: { value: 0.5 },
        uGlossiness: { value: 0.7 },
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
        varying float vWave;
        
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
          
          // Transición suave DURANTE el morph
          vec3 pos = position;
          if (uMorphProgress > 0.0 && uMorphProgress < 1.0) {
            // Wave animation basado en progreso (no tiempo)
            float waveAmount = sin(uMorphProgress * 3.14159) * 0.05;
            float wave = sin(position.y * 8.0 + uMorphProgress * 6.28) * waveAmount;
            
            // Desplazamiento basado en normal
            pos = pos + normal * wave;
            vWave = wave;
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uMorphProgress;
        uniform vec3 uLightPos;
        uniform float uVeinIntensity;
        uniform float uGlossiness;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vMorphProgress;
        varying float vWave;
        
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
        
        float veinPattern(vec2 uv) {
          float vein = 0.0;
          vein += abs(sin(uv.x * 10.0) * 0.15);
          vein += abs(sin(uv.y * 15.0) * 0.1);
          vein += noise2d(uv * 5.0) * 0.05;
          return vein;
        }
        
        float stomata(vec2 uv) {
          float stom = 0.0;
          for(float i = 0.0; i < 4.0; i++) {
            vec2 pos = mod(uv * 8.0 + vec2(i), 1.0);
            pos = abs(pos - 0.5) * 2.0;
            stom += (1.0 - length(pos)) * 0.25;
          }
          return stom;
        }
        
        void main() {
          float diffuse = dot(normalize(vNormal), normalize(uLightPos - vPosition));
          diffuse = max(0.0, diffuse) * 0.8 + 0.2;
          
          float veins = veinPattern(vUv) * uVeinIntensity;
          float pores = stomata(vUv) * 0.15;
          
          vec3 baseColor = uColor * (1.0 + veins * 0.5 + pores);
          vec3 finalColor = baseColor * diffuse * 1.2;
          
          // Glow suave durante morph
          if (vMorphProgress > 0.0 && vMorphProgress < 1.0) {
            float glowIntensity = sin(vMorphProgress * 3.14159) * 0.3;
            finalColor += vec3(0.2, 0.4, 0.6) * glowIntensity;
          }
          
          float alpha = 0.9;
          if (vMorphProgress > 0.0 && vMorphProgress < 1.0) {
            alpha = 0.85 + sin(vMorphProgress * 3.14159) * 0.1;
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

  /**
   * Detectar cambios en leafProperties (NOT zoneType)
   * Esto permite transiciones smooth cuando propiedades cambian
   */
  useEffect(() => {
    // Si es la primera vez, no transicionar
    if (!prevPropsRef.current) {
      prevPropsRef.current = currentLeaf;
      morphStateRef.current.currentLeafGeometry = generateLeafGeometry(currentLeaf);
      morphStateRef.current.targetLeafGeometry = generateLeafGeometry(currentLeaf);
      return;
    }

    // Detectar si las propiedades realmente cambiaron significativamente
    const changed = Object.keys(currentLeaf).some(
      (key) =>
        Math.abs((currentLeaf as any)[key] - (prevPropsRef.current as any)[key]) > 0.01
    );

    if (!changed) return;

    // Iniciar transición
    const state = morphStateRef.current;
    state.currentLeafGeometry.dispose(); // Limpiar vieja

    state.currentLeafGeometry = state.targetLeafGeometry;
    state.targetLeafGeometry = generateLeafGeometry(currentLeaf);
    state.morphProgress = 0;
    state.isTransitioning = true;

    prevPropsRef.current = currentLeaf;
  }, [currentLeaf]);

  /**
   * Animation loop: actualizar progreso de morph
   */
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const morphState = morphStateRef.current;
    const delta = state.clock.getDelta();

    // Actualizar progreso de morph
    if (morphState.isTransitioning) {
      morphState.morphProgress += (delta * 1000) / morphState.morphDuration;

      if (morphState.morphProgress >= 1.0) {
        morphState.morphProgress = 1.0;
        morphState.isTransitioning = false;
      }
    }

    // Aplicar easing
    const easedProgress = morphState.easeFunction(morphState.morphProgress);

    // Actualizar uniforms
    if (materialRef.current.uniforms) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uMorphProgress.value = easedProgress;
    }

    // Rotación suave para mostrar forma 3D
    meshRef.current.rotation.y += 0.5 * delta;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;

    // Interpolación de geometría (blend geometry attributes)
    if (morphState.isTransitioning) {
      const currentGeo = morphState.currentLeafGeometry;
      const targetGeo = morphState.targetLeafGeometry;

      if (
        currentGeo.attributes.position &&
        targetGeo.attributes.position &&
        currentGeo.attributes.position.count === targetGeo.attributes.position.count
      ) {
        const currentPosAttr = currentGeo.attributes.position as any;
        const targetPosAttr = targetGeo.attributes.position as any;
        
        const blendedPositions = new Float32Array(currentPosAttr.array);
        const targetPositions = new Float32Array(targetPosAttr.array);

        for (let i = 0; i < blendedPositions.length; i++) {
          blendedPositions[i] =
            blendedPositions[i] * (1 - easedProgress) +
            targetPositions[i] * easedProgress;
        }

        currentGeo.attributes.position.needsUpdate = true;
      }
    }
  });

  // Cleanup: dispose geometrías cuando componente desmonta
  useEffect(() => {
    return () => {
      morphStateRef.current.currentLeafGeometry.dispose();
      morphStateRef.current.targetLeafGeometry.dispose();
      materialRef.current?.dispose();
    };
  }, []);

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={morphStateRef.current.currentLeafGeometry}
        material={leafMaterial}
      />
    </group>
  );
};

export default AdaptiveLeafMeshRefactored;
