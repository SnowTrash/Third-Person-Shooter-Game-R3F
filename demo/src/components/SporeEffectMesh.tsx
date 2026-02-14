import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

interface Spore {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

/**
 * Biological spore/pollen particle effect for leaf morphing
 */
const SporeEffectMesh = ({
  color,
  count = 64,
  intensity = 1.0,
}: {
  color: THREE.Color;
  count?: number;
  intensity?: number;
}) => {
  const sporesRef = useRef<Spore[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  // Initialize spores on mount
  useEffect(() => {
    const spores: Spore[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.5;
      const height = (Math.random() - 0.5) * 1.5;

      spores.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 1.5 - 0.75,
          (Math.random() - 0.5) * 2
        ),
        lifetime: 0,
        maxLifetime: Math.random() * 0.8 + 0.4,
        size: Math.random() * 0.08 + 0.04,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 4,
      });
    }

    sporesRef.current = spores;
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const spores = sporesRef.current;
    const delta = state.clock.getDelta();

    // Update spore physics and visibility
    spores.forEach((spore) => {
      spore.lifetime += delta;

      if (spore.lifetime < spore.maxLifetime) {
        // Physics
        spore.velocity.y -= 0.5 * delta; // gravity
        spore.position.addScaledVector(spore.velocity, delta);
        spore.rotation += spore.rotationSpeed * delta;
      }
    });

    // Rotate group for visual effect
    groupRef.current.rotation.y += 0.3 * delta;
    groupRef.current.rotation.z += 0.15 * delta;
  });

  return (
    <group ref={groupRef}>
      {[...Array(Math.ceil(count / 16))].map((_, setIdx) => {
        const startIdx = setIdx * 16;
        const endIdx = Math.min(startIdx + 16, count);
        const sporesInSet = sporesRef.current.slice(startIdx, endIdx);

        return (
          <points key={`spore-set-${setIdx}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="position"
                count={sporesInSet.length}
                array={
                  new Float32Array(
                    sporesInSet.flatMap((s) => [s.position.x, s.position.y, s.position.z])
                  )
                }
                itemSize={3}
              />
              <bufferAttribute
                attach="size"
                count={sporesInSet.length}
                array={new Float32Array(sporesInSet.map((s) => s.size))}
                itemSize={1}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.05}
              color={color}
              transparent
              opacity={0.6 * intensity}
              sizeAttenuation
              fog={false}
            />
          </points>
        );
      })}
    </group>
  );
};

export { SporeEffectMesh };
