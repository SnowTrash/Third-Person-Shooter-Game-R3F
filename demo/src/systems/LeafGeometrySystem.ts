import * as THREE from 'three';

export interface LeafProperties {
  width: number;        // 0 = narrow, 1 = broad (clamped)
  length: number;       // 0.5-1.5 = leaf length (clamped)
  pointiness: number;   // 0 = rounded, 1 = sharp (clamped)
  surface: number;      // 0 = smooth, 1 = bumpy (clamped)
  thickness: number;    // 0 = thin, 1 = thick (clamped)
}

// CLAMP helper function
const clamp = (value: number, min: number = 0, max: number = 1): number => {
  return Math.max(min, Math.min(max, value));
};

// Clamp all leaf properties to valid ranges
export function clampLeafProperties(props: LeafProperties): LeafProperties {
  return {
    width: clamp(props.width, 0, 1),
    length: clamp(props.length, 0.5, 1.5),
    pointiness: clamp(props.pointiness, 0, 1),
    surface: clamp(props.surface, 0, 1),
    thickness: clamp(props.thickness, 0, 1),
  };
}

/**
 * Generates a simple 2D botanical leaf geometry
 * Creates a smooth oval leaf shape that morphs based on properties
 */
export function generateLeafGeometry(
  properties: Partial<LeafProperties> = {}
): THREE.BufferGeometry {
  const rawProps: LeafProperties = {
    width: 0.5,
    length: 1.0,
    pointiness: 0.5,
    surface: 0.3,
    thickness: 0.1,
    ...properties,
  };

  // Clamp all values to valid ranges
  const props = clampLeafProperties(rawProps);

  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const segments = 32;  // Smoothness of leaf outline

  // Create leaf shape: oval that tapers to pointed tip
  for (let i = 0; i < segments; i++) {
    const v = i / (segments - 1);  // 0 to 1 from base to tip
    const y = -props.length / 2 + v * props.length;  // Vertical position

    // Oval width that tapers with pointiness
    const tapering = Math.pow(Math.sin(v * Math.PI), 1 + props.pointiness);
    const leafWidth = props.width * tapering * 0.3;

    // Left side
    positions.push(-leafWidth, y, 0);
    uvs.push(0, v);

    // Center/vein
    positions.push(0, y, props.thickness * 0.05);
    uvs.push(0.5, v);

    // Right side
    positions.push(leafWidth, y, 0);
    uvs.push(1, v);
  }

  // Create faces
  for (let i = 0; i < segments - 1; i++) {
    const step = 3;
    const a = i * step;
    const b = (i + 1) * step;

    // Left side triangles
    indices.push(a, b, a + 1);
    indices.push(b, b + 1, a + 1);

    // Right side triangles
    indices.push(a + 1, b + 1, a + 2);
    indices.push(b + 1, b + 2, a + 2);
  }

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setIndex(
    new THREE.BufferAttribute(new Uint32Array(indices), 1)
  );
  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array(uvs), 2)
  );
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Maps environmental conditions to leaf properties
 * All values are automatically clamped to valid ranges
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

  const baseProps = conditions[zoneType] || {
    width: 0.5,
    length: 1.0,
    pointiness: 0.5,
    surface: 0.3,
    thickness: 0.1,
  };

  // Always clamp to ensure valid ranges
  return clampLeafProperties(baseProps);
}

/**
 * Interpolates between two leaf properties with CLAMP
 */
export function morphLeafProperties(
  fromProps: LeafProperties,
  toProps: LeafProperties,
  progress: number
): LeafProperties {
  const eased = THREE.MathUtils.smoothstep(progress, 0, 1);

  const morphed = {
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

  // Always clamp morphed result
  return clampLeafProperties(morphed);
}
