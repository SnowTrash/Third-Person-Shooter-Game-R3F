import * as THREE from 'three';

export interface LeafProperties {
  width: number;        // 0 = narrow, 1 = broad
  length: number;       // leaf length multiplier
  pointiness: number;   // 0 = rounded, 1 = sharp points
  surface: number;      // 0 = smooth, 1 = textured/bumpy
  thickness: number;    // 3D thickness for 3D display
}

/**
 * Generates a botanical leaf geometry with customizable properties
 */
export function generateLeafGeometry(
  properties: Partial<LeafProperties> = {}
): THREE.BufferGeometry {
  const props: LeafProperties = {
    width: 0.5,
    length: 1.0,
    pointiness: 0.5,
    surface: 0.3,
    thickness: 0.1,
    ...properties,
  };

  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  // Create base leaf shape
  const width = props.width;
  const length = props.length;
  const segments = 32;
  const radiusSegments = 8;

  // Midrib (center vein)
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const y = t * length * 2 - length;

    // Width varies along length (narrower at tip)
    const tipNarrow = Math.pow(1 - Math.abs(t - 0.5) * 2, 1.5);
    const currentWidth = width * tipNarrow;

    // Pointed tip if pointiness is high
    const tipPoint = Math.pow(Math.abs(t - 0.5) * 2, props.pointiness + 1);

    for (let j = 0; j < radiusSegments; j++) {
      const angle = (j / radiusSegments) * Math.PI;
      const x = Math.sin(angle) * currentWidth * (1 - tipPoint * 0.7);
      const z = Math.cos(angle) * props.thickness * (1 - Math.abs(t - 0.5) * 0.5);

      vertices.push(x, y, z);
      uvs.push(t, j / (radiusSegments - 1));
    }
  }

  // Create faces
  for (let i = 0; i < segments - 1; i++) {
    for (let j = 0; j < radiusSegments - 1; j++) {
      const a = i * radiusSegments + j;
      const b = i * radiusSegments + j + 1;
      const c = (i + 1) * radiusSegments + j;
      const d = (i + 1) * radiusSegments + j + 1;

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // Calculate normals
  const positionAttribute = new THREE.BufferAttribute(
    new Float32Array(vertices),
    3
  );
  geometry.setAttribute('position', positionAttribute);
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Maps environmental conditions to leaf properties
 */
export function getLeafPropertiesFromZone(zoneType: string): LeafProperties {
  const conditions: Record<string, LeafProperties> = {
    // High humidity = broad leaves for water regulation
    'speed_boost': {
      width: 0.8,
      length: 1.2,
      pointiness: 0.2,
      surface: 0.5,
      thickness: 0.12,
    },
    // High altitude = narrow, thin leaves to reduce water loss
    'jump_boost': {
      width: 0.3,
      length: 1.5,
      pointiness: 0.8,
      surface: 0.8,
      thickness: 0.18,
    },
    // Ice/cold = compact, protective leaves
    'ice': {
      width: 0.4,
      length: 0.8,
      pointiness: 0.6,
      surface: 0.9,
      thickness: 0.15,
    },
    // Low humidity/drought = thick, waxy succulents
    'slow': {
      width: 0.6,
      length: 0.9,
      pointiness: 0.3,
      surface: 0.2,
      thickness: 0.2,
    },
    // Toxic/pressure damage = severely restricted growth
    'damage': {
      width: 0.2,
      length: 0.6,
      pointiness: 0.9,
      surface: 1.0,
      thickness: 0.08,
    },
  };

  return conditions[zoneType] || {
    width: 0.5,
    length: 1.0,
    pointiness: 0.5,
    surface: 0.3,
    thickness: 0.1,
  };
}

/**
 * Interpolates between two leaf properties
 */
export function morphLeafProperties(
  fromProps: LeafProperties,
  toProps: LeafProperties,
  progress: number
): LeafProperties {
  const eased = THREE.MathUtils.smoothstep(progress, 0, 1);

  return {
    width: THREE.MathUtils.lerp(fromProps.width, toProps.width, eased),
    length: THREE.MathUtils.lerp(fromProps.length, toProps.length, eased),
    pointiness: THREE.MathUtils.lerp(
      fromProps.pointiness,
      toProps.pointiness,
      eased
    ),
    surface: THREE.MathUtils.lerp(fromProps.surface, toProps.surface, eased),
    thickness: THREE.MathUtils.lerp(
      fromProps.thickness,
      toProps.thickness,
      eased
    ),
  };
}
