import { useMemo } from 'react';
import { useLeafMorphHistory } from '../context/LeafMorphHistoryContext';
import { usePaleobotanyEducation } from '../context/PaleobotanyEducationContext';
import { useInfluenceZones } from '../context/InfluenceZoneContext';
import {
  PHASE_CHECKPOINTS,
  getInterpolatedLeafTarget,
  calculateCLAMPSimilarity,
} from '../systems/QuercusEvolutionSystem';
import type { LeafProperties } from '../systems/LeafGeometrySystem';

/**
 * useLeafVisualization
 *
 * Hook centralizado que sincroniza Debug HUD y MiniVisualizer
 * Ambos componentes usan esta única "fuente de verdad"
 *
 * Beneficios:
 * 1. Garantiza que ambos ven los mismos datos
 * 2. Reduce duplicación de lógica
 * 3. Facilita debugging (un lugar para cambiar)
 * 4. Performance: Cálculos hechos una sola vez
 */
export interface LeafVisualizationData {
  // Estado actual
  currentLeaf: LeafProperties;
  currentPhase: number;
  phaseInfo: {
    name: string;
    era: string;
    ma: number; // millones de años atrás
  };

  // Estado target
  targetLeaf: LeafProperties;
  nextPhaseInfo?: {
    name: string;
    era: string;
    ma: number;
  };

  // Progresión
  similarity: number; // 0-100%
  progress: number; // 0-1 hacia siguiente fase
  timeAccumulated: number; // segundos
  timeRequired: number; // segundos necesarios
  puzzlesCompleted: number;
  puzzlesRequired: number;

  // Contexto ambiental
  dominantZone: {
    type: string;
    color: string;
    description: string;
  } | null;
  isInZone: boolean;

  // Propiedades individuales (para barras visuales)
  propertyDeltas: Array<{
    name: keyof LeafProperties;
    label: string;
    current: number;
    target: number;
    delta: number; // qué tan lejos está
    min: number;
    max: number;
  }>;
}

export const useLeafVisualization = (): LeafVisualizationData => {
  // Obtener estado de todos los contextos
  const { getCurrentMorph } = useLeafMorphHistory();
  const { evolutionState } = usePaleobotanyEducation();
  const { playerZoneState } = useInfluenceZones();

  // Calcular valores derivados (memoized para performance)
  const data = useMemo(() => {
    const currentLeaf = getCurrentMorph();
    const currentPhase = evolutionState.currentPhase;
    const targetLeaf = getInterpolatedLeafTarget(evolutionState);

    // Info de fase actual
    const currentCheckpoint = PHASE_CHECKPOINTS[currentPhase as keyof typeof PHASE_CHECKPOINTS];
    const phaseInfo = {
      name: currentCheckpoint.name,
      era: currentCheckpoint.scientificEra,
      ma: currentCheckpoint.approximateMillionsYearsAgo,
    };

    // Info de siguiente fase (si existe)
    let nextPhaseInfo: LeafVisualizationData['nextPhaseInfo'];
    if (currentPhase < 4) {
      const nextCheckpoint = PHASE_CHECKPOINTS[(currentPhase + 1) as keyof typeof PHASE_CHECKPOINTS];
      nextPhaseInfo = {
        name: nextCheckpoint.name,
        era: nextCheckpoint.scientificEra,
        ma: nextCheckpoint.approximateMillionsYearsAgo,
      };
    }

    // Calcular similitud
    const similarity = calculateCLAMPSimilarity(currentLeaf, targetLeaf);

    // Información de zona dominante
    const dominantZone = playerZoneState.dominantZone
      ? {
          type: playerZoneState.dominantZone.type,
          color: playerZoneState.dominantZone.color,
          description: playerZoneState.dominantZone.description,
        }
      : null;

    // Calcular deltas por propiedad (para barras visuales)
    const propertyConfig: Array<[keyof LeafProperties, string, number, number]> = [
      ['width', 'Width', 0, 1],
      ['length', 'Length', 0.5, 1.5],
      ['pointiness', 'Pointiness', 0, 1],
      ['surface', 'Surface', 0, 1],
      ['thickness', 'Thickness', 0, 1],
      ['lobed', 'Lobed', 0, 1],
      ['teeth', 'Teeth', 0, 1],
      ['teethRegularity', 'Regularity', 0, 1],
      ['teethCloseness', 'Closeness', 0, 1],
      ['teethRounded', 'Rounded', 0, 1],
      ['teethAcute', 'Acute', 0, 1],
      ['teethCompound', 'Compound', 0, 1],
      ['apexEmarginate', 'Apex', 0, 1],
    ];

    const propertyDeltas = propertyConfig.map(([key, label, min, max]) => {
      const currentValue = currentLeaf[key];
      const targetValue = targetLeaf[key];
      const delta = Math.abs(currentValue - targetValue);

      return {
        name: key,
        label,
        current: currentValue,
        target: targetValue,
        delta,
        min,
        max,
      };
    });

    return {
      // Estado actual
      currentLeaf,
      currentPhase,
      phaseInfo,

      // Estado target
      targetLeaf,
      nextPhaseInfo,

      // Progresión
      similarity,
      progress: evolutionState.progressTowardsNext,
      timeAccumulated: evolutionState.timeAccumulatedInZone,
      timeRequired: currentCheckpoint.requiredTimeInZone,
      puzzlesCompleted: evolutionState.puzzlesCompletedInPhase,
      puzzlesRequired: currentCheckpoint.requiredPuzzles,

      // Contexto ambiental
      dominantZone,
      isInZone: playerZoneState.isInZone,

      // Propiedades individuales
      propertyDeltas,
    };
  }, [
    // Agregar dependencias más granulares
    getCurrentMorph,
    evolutionState.currentPhase,
    evolutionState.progressTowardsNext,
    evolutionState.timeAccumulatedInZone,
    evolutionState.puzzlesCompletedInPhase,
    playerZoneState.dominantZone?.type,
    playerZoneState.dominantZone?.color,
    playerZoneState.isInZone,
  ]);

  return data;
};

/**
 * Hook adicional: obtener solo similarity para casos simples
 */
export const useLeafSimilarity = (): number => {
  const { similarity } = useLeafVisualization();
  return similarity;
};

/**
 * Hook adicional: obtener solo propiedades para barras
 */
export const useLeafProperties = () => {
  const { propertyDeltas, currentLeaf, targetLeaf } = useLeafVisualization();
  return { propertyDeltas, currentLeaf, targetLeaf };
};

/**
 * Hook adicional: obtener info de fase para UI
 */
export const usePhaseInfo = () => {
  const { currentPhase, phaseInfo, progress, timeAccumulated, timeRequired } =
    useLeafVisualization();

  return {
    currentPhase,
    phaseInfo,
    progress,
    timeAccumulated,
    timeRequired,
  };
};
