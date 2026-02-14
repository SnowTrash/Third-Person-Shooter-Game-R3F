import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  lifetime: number;
  maxLifetime: number;
  color: THREE.Color;
}

const ParticleEffectMesh = ({
  color,
  count = 32,
}: {
  color: THREE.Color;
  count?: number;
}) => {
  const particlesRef = useRef<Particle[]>([]);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize particles when component mounts or color changes
  useEffect(() => {
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1 + Math.random() * 0.5;

      particles.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 2,
          Math.sin(angle) * radius
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 2,
          (Math.random() - 0.5) * 3
        ),
        size: Math.random() * 0.3 + 0.1,
        lifetime: 0,
        maxLifetime: Math.random() * 0.5 + 0.3,
        color: new THREE.Color(color),
      });
    }

    particlesRef.current = particles;

    // Update geometry
    if (geometryRef.current) {
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      particles.forEach((p, i) => {
        positions[i * 3] = p.position.x;
        positions[i * 3 + 1] = p.position.y;
        positions[i * 3 + 2] = p.position.z;
        sizes[i] = p.size;
      });

      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      geometryRef.current.setAttribute(
        'size',
        new THREE.BufferAttribute(sizes, 1)
      );
    }
  }, [color, count]);

  useFrame((state) => {
    if (!pointsRef.current || !geometryRef.current) return;

    const particles = particlesRef.current;
    const delta = state.clock.getDelta();
    const posAttr = geometryRef.current.getAttribute('position');
    const sizeAttr = geometryRef.current.getAttribute('size');

    const positions = posAttr ? (posAttr as THREE.BufferAttribute).array as Float32Array : new Float32Array();
    const sizes = sizeAttr ? (sizeAttr as THREE.BufferAttribute).array as Float32Array : new Float32Array();

    particles.forEach((p, i) => {
      p.lifetime += delta;

      if (p.lifetime < p.maxLifetime) {
        // Update physics
        p.velocity.y -= 9.81 * delta * 0.1;
        p.position.addScaledVector(p.velocity, delta);

        // Update geometry
        positions[i * 3] = p.position.x;
        positions[i * 3 + 1] = p.position.y;
        positions[i * 3 + 2] = p.position.z;

        // Fade out
        const alpha = 1 - p.lifetime / p.maxLifetime;
        sizes[i] = p.size * alpha;
      }
    });

    if (posAttr) (posAttr as THREE.BufferAttribute).needsUpdate = true;
    if (sizeAttr) (sizeAttr as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="position" count={count} array={new Float32Array(count * 3)} itemSize={3} />
        <bufferAttribute attach="size" count={count} array={new Float32Array(count)} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

export { ParticleEffectMesh };
