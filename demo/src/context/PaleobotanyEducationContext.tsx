import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  EvolutionState,
  createInitialEvolutionState,
  accumulateZoneTime,
  completePuzzle,
  debugAdvancePhase,
  debugAdvanceTime,
} from '../systems/QuercusEvolutionSystem';
import {
  advancePhaseIfReady,
  revertToPreviousPhase,
  calculatePhaseProgress,
} from '../systems/PhaseAdvancementSystem';
import { useInfluenceZones } from './InfluenceZoneContext';
import type { ZoneType } from './InfluenceZoneContext';

/**
 * PaleobotanyEducationContext
 * 
 * Gestiona:
 * 1. Estado de evolución (fase, progreso, tiempo)
 * 2. Narrativa desbloqueada
 * 3. Puzzles completados
 * 4. Tracking de movimiento dentro/fuera de zona
 */

interface PaleobotanyContextType {
  // Estado de evolución
  evolutionState: EvolutionState;
  
  // Acciones principales
  updateEvolution: (deltaTime: number) => void;
  completePuzzleAction: () => void;
  resetEvolution: () => void;
  
  // Debug - Control de fases
  debugAdvanceToNextPhase: () => void;
  debugRevertToPreviousPhase: () => void;
  debugAddTime: (seconds: number) => void;
  debugSubtractTime: (seconds: number) => void;
  debugCompletePuzzle: () => void;
  
  // Narrativa
  isNarrativeUnlocked: (phase: number) => boolean;
  markNarrativeAsRead: (phase: number) => void;
  
  // Zona actual
  currentZoneType: ZoneType | null;
  isInZone: boolean;
}

const PaleobotanyContext = createContext<PaleobotanyContextType | undefined>(undefined);

interface PaleobotanyEducationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider que envuelve el árbol de componentes
 */
export const PaleobotanyEducationProvider: React.FC<PaleobotanyEducationProviderProps> = ({ children }) => {
  const { playerZoneState } = useInfluenceZones();
  const [evolutionState, setEvolutionState] = useState<EvolutionState>(createInitialEvolutionState());

  /**
   * ACTUALIZAR EVOLUCIÓN CADA FRAME
   * 
   * ARQUITECTURA MEJORADA:
   * 1. Acumula tiempo en CUALQUIER zona (no solo speed_boost)
   * 2. Automáticamente avanza fase cuando se cumplen condiciones
   * 3. Calcula progreso visual (0-1) hacia siguiente fase
   */
  const updateEvolution = useCallback((deltaTime: number) => {
    setEvolutionState(prev => {
      // Solo acumular si está EN una zona
      if (!playerZoneState.isInZone) return prev;

      // Acumular tiempo (antes: solo en speed_boost)
      let updated = accumulateZoneTime(prev, deltaTime);

      // IMPORTANTE: Intentar avanzar fase automáticamente si se cumplen condiciones
      updated = advancePhaseIfReady(updated);

      // Actualizar progreso visual
      updated = {
        ...updated,
        progressTowardsNext: calculatePhaseProgress(updated),
      };

      return updated;
    });
  }, [playerZoneState.isInZone]);

  /**
   * COMPLETAR PUZZLE
   * Incrementa contador de puzzles y verifica si se puede avanzar fase
   */
  const completePuzzleAction = useCallback(() => {
    setEvolutionState(prev => {
      let updated = completePuzzle(prev);
      
      // Intentar avanzar si se cumplen condiciones
      updated = advancePhaseIfReady(updated);
      
      // Actualizar progreso
      updated = {
        ...updated,
        progressTowardsNext: calculatePhaseProgress(updated),
      };

      return updated;
    });
  }, []);

  // Reset (nueva partida)
  const resetEvolution = useCallback(() => {
    setEvolutionState(createInitialEvolutionState());
  }, []);

  // Debug: Avanzar fase manualmente
  const debugAdvanceToNextPhase = useCallback(() => {
    console.log('[DEBUG] Avanzar a siguiente fase (manual)');
    setEvolutionState(prev => {
      const newState = debugAdvancePhase(prev);
      return {
        ...newState,
        progressTowardsNext: calculatePhaseProgress(newState),
      };
    });
  }, []);

  // Debug: Revertir a fase anterior
  const debugRevertToPreviousPhase = useCallback(() => {
    console.log('[DEBUG] Revertir a fase anterior');
    setEvolutionState(prev => {
      const newState = revertToPreviousPhase(prev);
      return {
        ...newState,
        progressTowardsNext: calculatePhaseProgress(newState),
      };
    });
  }, []);

  // Debug: Añadir tiempo (+ T)
  const debugAddTime = useCallback((seconds: number) => {
    setEvolutionState(prev => {
      let updated = debugAdvanceTime(prev, seconds);
      
      // Intentar avanzar automáticamente
      updated = advancePhaseIfReady(updated);
      
      updated = {
        ...updated,
        progressTowardsNext: calculatePhaseProgress(updated),
      };

      console.log(`[DEBUG] +${seconds}s tiempo. Total: ${updated.timeAccumulatedInZone}s`);
      return updated;
    });
  }, []);

  // Debug: Restar tiempo (Shift + T)
  const debugSubtractTime = useCallback((seconds: number) => {
    setEvolutionState(prev => {
      const updated = {
        ...prev,
        timeAccumulatedInZone: Math.max(0, prev.timeAccumulatedInZone - seconds),
        progressTowardsNext: 0, // Reset progreso si se reduce tiempo
      };

      console.log(`[DEBUG] -${seconds}s tiempo. Total: ${updated.timeAccumulatedInZone}s`);
      return updated;
    });
  }, []);

  // Debug: Completar puzzle instantáneamente (G)
  const debugCompletePuzzle = useCallback(() => {
    setEvolutionState(prev => {
      let updated = completePuzzle(prev);
      
      // Intentar avanzar
      updated = advancePhaseIfReady(updated);
      
      updated = {
        ...updated,
        progressTowardsNext: calculatePhaseProgress(updated),
      };

      console.log(`[DEBUG] Puzzle completado. Total: ${updated.puzzlesCompletedInPhase}/${updated.currentPhase + 1} para siguiente fase`);
      return updated;
    });
  }, []);

  // Narrativa
  const isNarrativeUnlocked = useCallback((phase: number): boolean => {
    return phase < evolutionState.narrativeUnlocked.length && evolutionState.narrativeUnlocked[phase];
  }, [evolutionState]);

  const markNarrativeAsRead = useCallback((phase: number) => {
    setEvolutionState(prev => ({
      ...prev,
      narrativeUnlocked: prev.narrativeUnlocked.map((v, i) => i === phase ? true : v),
    }));
  }, []);

  const value: PaleobotanyContextType = {
    evolutionState,
    updateEvolution,
    completePuzzleAction,
    resetEvolution,
    debugAdvanceToNextPhase,
    debugRevertToPreviousPhase,
    debugAddTime,
    debugSubtractTime,
    debugCompletePuzzle,
    isNarrativeUnlocked,
    markNarrativeAsRead,
    currentZoneType: playerZoneState.dominantZone?.type ?? null,
    isInZone: playerZoneState.isInZone,
  };

  return (
    <PaleobotanyContext.Provider value={value}>
      {children}
    </PaleobotanyContext.Provider>
  );
};

/**
 * Hook para usar el contexto
 */
export const usePaleobotanyEducation = (): PaleobotanyContextType => {
  const context = useContext(PaleobotanyContext);
  if (!context) {
    throw new Error('usePaleobotanyEducation must be used within PaleobotanyEducationProvider');
  }
  return context;
};
