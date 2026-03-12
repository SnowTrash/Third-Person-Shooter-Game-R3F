/**
 * useLeafDebugInfo
 * 
 * Hook especializado para debugging que centraliza la información
 * de visualización de CLAMP properties para consola y UI.
 * 
 * Ventajas:
 * - Formato consistente para debugging
 * - Renderizado eficiente (memoizado)
 * - Separación de concerns (debug logic vs UI rendering)
 * - Fácil de extender con nuevos metrics
 */

import { useMemo } from 'react';
import { useLeafVisualization } from './useLeafVisualization';
import type { LeafProperties } from '../systems/LeafGeometrySystem';

export interface LeafDebugInfo {
  // Hojas
  currentLeafProps: LeafProperties;
  targetLeafProps: LeafProperties;
  
  // Métrica de progreso
  similarity: number; // 0-100%
  dominantZone: string;
  
  // Propiedades formateadas para debugging
  propertyTable: Array<{
    property: string;
    current: string;
    target: string;
    distance: string;
    percentile: number;
  }>;
  
  // Summary para consola
  consoleLog: string;
}

/**
 * Formatea un número entre 0-1 con 2 decimales
 */
const formatValue = (val: number) => val.toFixed(2);

/**
 * Calcula el percentil de distancia (0-100%)
 */
const getDistancePercentile = (delta: number): number => {
  return Math.round(delta * 100);
};

export const useLeafDebugInfo = (): LeafDebugInfo => {
  const viz = useLeafVisualization();

  const debugInfo = useMemo(() => {
    const propertyTable = viz.propertyDeltas.map(p => ({
      property: p.label,
      current: formatValue(p.current),
      target: formatValue(p.target),
      distance: formatValue(p.delta),
      percentile: getDistancePercentile(p.delta),
    }));

    const consoleLog = [
      `[CLAMP Debug] Zone: ${viz.dominantZone?.type || 'NONE'}`,
      `Similarity: ${viz.similarity.toFixed(0)}%`,
      `Properties differing:`,
      propertyTable
        .filter(p => parseInt(p.percentile.toString()) > 5)
        .map(p => `  ${p.property}: ${p.current} → ${p.target} (${p.percentile}%)`)
        .join('\n'),
    ].join('\n');

    return {
      currentLeafProps: viz.currentLeaf,
      targetLeafProps: viz.targetLeaf,
      similarity: viz.similarity,
      dominantZone: viz.dominantZone?.type || 'none',
      propertyTable,
      consoleLog,
    };
  }, [viz]);

  return debugInfo;
};

/**
 * Hook auxiliar: Loguear a consola cuando cambie el debug info
 * Útil para desarrollo
 */
export const useLeafDebugConsole = (enabled: boolean = false) => {
  const debugInfo = useLeafDebugInfo();

  useMemo(() => {
    if (enabled && debugInfo) {
      console.log(debugInfo.consoleLog);
    }
  }, [enabled, debugInfo]);
};
