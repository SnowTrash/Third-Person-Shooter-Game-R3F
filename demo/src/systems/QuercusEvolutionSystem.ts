import type { LeafProperties } from './LeafGeometrySystem';

/**
 * QuercusEvolutionSystem
 * 
 * Gestiona la progresión evolutiva del jugador hacia la forma Quercus.
 * 5 fases de transformación botánicas basadas en tiempo + mini-puzzles.
 */

export type EvolutionPhase = 0 | 1 | 2 | 3 | 4;

export interface PhaseCheckpoint {
  phase: EvolutionPhase;
  name: string;
  scientificEra: string;
  approximateMillionsYearsAgo: number;
  
  // Duración mínima en zone para desbloquear
  requiredTimeInZone: number; // segundos
  
  // Puzzles completados requeridos para desbloquear
  requiredPuzzles: number;
  
  // CLAMP target para esta fase
  leafTarget: LeafProperties;
  
  // Descripción visual
  environmentalContext: string;
}

export interface EvolutionState {
  currentPhase: EvolutionPhase;
  
  // Acumulación temporal
  timeAccumulatedInZone: number; // segundos
  lastZoneEntryTime: number;
  
  // Progreso dentro de fase
  progressTowardsNext: number; // 0-1
  
  // Puzzles completados en fase actual
  puzzlesCompletedInPhase: number;
  
  // Total de puzzles completados todo juego
  totalPuzzlesCompleted: number;
  
  // Si ha visto narrativa de esta fase
  narrativeUnlocked: boolean[];
}

// CLAMP Targets para cada fase
export const PHASE_CHECKPOINTS: Record<EvolutionPhase, PhaseCheckpoint> = {
  0: {
    phase: 0,
    name: 'Olmos Fósil - Base',
    scientificEra: 'Formación Olmos (Paleoceno)',
    approximateMillionsYearsAgo: 62,
    requiredTimeInZone: 0,
    requiredPuzzles: 0,
    leafTarget: {
      width: 0.4,
      length: 0.8,
      pointiness: 0.6,
      surface: 0.2,
      thickness: 0.08,
      lobed: 0.1,
      teeth: 0.0,
      teethRegularity: 0.0,
      teethCloseness: 0.0,
      teethRounded: 0.5,
      teethAcute: 0.5,
      teethCompound: 0.0,
      apexEmarginate: 0.0,
    },
    environmentalContext: 'Clima tropical húmedo, sin estacionalidad clara',
  },
  
  1: {
    phase: 1,
    name: 'Proto-roble Temprano (Eoceno Temprano)',
    scientificEra: 'Early Eocene (~55 Ma)',
    approximateMillionsYearsAgo: 55,
    requiredTimeInZone: 30,
    requiredPuzzles: 0,
    leafTarget: {
      width: 0.5,
      length: 0.95,
      pointiness: 0.5,
      surface: 0.28,
      thickness: 0.1,
      lobed: 0.3,
      teeth: 0.1,
      teethRegularity: 0.3,
      teethCloseness: 0.2,
      teethRounded: 0.6,
      teethAcute: 0.4,
      teethCompound: 0.0,
      apexEmarginate: 0.05,
    },
    environmentalContext: 'Iniciación de estacionalidad, primeros lóbulos adaptativos',
  },
  
  2: {
    phase: 2,
    name: 'Proto-roble Medio (Eoceno Medio)',
    scientificEra: 'Middle Eocene (~48 Ma)',
    approximateMillionsYearsAgo: 48,
    requiredTimeInZone: 45,
    requiredPuzzles: 1,
    leafTarget: {
      width: 0.6,
      length: 1.05,
      pointiness: 0.45,
      surface: 0.35,
      thickness: 0.12,
      lobed: 0.5,
      teeth: 0.2,
      teethRegularity: 0.4,
      teethCloseness: 0.3,
      teethRounded: 0.65,
      teethAcute: 0.35,
      teethCompound: 0.05,
      apexEmarginate: 0.1,
    },
    environmentalContext: 'Clima más estacional, especiación inicial, complejidad aumentada',
  },
  
  3: {
    phase: 3,
    name: 'Proto-Quercus Avanzado (Eoceno Tardío)',
    scientificEra: 'Late Eocene (~42 Ma)',
    approximateMillionsYearsAgo: 42,
    requiredTimeInZone: 60,
    requiredPuzzles: 2,
    leafTarget: {
      width: 0.65,
      length: 1.15,
      pointiness: 0.35,
      surface: 0.4,
      thickness: 0.15,
      lobed: 0.7,
      teeth: 0.15,
      teethRegularity: 0.45,
      teethCloseness: 0.35,
      teethRounded: 0.7,
      teethAcute: 0.3,
      teethCompound: 0.1,
      apexEmarginate: 0.1,
    },
    environmentalContext: 'Cambios climáticos globales, diversificación Fagaceae, defensa herbívoros',
  },
  
  4: {
    phase: 4,
    name: 'Quercus Moderno (Target Final)',
    scientificEra: 'Modern Quercus (0 Ma)',
    approximateMillionsYearsAgo: 0,
    requiredTimeInZone: 90,
    requiredPuzzles: 3,
    leafTarget: {
      width: 0.7,
      length: 1.2,
      pointiness: 0.3,
      surface: 0.45,
      thickness: 0.2,
      lobed: 0.85,
      teeth: 0.08,
      teethRegularity: 0.2,
      teethCloseness: 0.1,
      teethRounded: 0.9,
      teethAcute: 0.1,
      teethCompound: 0.0,
      apexEmarginate: 0.05,
    },
    environmentalContext: 'Éxito evolutivo moderno, hojas altamente especializadas, dominancia ecológica',
  },
};

/**
 * Calcula el progreso actual hacia la siguiente fase (0-1)
 */
export function calculatePhaseProgress(state: EvolutionState): number {
  if (state.currentPhase === 4) return 1.0; // Terminado
  
  const checkpoint = PHASE_CHECKPOINTS[state.currentPhase];
  
  // Progreso por tiempo
  const timeProgress = Math.min(
    state.timeAccumulatedInZone / checkpoint.requiredTimeInZone,
    1.0
  );
  
  // Progreso por puzzles
  const puzzleProgress = Math.min(
    state.puzzlesCompletedInPhase / Math.max(checkpoint.requiredPuzzles, 1),
    1.0
  );
  
  // Ambos deben estar completados
  return Math.min(timeProgress, puzzleProgress);
}

/**
 * Intenta avanzar a siguiente fase si se cumplen requisitos
 */
export function attemptPhaseAdvancement(state: EvolutionState): EvolutionState {
  if (state.currentPhase === 4) return state; // Terminado
  
  const checkpoint = PHASE_CHECKPOINTS[state.currentPhase];
  const hasEnoughTime = state.timeAccumulatedInZone >= checkpoint.requiredTimeInZone;
  const hasEnoughPuzzles = state.puzzlesCompletedInPhase >= checkpoint.requiredPuzzles;
  
  if (hasEnoughTime && hasEnoughPuzzles) {
    return {
      ...state,
      currentPhase: (state.currentPhase + 1) as EvolutionPhase,
      progressTowardsNext: 0,
      timeAccumulatedInZone: 0,
      puzzlesCompletedInPhase: 0,
      narrativeUnlocked: [
        ...state.narrativeUnlocked,
        false, // Nueva narrativa desbloqueada pero no leída
      ],
    };
  }
  
  return state;
}

/**
 * Suma tiempo a zona. Debe llamarse cada frame cuando jugador está en zona.
 */
export function accumulateZoneTime(state: EvolutionState, deltaTime: number): EvolutionState {
  return {
    ...state,
    timeAccumulatedInZone: state.timeAccumulatedInZone + deltaTime,
    progressTowardsNext: calculatePhaseProgress(state),
  };
}

/**
 * Marca puzzle como completado
 */
export function completePuzzle(state: EvolutionState): EvolutionState {
  const newState = {
    ...state,
    puzzlesCompletedInPhase: state.puzzlesCompletedInPhase + 1,
    totalPuzzlesCompleted: state.totalPuzzlesCompleted + 1,
  };
  
  // Recalcular progreso
  newState.progressTowardsNext = calculatePhaseProgress(newState);
  
  // Intentar avanzar
  return attemptPhaseAdvancement(newState);
}

/**
 * Interpola CLAMP entre fase actual y siguiente (para visualización smoothing)
 */
export function getInterpolatedLeafTarget(state: EvolutionState): LeafProperties {
  const currentCheckpoint = PHASE_CHECKPOINTS[state.currentPhase];
  
  if (state.currentPhase === 4) {
    return currentCheckpoint.leafTarget; // Ya terminó
  }
  
  const nextPhase = (state.currentPhase + 1) as EvolutionPhase;
  const nextCheckpoint = PHASE_CHECKPOINTS[nextPhase];
  const progress = state.progressTowardsNext;
  const current = currentCheckpoint.leafTarget;
  const next = nextCheckpoint.leafTarget;
  
  // Interpolar todas las propiedades
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  
  return {
    width: lerp(current.width, next.width, progress),
    length: lerp(current.length, next.length, progress),
    pointiness: lerp(current.pointiness, next.pointiness, progress),
    surface: lerp(current.surface, next.surface, progress),
    thickness: lerp(current.thickness, next.thickness, progress),
    lobed: lerp(current.lobed, next.lobed, progress),
    teeth: lerp(current.teeth, next.teeth, progress),
    teethRegularity: lerp(current.teethRegularity, next.teethRegularity, progress),
    teethCloseness: lerp(current.teethCloseness, next.teethCloseness, progress),
    teethRounded: lerp(current.teethRounded, next.teethRounded, progress),
    teethAcute: lerp(current.teethAcute, next.teethAcute, progress),
    teethCompound: lerp(current.teethCompound, next.teethCompound, progress),
    apexEmarginate: lerp(current.apexEmarginate, next.apexEmarginate, progress),
  };
}

/**
 * Estado inicial para nuevo juego
 */
export function createInitialEvolutionState(): EvolutionState {
  return {
    currentPhase: 0,
    timeAccumulatedInZone: 0,
    lastZoneEntryTime: 0,
    progressTowardsNext: 0,
    puzzlesCompletedInPhase: 0,
    totalPuzzlesCompleted: 0,
    narrativeUnlocked: [true, false, false, false, false], // Fase 0 automáticamente desbloqueada
  };
}

/**
 * Debug: Avanzar a fase siguiente (DEV ONLY)
 */
export function debugAdvancePhase(state: EvolutionState): EvolutionState {
  if (state.currentPhase >= 4) return state;
  
  const nextPhase = (state.currentPhase + 1) as EvolutionPhase;
  return {
    ...state,
    currentPhase: nextPhase,
    progressTowardsNext: 0,
    timeAccumulatedInZone: 0,
    puzzlesCompletedInPhase: 0,
    narrativeUnlocked: [
      ...state.narrativeUnlocked.slice(0, nextPhase),
      true,
      ...state.narrativeUnlocked.slice(nextPhase + 1),
    ],
  };
}

/**
 * Debug: Avanzar tiempo en zona
 */
export function debugAdvanceTime(state: EvolutionState, seconds: number): EvolutionState {
  return accumulateZoneTime(state, seconds);
}

/**
 * Calcula distancia euclidiana entre dos CLAMP vectors
 * (para debugging - permite ver qué tan cerca está actual de target)
 */
export function calculateCLAMPDistance(current: LeafProperties, target: LeafProperties): number {
  const w: number = current.width - target.width;
  const l: number = current.length - target.length;
  const p: number = current.pointiness - target.pointiness;
  const s: number = current.surface - target.surface;
  const t: number = current.thickness - target.thickness;
  const lobed: number = current.lobed - target.lobed;
  const teeth: number = current.teeth - target.teeth;
  const reg: number = current.teethRegularity - target.teethRegularity;
  const close: number = current.teethCloseness - target.teethCloseness;
  const round: number = current.teethRounded - target.teethRounded;
  const acute: number = current.teethAcute - target.teethAcute;
  const compound: number = current.teethCompound - target.teethCompound;
  const apex: number = current.apexEmarginate - target.apexEmarginate;
  
  return Math.sqrt(
    w*w + l*l + p*p + s*s + t*t + lobed*lobed + teeth*teeth + 
    reg*reg + close*close + round*round + acute*acute + compound*compound + apex*apex
  );
}

/**
 * Calcula porcentaje de similitud (0-100%)
 */
export function calculateCLAMPSimilarity(current: LeafProperties, target: LeafProperties): number {
  const distance = calculateCLAMPDistance(current, target);
  // Máxima posible distancia = sqrt(13) ≈ 3.6
  const maxDistance = 3.6; 
  const similarity = Math.max(0, 1 - (distance / maxDistance));
  return similarity * 100; // Porcentaje
}
