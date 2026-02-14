import * as THREE from 'three';
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface ProceduralFlowerProps {
  petals?: number;
  radius?: number;
  height?: number;
  baseColor?: THREE.Color;
  position?: [number, number, number];
  seed?: number;
  color?: string | THREE.Color;
}

const ProceduralFlower: React.FC<ProceduralFlowerProps> = ({
  petals = 8,
  radius = 0.28,
  height = 0.9,
  baseColor = new THREE.Color(0.9, 0.5, 0.2),
  position = [0, 0, 0],
  seed = 0,
  color,
}) => {
  const instRef = useRef<THREE.InstancedMesh>(null);

  // Resolve color: use color prop if provided, otherwise use baseColor
  const resolvedColor = useMemo(() => {
    if (color) {
      if (typeof color === 'string') {
        return new THREE.Color(color);
      }
      return color;
    }
    return baseColor;
  }, [color, baseColor]);

  // Colors for petals with seed-based variation
  const petalColors = useMemo(() => {
    const arr: THREE.Color[] = [];
    for (let i = 0; i < petals; i++) {
      const hue = (i / petals + seed * 0.1) % 1.0;
      const saturation = 0.4 + Math.sin(seed + i) * 0.2;
      const lightness = 0.5 + Math.cos(seed * 2 + i) * 0.15;
      const col = new THREE.Color().setHSL(hue, saturation, lightness);
      arr.push(col);
    }
    return arr;
  }, [petals, seed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Create petal geometry (oval leaf-like shape instead of cylinder)
  const geo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const petalWidth = 0.08;
    const petalHeight = height;
    const segments = 12;
    
    const positions: number[] = [];
    const indices: number[] = [];

    // Create oval petal shape
    for (let i = 0; i <= segments; i++) {
      const v = i / segments;
      const y = -petalHeight / 2 + v * petalHeight;
      
      // Oval width that tapers to a point at the tip
      const width = Math.sin(v * Math.PI) * petalWidth;
      
      // Left side
      positions.push(-width, y, 0);
      // Right side
      positions.push(width, y, 0);
      // Center (for smoothing)
      positions.push(0, y, 0.005);
    }

    // Create indices for triangle strip
    for (let i = 0; i < segments; i++) {
      const step = 3;
      const a = i * step;
      const b = (i + 1) * step;
      
      // Left triangle
      indices.push(a, b, a + 2);
      indices.push(b, b + 2, a + 2);
      
      // Right triangle
      indices.push(a + 1, a + 2, b + 1);
      indices.push(b + 1, a + 2, b + 2);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
    geometry.computeVertexNormals();
    
    return geometry;
  }, [height]);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    emissive: '#000000',
    metalness: 0.1,
    roughness: 0.6,
  }), []);

  useFrame((state) => {
    if (!instRef.current) return;
    // subtle animation
    const t = state.clock.elapsedTime;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2 + Math.sin(t * 0.6 + i) * 0.05;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -0.1 + Math.sin(t * 1.2 + i) * 0.02;

      dummy.position.set(x, y, z);
      // tilt outward
      dummy.rotation.set(Math.PI * 0.5, angle, angle + Math.PI * 0.2);
      const s = 0.6 + Math.sin(t * 1.2 + i * 0.7) * 0.08;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      instRef.current.setMatrixAt(i, dummy.matrix);
      // store color in instanceColor attribute (set below)
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={position}>
      <instancedMesh ref={instRef} args={[geo, mat, petals]}>
        {/* per-instance color attribute */}
        <instancedBufferAttribute attachObject={['attributes', 'instanceColor']} args={[
          new Float32Array(petalColors.flatMap(c => [c.r, c.g, c.b])),
          3,
        ]} />
      </instancedMesh>
    </group>
  );
};

export default ProceduralFlower;
