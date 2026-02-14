import * as THREE from 'three';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { SporeEffectMesh } from './SporeEffectMesh';

type ShapeKey = 'gaussian_invert' | 'blob' | 'spike' | 'torus' | 'smooth';

const shapeIndex = (k: ShapeKey) => {
  switch (k) {
    case 'gaussian_invert': return 0.0;
    case 'blob': return 1.0;
    case 'spike': return 2.0;
    case 'torus': return 3.0;
    default: return 4.0;
  }
};

export const MorphingOrganicMesh: React.FC<{
  shape: ShapeKey;
  color: THREE.Color;
  intensity?: number;
}> = ({ shape, color, intensity = 1.0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.RawShaderMaterial | null>(null);
  const prevShape = useRef<ShapeKey>(shape);
  const [morphProgress, setMorphProgress] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  const material = useMemo(() => {
    return new THREE.RawShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color.clone() },
        uIntensity: { value: intensity },
        uShape: { value: shapeIndex(shape) },
        uMorph: { value: 0 },
      },
      vertexShader: `
        precision highp float;
        attribute vec3 position;
        attribute vec3 normal;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
        uniform float uTime;
        uniform float uShape;
        uniform float uMorph;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Spherical mapping helper
        vec2 sphCoord(vec3 p) {
          float r = length(p);
          float theta = acos(p.y / max(0.0001, r));
          float phi = atan(p.z, p.x);
          return vec2(theta, phi);
        }

        // Gaussian inverted bump
        float gaussianInvert(vec3 p) {
          vec2 s = sphCoord(normalize(p));
          float d = exp(-pow((s.x - 1.57), 2.0) * 8.0) * 0.6;
          return -d;
        }

        // Blob noise-like displacement
        float blob(vec3 p) {
          float n = sin(p.x * 3.0 + uTime * 1.5) * sin(p.y * 2.5 + uTime) * sin(p.z * 2.2 - uTime * 0.8);
          return n * 0.25;
        }

        // Spikes using high-frequency radial wave
        float spike(vec3 p) {
          vec2 s = sphCoord(normalize(p));
          float freq = 30.0;
          float w = pow(abs(sin(s.y * freq + uTime * 6.0)), 8.0) * 0.35;
          return w;
        }

        // Torus-like pinch
        float torusize(vec3 p) {
          vec2 s = sphCoord(p);
          float r = length(p.xz);
          float t = sin(r * 6.0 + uTime * 1.2) * 0.18;
          return t * (1.0 - smoothstep(0.6, 1.4, abs(p.y)));
        }

        void main() {
          vec3 pos = position;
          vec3 n = normalize(normalMatrix * normal);

          // compute each shape displacement
          float dGauss = gaussianInvert(pos);
          float dBlob = blob(pos);
          float dSpike = spike(pos);
          float dTorus = torusize(pos);
          float dSmooth = 0.0;

          // map uShape to blend targets; we use uMorph to interpolate from previous to new
          float s = uShape;

          // Blend combination: we evaluate all and mix by softweights
          vec4 weights = vec4(0.0);
          // weights: [gauss, blob, spike, torus] determined by s
          weights = vec4(
            1.0 - smoothstep(-0.5, 0.5, s - 0.0),
            1.0 - abs(s - 1.0),
            1.0 - abs(s - 2.0),
            1.0 - abs(s - 3.0)
          );

          // normalize weights
          weights /= (weights.x + weights.y + weights.z + weights.w + 1e-6);

          float displacement = dGauss * weights.x + dBlob * weights.y + dSpike * weights.z + dTorus * weights.w + dSmooth * 0.0;

          // apply morph easing
          float eased = smoothstep(0.0, 1.0, uMorph);

          vec3 final = pos + n * displacement * eased;

          vNormal = normalize(normalMatrix * normal);
          vPosition = final;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(final, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uIntensity;
        uniform float uMorph;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main(){
          vec3 n = normalize(vNormal);
          vec3 light = normalize(vec3(0.6, 0.8, 0.2));
          float diff = max(dot(n, light), 0.15);

          // Fresnel for edge glow
          vec3 viewDir = normalize(-vPosition);
          float fres = pow(1.0 - max(dot(viewDir, n), 0.0), 3.0);

          // Dynamic glow tied to morph progress
          float glow = sin(uTime * 4.0) * 0.02 + uMorph * 0.25;

          vec3 base = uColor * (diff * (0.6 + uIntensity * 0.4));
          base += vec3(1.0, 0.9, 0.7) * fres * (0.6 * uMorph);
          base += vec3(0.25, 0.4, 0.6) * glow;

          // slight rim color variation
          base = mix(base, base * 1.1, fres * 0.5);

          gl_FragColor = vec4(base, 0.95);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [color, intensity, shape]);

  materialRef.current = material;

  // handle transitions when shape prop changes
  useEffect(() => {
    if (prevShape.current === shape) return;
    setShowParticles(true);
    setMorphProgress(0);
    prevShape.current = shape;

    const start = performance.now();
    const dur = 600; // ms
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setMorphProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setShowParticles(false), 300);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shape]);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uColor.value = color;
    materialRef.current.uniforms.uIntensity.value = intensity;
    materialRef.current.uniforms.uShape.value = shapeIndex(shape);
    materialRef.current.uniforms.uMorph.value = morphProgress;

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.35 * state.clock.getDelta();
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 5]} />
        <primitive object={material} attach="material" />
      </mesh>

      {showParticles && (
        <SporeEffectMesh color={color} count={56} intensity={Math.max(0.2, morphProgress)} />
      )}
    </group>
  );
};

export default MorphingOrganicMesh;
