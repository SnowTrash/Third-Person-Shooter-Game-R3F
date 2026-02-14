import * as THREE from 'three';

/**
 * Geometry Morphing System
 * Handles smooth transitions between different 3D shape geometries
 */

export interface MorphGeometry {
  geometry: THREE.BufferGeometry;
  name: string;
}

export class GeometryMorphSystem {
  private geometries: Map<string, THREE.BufferGeometry> = new Map();

  constructor() {
    this.initializeGeometries();
  }

  private initializeGeometries() {
    // Create all possible zone shape geometries
    this.geometries.set('sphere', new THREE.IcosahedronGeometry(1, 6));
    this.geometries.set('cube', new THREE.BoxGeometry(1.5, 1.5, 1.5));
    this.geometries.set('torus', new THREE.TorusGeometry(0.7, 0.3, 16, 100));
    this.geometries.set('octahedron', new THREE.OctahedronGeometry(1, 3));
    this.geometries.set('icosahedron', new THREE.IcosahedronGeometry(1, 5));
    this.geometries.set('dodecahedron', new THREE.DodecahedronGeometry(0.8, 0));
    this.geometries.set('tetrahedron', new THREE.TetrahedronGeometry(1, 0));
  }

  getGeometry(type: string): THREE.BufferGeometry {
    return this.geometries.get(type) || this.geometries.get('sphere')!;
  }
}

export const geometryMorphSystem = new GeometryMorphSystem();
