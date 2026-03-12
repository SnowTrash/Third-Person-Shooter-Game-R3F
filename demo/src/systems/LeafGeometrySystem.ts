import * as THREE from 'three';
import { PerformanceManager } from './PerformanceConfig';

export interface LeafProperties {
  // Basic morphology (original)
  width: number;        // 0 = narrow, 1 = broad (clamped 0-1)
  length: number;       // 0.5-1.5 = leaf length (clamped)
  pointiness: number;   // 0 = rounded, 1 = sharp (clamped 0-1)
  surface: number;      // 0 = smooth, 1 = bumpy (clamped 0-1)
  thickness: number;    // 0 = thin, 1 = thick (clamped 0-1)
  
  // Botanical characteristics (CLAMP scoring system)
  lobed: number;           // 0-1: no lobes to heavily lobed
  teeth: number;           // 0-1: untoothed to heavily toothed
  teethRegularity: number; // 0-1: irregular to perfectly regular
  teethCloseness: number;  // 0-1: distant to very close teeth
  teethRounded: number;    // 0-1: acute to rounded teeth
  teethAcute: number;      // 0-1: rounded to very acute teeth
  teethCompound: number;   // 0-1: no compound to all compound
  apexEmarginate: number;  // 0-1: solid apex to deeply notched
}

// Importar cache solo si está disponible (evitar circular dependency)
let geometryCache: any = null;
try {
  import('./GeometryCache').then(mod => {
    geometryCache = mod.geometryCache;
  });
} catch (e) {
  // Ignorar si no existe
}

// CLAMP helper function
const clamp = (value: number, min: number = 0, max: number = 1): number => {
  return Math.max(min, Math.min(max, value));
};

// Clamp all leaf properties to valid ranges
export function clampLeafProperties(props: Partial<LeafProperties>): LeafProperties {
  const p = props as any;
  return {
    width: clamp(p.width ?? 0.5, 0, 1),
    length: clamp(p.length ?? 1.0, 0.5, 1.5),
    pointiness: clamp(p.pointiness ?? 0.5, 0, 1),
    surface: clamp(p.surface ?? 0.3, 0, 1),
    thickness: clamp(p.thickness ?? 0.1, 0, 1),
    lobed: clamp(p.lobed ?? 0, 0, 1),
    teeth: clamp(p.teeth ?? 0, 0, 1),
    teethRegularity: clamp(p.teethRegularity ?? 0, 0, 1),
    teethCloseness: clamp(p.teethCloseness ?? 0, 0, 1),
    teethRounded: clamp(p.teethRounded ?? 0.5, 0, 1),
    teethAcute: clamp(p.teethAcute ?? 0.5, 0, 1),
    teethCompound: clamp(p.teethCompound ?? 0, 0, 1),
    apexEmarginate: clamp(p.apexEmarginate ?? 0, 0, 1),
  };
}

/**
 * Generates a sophisticated 2D botanical leaf geometry
 * Includes lobes, teeth, apex features based on CLAMP scoring
 * 
 * OPTIMIZACIÓN: Usa cache automáticamente si está disponible
 */
export function generateLeafGeometry(
  properties: Partial<LeafProperties> = {}
): THREE.BufferGeometry {
  const rawProps: Partial<LeafProperties> = {
    width: 0.5,
    length: 1.0,
    pointiness: 0.5,
    surface: 0.3,
    thickness: 0.1,
    lobed: 0,
    teeth: 0,
    teethRegularity: 0,
    teethCloseness: 0,
    teethRounded: 0.5,
    teethAcute: 0.5,
    teethCompound: 0,
    apexEmarginate: 0,
    ...properties,
  };

  // Clamp all values to valid ranges
  const props = clampLeafProperties(rawProps);

  // Usar cache si está disponible (evita regenerar geometría continuamente)
  if (geometryCache) {
    return geometryCache.get(props, (p: LeafProperties) => _createLeafGeometry(p));
  }

  return _createLeafGeometry(props);
}

/**
 * Implementación interna de generación de geometría
 * Separada para permitir caching
 */
function _createLeafGeometry(props: LeafProperties): THREE.BufferGeometry {
  const config = PerformanceManager.getConfig();
  const segments = config.leafSegments;  // Adaptar según performance
  
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  // Create leaf outline with lobes and teeth
  for (let i = 0; i < segments; i++) {
    const v = i / (segments - 1);  // 0 to 1 from base to tip
    const y = -props.length / 2 + v * props.length;

    // Base tapering
    const baseTaper = Math.pow(Math.sin(v * Math.PI), 1 + props.pointiness);
    let leafWidth = props.width * baseTaper * 0.3;

    // Add lobes - wavy edges
    if (props.lobed > 0) {
      const lobeFrequency = 3 + props.lobed * 4;  // More lobes with higher lobed value
      const lobeAmplitude = leafWidth * props.lobed * 0.3;
      const lobeWave = Math.sin(v * Math.PI * lobeFrequency) * lobeAmplitude * baseTaper;
      leafWidth += lobeWave;
    }

    // Add teeth to edges
    if (props.teeth > 0) {
      const teethFrequency = 8 + props.teeth * 12;  // More teeth with higher value
      const teethPhase = (i % (Math.ceil(segments / teethFrequency))) / Math.ceil(segments / teethFrequency);
      
      // Teeth shape depends on roundedness vs acuteness
      const teethShape = props.teethRounded < 0.5 ? 
        Math.pow(teethPhase, 2) :  // Acute (pointed)
        Math.sqrt(teethPhase);       // Rounded

      const isToothPeak = teethShape > 0.7;
      if (isToothPeak && props.teeth > Math.random()) {
        const toothAmount = leafWidth * props.teeth * 0.2;
        leafWidth += toothAmount * (1 - Math.abs(teethPhase - 0.5) * 2);
      }
    }

    // Apex configuration
    let apexModifier = 1.0;
    if (v > 0.9) {
      // Emarginate apex (notched tip)
      if (props.apexEmarginate > 0) {
        const notchDepth = Math.pow(v - 0.9, 2) / 0.01 * props.apexEmarginate;
        apexModifier = 1.0 - notchDepth * 0.3;
      }
    }

    leafWidth *= apexModifier;

    // Left side with detail
    positions.push(-leafWidth, y, 0);
    uvs.push(0, v);

    // Center/vein
    positions.push(0, y, props.thickness * 0.05);
    uvs.push(0.5, v);

    // Right side with detail
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
 * Maps environmental conditions to leaf properties with CLAMP botanical scoring
 * All values are automatically clamped to valid ranges
 */
export function getLeafPropertiesFromZone(zoneType: string): LeafProperties {
  const conditions: Record<string, Partial<LeafProperties>> = {
    // High humidity = broad, lobed, untoothed leaves
    'speed_boost': {
      width: 0.8,
      length: 1.2,
      pointiness: 0.2,
      surface: 0.5,
      thickness: 0.12,
      lobed: 0.6,           // Moderately lobed
      teeth: 0,             // No teeth (untoothed)
      teethRegularity: 0,
      teethCloseness: 0,
      teethRounded: 0,
      teethAcute: 0,
      teethCompound: 0,
      apexEmarginate: 0.1,  // Slightly notched
    },
    // High altitude = narrow, very toothed, acute teeth
    'jump_boost': {
      width: 0.3,
      length: 1.5,
      pointiness: 0.8,
      surface: 0.8,
      thickness: 0.18,
      lobed: 0.2,           // Slightly lobed (jagged)
      teeth: 0.9,           // Heavily toothed
      teethRegularity: 0.7, // Fairly regular
      teethCloseness: 0.8,  // Close teeth
      teethRounded: 0.1,    // Very acute
      teethAcute: 0.9,
      teethCompound: 0.3,   // Some compound
      apexEmarginate: 0.3,  // Notched apex
    },
    // Ice/cold = compact, waxy, no lobes
    'ice': {
      width: 0.4,
      length: 0.8,
      pointiness: 0.6,
      surface: 0.9,
      thickness: 0.15,
      lobed: 0,             // No lobes (simple)
      teeth: 0.2,           // Minimal teeth
      teethRegularity: 0.5,
      teethCloseness: 0.3,
      teethRounded: 0.7,    // Rounded teeth
      teethAcute: 0.2,
      teethCompound: 0,
      apexEmarginate: 0,    // Sharp apex
    },
    // Low humidity/drought = thick, slightly lobed
    'slow': {
      width: 0.6,
      length: 0.9,
      pointiness: 0.3,
      surface: 0.2,
      thickness: 0.2,
      lobed: 0.3,           // Slightly lobed
      teeth: 0,             // No teeth
      teethRegularity: 0,
      teethCloseness: 0,
      teethRounded: 0,
      teethAcute: 0,
      teethCompound: 0,
      apexEmarginate: 0.05,
    },
    // Toxic/pressure damage = severely stunted, irregular, notched
    'damage': {
      width: 0.2,
      length: 0.6,
      pointiness: 0.9,
      surface: 1.0,
      thickness: 0.08,
      lobed: 0.7,           // Heavily lobed (deformed)
      teeth: 0.6,           // Some irregular teeth
      teethRegularity: 0.1, // Very irregular
      teethCloseness: 0.4,  // Variable distance
      teethRounded: 0.3,
      teethAcute: 0.7,      // Mostly acute
      teethCompound: 0.5,   // Some compound (malformed)
      apexEmarginate: 0.8,  // Deeply notched (damaged)
    },
  };

  const baseProps = conditions[zoneType] || {
    width: 0.5,
    length: 1.0,
    pointiness: 0.5,
    surface: 0.3,
    thickness: 0.1,
    lobed: 0,
    teeth: 0,
    teethRegularity: 0,
    teethCloseness: 0,
    teethRounded: 0.5,
    teethAcute: 0.5,
    teethCompound: 0,
    apexEmarginate: 0,
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
    pointiness: THREE.MathUtils.lerp(fromProps.pointiness, toProps.pointiness, eased),
    surface: THREE.MathUtils.lerp(fromProps.surface, toProps.surface, eased),
    thickness: THREE.MathUtils.lerp(fromProps.thickness, toProps.thickness, eased),
    lobed: THREE.MathUtils.lerp(fromProps.lobed, toProps.lobed, eased),
    teeth: THREE.MathUtils.lerp(fromProps.teeth, toProps.teeth, eased),
    teethRegularity: THREE.MathUtils.lerp(fromProps.teethRegularity, toProps.teethRegularity, eased),
    teethCloseness: THREE.MathUtils.lerp(fromProps.teethCloseness, toProps.teethCloseness, eased),
    teethRounded: THREE.MathUtils.lerp(fromProps.teethRounded, toProps.teethRounded, eased),
    teethAcute: THREE.MathUtils.lerp(fromProps.teethAcute, toProps.teethAcute, eased),
    teethCompound: THREE.MathUtils.lerp(fromProps.teethCompound, toProps.teethCompound, eased),
    apexEmarginate: THREE.MathUtils.lerp(fromProps.apexEmarginate, toProps.apexEmarginate, eased),
  };

  // Always clamp morphed result
  return clampLeafProperties(morphed);
}
