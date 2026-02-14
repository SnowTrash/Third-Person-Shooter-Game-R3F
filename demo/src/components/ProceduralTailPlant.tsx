import * as THREE from 'three';
import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

interface TailPlantProps {
  segments?: number;
  length?: number;
  color?: THREE.Color;
  position?: [number, number, number];
}

const TailPlant: React.FC<TailPlantProps> = ({ segments = 12, length = 1.6, color = new THREE.Color(0.2, 0.6, 0.25), position = [0, 0, 0] }) => {
  // Create leaf geometry (oval with pointed tip)
  const geom = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const leafWidth = 0.15;
    const leafHeight = 0.5;
    const vSegments = 12;
    
    const positions: number[] = [];
    const indices: number[] = [];

    // Create oval leaf shape
    for (let i = 0; i <= vSegments; i++) {
      const v = i / vSegments;
      const y = leafHeight / 2 - v * leafHeight;
      
      // Oval width that tapers to a point at the tip
      const widthFactor = Math.sin(v * Math.PI);
      const width = widthFactor * leafWidth;
      
      // Left side
      positions.push(-width, y, 0);
      // Right side
      positions.push(width, y, 0);
      // Center (for vein)
      positions.push(0, y, 0.003);
    }

    // Create indices
    for (let i = 0; i < vSegments; i++) {
      const step = 3;
      const a = i * step;
      const b = (i + 1) * step;
      
      // Left side
      indices.push(a, b, a + 2);
      indices.push(b, b + 2, a + 2);
      
      // Right side
      indices.push(a + 1, a + 2, b + 1);
      indices.push(b + 1, a + 2, b + 2);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
    emissive: '#000000',
    metalness: 0.05,
    roughness: 0.5,
  }), [color]);

  // build leaves along a spline
  const leaves = useMemo(() => {
    const arr: { pos: THREE.Vector3; rot: number; scale: number }[] = [];
    for (let i = 0; i < segments; i++) {
      const t = i / Math.max(1, segments - 1);
      const y = -0.4 + t * length;
      const sway = Math.sin(t * Math.PI) * 0.6;
      const x = Math.sin(t * Math.PI * 2.0) * 0.06;
      const rot = Math.PI * 0.5 + t * 0.8 + (i % 2 === 0 ? 0.6 : -0.6);
      const s = 0.6 + t * 0.9;
      arr.push({ pos: new THREE.Vector3(x, y, sway), rot, scale: s });
    }
    return arr;
  }, [segments, length]);

  useFrame((state) => {
    // subtle breathing animation on material
    const t = state.clock.elapsedTime;
    if (mat.opacity !== undefined) mat.opacity = 0.9 + Math.sin(t * 0.8) * 0.03;
  });

  return (
    <group position={position}>
      {leaves.map((l, idx) => (
        <mesh
          key={idx}
          geometry={geom}
          material={mat}
          position={[l.pos.x, l.pos.y, l.pos.z]}
          rotation={[Math.PI * 0.5, l.rot, 0]}
          scale={l.scale}
        />
      ))}
    </group>
  );
};

export default TailPlant;
