/**
 * PerformanceConfig.ts
 * 
 * Configuración centralizada para optimizar rendimiento.
 * Ajusta aquí según tu hardware:
 * - LOW: Laptops viejos, móviles
 * - MEDIUM: Laptops modernos
 * - HIGH: Desktops potentes
 */

export type PerformanceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface PerformanceSettings {
  // Geometría
  leafSegments: number;        // Detalles de hoja (64→32→16)
  flowerPetals: number;        // Pétalos de flores
  flowerSegments: number;      // Detalles de pétalos
  
  // Rendering
  maxPlantsPerZone: number;    // Plantas renderizadas por zona
  plantRenderDistance: number; // Distancia a la que se ven plantas
  
  // LOD (Level of Detail)
  useLOD: boolean;            // Activar sistema de LOD
  lodDistance1: number;       // Distancia para LOD nivel 1
  lodDistance2: number;       // Distancia para LOD nivel 2
  
  // Cache
  geometryCacheSize: number;  // Cuántas geometrías cachear
  enableGeometryCache: boolean;
  
  // Shaders
  veinIntensity: number;      // Detalle de venas en hoja
  enableSpores: boolean;      // Partículas de esporas
  sporeCount: number;         // Cantidad de esporas
  
  // Animation
  morphDuration: number;      // Duración de morph (segundos)
  enableWaveAnimation: boolean; // Animación ondulatoria
}

const CONFIG: Record<PerformanceLevel, PerformanceSettings> = {
  LOW: {
    leafSegments: 16,
    flowerPetals: 4,
    flowerSegments: 8,
    maxPlantsPerZone: 2,
    plantRenderDistance: 15,
    useLOD: true,
    lodDistance1: 10,
    lodDistance2: 20,
    geometryCacheSize: 16,
    enableGeometryCache: true,
    veinIntensity: 0.2,
    enableSpores: false,
    sporeCount: 4,
    morphDuration: 1.0,
    enableWaveAnimation: false,
  },
  MEDIUM: {
    leafSegments: 32,
    flowerPetals: 6,
    flowerSegments: 12,
    maxPlantsPerZone: 5,
    plantRenderDistance: 30,
    useLOD: true,
    lodDistance1: 15,
    lodDistance2: 30,
    geometryCacheSize: 32,
    enableGeometryCache: true,
    veinIntensity: 0.5,
    enableSpores: true,
    sporeCount: 8,
    morphDuration: 0.5,
    enableWaveAnimation: true,
  },
  HIGH: {
    leafSegments: 64,
    flowerPetals: 8,
    flowerSegments: 16,
    maxPlantsPerZone: 5,
    plantRenderDistance: 50,
    useLOD: false,
    lodDistance1: 20,
    lodDistance2: 40,
    geometryCacheSize: 64,
    enableGeometryCache: true,
    veinIntensity: 0.8,
    enableSpores: true,
    sporeCount: 16,
    morphDuration: 0.5,
    enableWaveAnimation: true,
  },
};

/**
 * Sistema de detección automática de rendimiento
 * Detecta capacidad del navegador
 */
function detectPerformanceLevel(): PerformanceLevel {
  // Verificar si está en localhost/dev (asumir desarrollo = HIGH)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'HIGH';
  }

  // Check GPU capabilities
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return 'LOW';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'MEDIUM';

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    // Heurística simple: palabras clave indican hardware
    const isLowEnd = /Intel|Iris|UHD|iGPU|Mobile|AMD APU/i.test(renderer);
    const isHighEnd = /RTX|GTX|A\d+|Radeon RX|Arc/i.test(renderer);

    if (isHighEnd) return 'HIGH';
    if (isLowEnd) return 'LOW';
  }

  return 'MEDIUM';
}

// Exportar singleton de configuración
let currentLevel: PerformanceLevel = 'MEDIUM';

export const PerformanceManager = {
  /**
   * Obtener configuración actual
   */
  getConfig(): PerformanceSettings {
    return CONFIG[currentLevel];
  },

  /**
   * Cambiar nivel de rendimiento
   */
  setLevel(level: PerformanceLevel): void {
    currentLevel = level;
    console.log(`[Performance] Cambió a nivel: ${level}`);
  },

  /**
   * Obtener nivel actual
   */
  getLevel(): PerformanceLevel {
    return currentLevel;
  },

  /**
   * Detectar automáticamente
   */
  autoDetect(): void {
    currentLevel = detectPerformanceLevel();
    console.log(`[Performance] Auto-detected: ${currentLevel}`);
  },

  /**
   * Obtener configuración con override
   */
  getConfigWithOverride(overrides: Partial<PerformanceSettings>): PerformanceSettings {
    return { ...CONFIG[currentLevel], ...overrides };
  },
};

// Auto-detect on import
if (typeof window !== 'undefined') {
  PerformanceManager.autoDetect();
}
