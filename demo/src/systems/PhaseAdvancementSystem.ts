/**
 * PhaseAdvancementSystem.ts
 * 
 * Sistema profesional de progresión automática de fases.
 * 
 * ARQUITECTURA:
 * - Progresión automática cuando se cumplen condiciones
 * - Sin intervención manual (tecla F es solo DEBUG)
 * - Reversión de fases posible (Shift+F)
 * - Sincronización con miniviz automática
 */

import type { EvolutionState, EvolutionPhase } from './QuercusEvolutionSystem';
import { PHASE_CHECKPOINTS } from './QuercusEvolutionSystem';

export interface PhaseAdvancementRule {
  phase: EvolutionPhase;
  /** Tiempo acumulado requerido en zona (segundos) */
  requiredTime: number;
  /** Puzzles completados requeridos */
  requiredPuzzles: number;
  /** Si se cumple todo, ¿es automático? */
  automatic: boolean;
}

/**
 * Evaluar si se pueden cumplir condiciones para avanzar de fase
 * Retorna:
 * - { canAdvance: true, nextPhase: X } si se cumplen condiciones
 * - { canAdvance: false } si no se cumplen
 */
export function evaluatePhaseAdvancement(
  currentState: EvolutionState
): { canAdvance: boolean; nextPhase?: EvolutionPhase; reason?: string } {
  // Ya en fase máxima
  if (currentState.currentPhase >= 4) {
    return { canAdvance: false, reason: 'Ya en fase final' };
  }

  const nextPhase = (currentState.currentPhase + 1) as EvolutionPhase;
  const nextCheckpoint = PHASE_CHECKPOINTS[nextPhase];

  // Verificar tiempo requerido
  if (currentState.timeAccumulatedInZone < nextCheckpoint.requiredTimeInZone) {
    return {
      canAdvance: false,
      reason: `Tiempo insuficiente: ${currentState.timeAccumulatedInZone}s / ${nextCheckpoint.requiredTimeInZone}s`,
    };
  }

  // Verificar puzzles requeridos
  if (currentState.puzzlesCompletedInPhase < nextCheckpoint.requiredPuzzles) {
    return {
      canAdvance: false,
      reason: `Puzzles incompletos: ${currentState.puzzlesCompletedInPhase} / ${nextCheckpoint.requiredPuzzles}`,
    };
  }

  // Condiciones cumplidas
  return {
    canAdvance: true,
    nextPhase,
    reason: `Listo para fase ${nextPhase}`,
  };
}

/**
 * Avanzar a siguiente fase (automático si se cumplen condiciones)
 * Retorna nuevo estado o el mismo si no es posible avanzar
 */
export function advancePhaseIfReady(state: EvolutionState): EvolutionState {
  const evaluation = evaluatePhaseAdvancement(state);

  if (!evaluation.canAdvance || !evaluation.nextPhase) {
    return state;
  }

  // Avanzar fase y resetear acumuladores de esa fase
  return {
    ...state,
    currentPhase: evaluation.nextPhase,
    timeAccumulatedInZone: 0, // Reset para siguiente fase
    puzzlesCompletedInPhase: 0, // Reset para siguiente fase
    progressTowardsNext: 0, // Reset progreso visual
  };
}

/**
 * Revertir a fase anterior (debug/reset)
 * Útil si jugador quiere revisar una fase anterior
 */
export function revertToPreviousPhase(state: EvolutionState): EvolutionState {
  if (state.currentPhase <= 0) {
    console.warn('[PhaseSystem] Ya en fase inicial, no se puede revertir');
    return state;
  }

  const previousPhase = (state.currentPhase - 1) as EvolutionPhase;

  return {
    ...state,
    currentPhase: previousPhase,
    timeAccumulatedInZone: 0,
    puzzlesCompletedInPhase: 0,
    progressTowardsNext: 0,
  };
}

/**
 * Calcular progreso visual hacia siguiente fase (0-1)
 * Basado en tiempo + puzzles
 */
export function calculatePhaseProgress(state: EvolutionState): number {
  if (state.currentPhase >= 4) return 1; // Fase final

  const nextCheckpoint = PHASE_CHECKPOINTS[(state.currentPhase + 1) as EvolutionPhase];

  // Contribution de cada factor (50% tiempo, 50% puzzles)
  const timeProgress = Math.min(1, state.timeAccumulatedInZone / nextCheckpoint.requiredTimeInZone);
  const puzzleProgress = Math.min(1, state.puzzlesCompletedInPhase / nextCheckpoint.requiredPuzzles);

  // Promedio ponderado
  const combined = (timeProgress + puzzleProgress) / 2;

  return Math.min(1, combined);
}

/**
 * Obtener detalles de progreso hacia siguiente fase
 */
export function getPhaseProgressDetails(state: EvolutionState) {
  if (state.currentPhase >= 4) {
    return {
      canAdvance: true,
      phase: 4,
      timeProgress: 1,
      puzzleProgress: 1,
      overall: 1,
      timeRemaining: 0,
      puzzlesRemaining: 0,
      message: '🏆 Evolución completa',
    };
  }

  const nextCheckpoint = PHASE_CHECKPOINTS[(state.currentPhase + 1) as EvolutionPhase];

  const timeProgress = state.timeAccumulatedInZone / nextCheckpoint.requiredTimeInZone;
  const puzzleProgress = state.puzzlesCompletedInPhase / nextCheckpoint.requiredPuzzles;
  const overall = calculatePhaseProgress(state);

  const timeRemaining = Math.max(0, nextCheckpoint.requiredTimeInZone - state.timeAccumulatedInZone);
  const puzzlesRemaining = Math.max(0, nextCheckpoint.requiredPuzzles - state.puzzlesCompletedInPhase);

  return {
    canAdvance: timeRemaining === 0 && puzzlesRemaining === 0,
    phase: state.currentPhase,
    nextPhase: state.currentPhase + 1,
    timeProgress: Math.min(1, timeProgress),
    puzzleProgress: Math.min(1, puzzleProgress),
    overall,
    timeRemaining,
    puzzlesRemaining,
    message:
      timeRemaining === 0 && puzzlesRemaining === 0
        ? `✅ Listo para fase ${state.currentPhase + 1}`
        : `⏳ ${timeRemaining}s tiempo | 🧩 ${puzzlesRemaining} puzzles`,
  };
}
