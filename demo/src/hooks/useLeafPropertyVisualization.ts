import { useMemo } from 'react';
import { useLeafVisualization } from './useLeafVisualization';
import type { LeafProperties } from '../systems/LeafGeometrySystem';

/**
 * useLeafPropertyVisualization.ts
 * 
 * Hook profesional para visualización de propiedades CLAMP.
 * Centraliza todo lo relacionado con representación visual de propiedades.
 * 
 * VENTAJAS:
 * - Single source of truth para visualización
 * - Cálculos memoizados (eficiente)
 * - Colorización automática y consistente
 * - Normalización de valores para gráficos
 * - Narrativa botánica clara
 * - Fácil de debugear
 */

export interface PropertyVisualization {
  // Identificador
  key: keyof LeafProperties;
  label: string;
  description: string;  // Narrativa botánica

  // Valores
  current: number;
  target: number;
  delta: number;        // Distancia (0-1)
  deltaPercent: number; // Para porcentajes

  // Rango válido
  min: number;
  max: number;
  normalized: number;   // 0-1 para barras

  // Visualización
  color: string;        // Color basado en delta
  intensity: number;    // 0-1 para sombras/glow
  isConverging: boolean; // ¿Se está acercando al target?
  isMovingAway: boolean; // ¿Se aleja del target?
}

export interface PropertyVisualizationGroup {
  category: 'morphology' | 'botanical';
  title: string;
  description: string;
  properties: PropertyVisualization[];
  groupDelta: number;   // Promedio de deltas en el grupo
  groupColor: string;   // Color del grupo
  groupIntensity: number;
}

const PROPERTY_METADATA: Record<keyof LeafProperties, {
  label: string;
  description: string;
  category: 'morphology' | 'botanical';
  min: number;
  max: number;
}> = {
  width: {
    label: 'Width',
    description: 'Ancho de la hoja (estrecha → amplia)',
    category: 'morphology',
    min: 0,
    max: 1,
  },
  length: {
    label: 'Length',
    description: 'Largo de la hoja (corta → larga)',
    category: 'morphology',
    min: 0.5,
    max: 1.5,
  },
  pointiness: {
    label: 'Pointiness',
    description: 'Punta de la hoja (redondeada → puntiaguda)',
    category: 'morphology',
    min: 0,
    max: 1,
  },
  surface: {
    label: 'Surface',
    description: 'Textura de la superficie (lisa → rugosa)',
    category: 'morphology',
    min: 0,
    max: 1,
  },
  thickness: {
    label: 'Thickness',
    description: 'Espesor de la hoja (fina → gruesa)',
    category: 'morphology',
    min: 0,
    max: 1,
  },
  lobed: {
    label: 'Lobed',
    description: 'Presencia de lóbulos (entera → muy lobulada)',
    category: 'botanical',
    min: 0,
    max: 1,
  },
  teeth: {
    label: 'Teeth',
    description: 'Margen dentado (liso → muy dentado)',
    category: 'botanical',
    min: 0,
    max: 1,
  },
  teethRegularity: {
    label: 'Regularity',
    description: 'Regularidad de dientes (irregular → perfectamente regular)',
    category: 'botanical',
    min: 0,
    max: 1,
  },
  teethCloseness: {
    label: 'Closeness',
    description: 'Separación de dientes (separados → muy juntos)',
    category: 'botanical',
    min: 0,
    max: 1,
  },
  teethRounded: {
    label: 'Rounded',
    description: 'Dientes redondeados (puntiagudos → redondeados)',
    category: 'botanical',
    min: 0,
    max: 1,
  },
  teethAcute: {
    label: 'Acute',
    description: 'Dientes agudos (redondeados → muy agudos)',
    category: 'botanical',
    min: 0,
    max: 1,
  },
  teethCompound: {
    label: 'Compound',
    description: 'Complejidad de dientes (simple → compleja)',
    category: 'botanical',
    min: 0,
    max: 1,
  },
  apexEmarginate: {
    label: 'Apex',
    description: 'Forma del ápex (entero → profundamente escotado)',
    category: 'botanical',
    min: 0,
    max: 1,
  },
};

/**
 * Calcular color basado en delta (diferencia)
 * Verde = convergiendo, Amarillo = medio, Rojo = máxima diferencia
 */
function getDeltaColor(delta: number, intensity: number = 1): string {
  if (delta < 0.15) {
    // Verde (convergiendo)
    return `hsl(120, ${100 * intensity}%, 45%)`;
  } else if (delta < 0.35) {
    // Amarillo (medio cambio)
    return `hsl(45, ${100 * intensity}%, 50%)`;
  } else if (delta < 0.6) {
    // Naranja (mínimo cambio)
    return `hsl(25, ${100 * intensity}%, 50%)`;
  } else {
    // Rojo (máxima diferencia)
    return `hsl(0, ${100 * intensity}%, 50%)`;
  }
}

/**
 * Hook principal: obtener todas las propiedades visualizables
 */
export const useLeafPropertyVisualization = (): PropertyVisualizationGroup[] => {
  const { currentLeaf, targetLeaf } = useLeafVisualization();

  return useMemo(() => {
    // Documentación: El orden de las propiedades importa para la UI
    const propertyKeys: (keyof LeafProperties)[] = [
      // Grupo Morphología
      'width',
      'length',
      'pointiness',
      'surface',
      'thickness',
      // Grupo Botanical
      'lobed',
      'teeth',
      'teethRegularity',
      'teethCloseness',
      'teethRounded',
      'teethAcute',
      'teethCompound',
      'apexEmarginate',
    ];

    // Procesar propiedades individuales
    const allProperties = propertyKeys.map((key) => {
      const metadata = PROPERTY_METADATA[key];
      const currentValue = currentLeaf[key];
      const targetValue = targetLeaf[key];
      const delta = Math.abs(currentValue - targetValue);
      const oldDelta = Math.abs((currentLeaf as any)[key] - (targetLeaf as any)[key]) || 0;

      // Normalizar para barra (0-1 relative to rango)
      const normalized = (currentValue - metadata.min) / (metadata.max - metadata.min);

      // Dirección del cambio
      const isConverging = delta < oldDelta;
      const isMovingAway = delta > oldDelta;

      // Intensidad: máx cuando está cambiando, baja cuando estable
      const intensity = Math.min(1, delta / 0.5);

      return {
        key,
        label: metadata.label,
        description: metadata.description,
        current: currentValue,
        target: targetValue,
        delta,
        deltaPercent: delta * 100,
        min: metadata.min,
        max: metadata.max,
        normalized: Math.max(0, Math.min(1, normalized)),
        color: getDeltaColor(delta, intensity),
        intensity,
        isConverging,
        isMovingAway,
      } as PropertyVisualization;
    });

    // Agrupar por categoría
    const morphology = allProperties.filter(p => PROPERTY_METADATA[p.key].category === 'morphology');
    const botanical = allProperties.filter(p => PROPERTY_METADATA[p.key].category === 'botanical');

    // Calcular stats de grupos
    const createGroup = (
      properties: PropertyVisualization[],
      category: 'morphology' | 'botanical',
      title: string,
      description: string
    ): PropertyVisualizationGroup => {
      const groupDelta = properties.reduce((sum, p) => sum + p.delta, 0) / properties.length;
      const groupIntensity = Math.min(1, groupDelta / 0.5);

      return {
        category,
        title,
        description,
        properties,
        groupDelta,
        groupColor: getDeltaColor(groupDelta, groupIntensity),
        groupIntensity,
      };
    };

    return [
      createGroup(
        morphology,
        'morphology',
        'Basic Shape',
        'Propiedades de forma básica de la hoja'
      ),
      createGroup(
        botanical,
        'botanical',
        'Botanical Traits',
        'Características botánicas especializadas (CLAMP)'
      ),
    ];
  }, [
    // Propiedades específicas de currentLeaf
    currentLeaf.width,
    currentLeaf.length,
    currentLeaf.pointiness,
    currentLeaf.surface,
    currentLeaf.thickness,
    currentLeaf.lobed,
    currentLeaf.teeth,
    currentLeaf.teethRegularity,
    currentLeaf.teethCloseness,
    currentLeaf.teethRounded,
    currentLeaf.teethAcute,
    currentLeaf.teethCompound,
    currentLeaf.apexEmarginate,
    // Propiedades específicas de targetLeaf
    targetLeaf.width,
    targetLeaf.length,
    targetLeaf.pointiness,
    targetLeaf.surface,
    targetLeaf.thickness,
    targetLeaf.lobed,
    targetLeaf.teeth,
    targetLeaf.teethRegularity,
    targetLeaf.teethCloseness,
    targetLeaf.teethRounded,
    targetLeaf.teethAcute,
    targetLeaf.teethCompound,
    targetLeaf.apexEmarginate,
  ]);
};

/**
 * Hook auxiliar: obtener una propiedad específica
 */
export const usePropertyVisualization = (key: keyof LeafProperties): PropertyVisualization | null => {
  const groups = useLeafPropertyVisualization();
  
  return useMemo(() => {
    for (const group of groups) {
      const prop = group.properties.find(p => p.key === key);
      if (prop) return prop;
    }
    return null;
  }, [groups, key]);
};

/**
 * Hook auxiliar: obtener solo propiedades que están cambiando
 */
export const useActiveLeavesChanges = (threshold: number = 0.15): PropertyVisualization[] => {
  const groups = useLeafPropertyVisualization();

  return useMemo(() => {
    const active: PropertyVisualization[] = [];
    for (const group of groups) {
      for (const prop of group.properties) {
        if (prop.delta > threshold) {
          active.push(prop);
        }
      }
    }
    return active.sort((a, b) => b.delta - a.delta); // Ordenar por mayor cambio
  }, [groups, threshold]);
};
