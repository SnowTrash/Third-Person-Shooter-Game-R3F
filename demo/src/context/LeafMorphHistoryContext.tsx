import React, { createContext, useContext, useState, useCallback } from 'react';
import { LeafProperties } from '../systems/LeafGeometrySystem';

export interface MorphHistory {
  [zoneId: string]: LeafProperties;
}

interface LeafMorphHistoryContextType {
  morphHistory: MorphHistory;
  recordZoneMorph: (zoneId: string, props: LeafProperties) => void;
  getAccumulatedMorph: (zoneIds: string[]) => LeafProperties;
  resetHistory: () => void;
  getCurrentMorph: () => LeafProperties;
}

const LeafMorphHistoryContext = createContext<LeafMorphHistoryContextType | undefined>(undefined);

// Default leaf properties (starting state)
const DEFAULT_LEAF: LeafProperties = {
  width: 0.5,
  length: 1.0,
  pointiness: 0.5,
  surface: 0.3,
  thickness: 0.1,
};

// CLAMP helper: constrain values to [0, 1]
const clamp = (value: number, min: number = 0, max: number = 1): number => {
  return Math.max(min, Math.min(max, value));
};

// Blend two leaf properties with CLAMP
const blendLeafProperties = (
  a: LeafProperties,
  b: LeafProperties,
  weightB: number = 0.5
): LeafProperties => {
  const w = clamp(weightB, 0, 1);
  const blended = {
    width: clamp(a.width * (1 - w) + b.width * w, 0, 1),
    length: clamp(a.length * (1 - w) + b.length * w, 0.5, 1.5),
    pointiness: clamp(a.pointiness * (1 - w) + b.pointiness * w, 0, 1),
    surface: clamp(a.surface * (1 - w) + b.surface * w, 0, 1),
    thickness: clamp(a.thickness * (1 - w) + b.thickness * w, 0, 1),
  };
  return blended;
};

export const LeafMorphHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [morphHistory, setMorphHistory] = useState<MorphHistory>({});
  const [currentMorph, setCurrentMorph] = useState<LeafProperties>(DEFAULT_LEAF);

  const recordZoneMorph = useCallback((zoneId: string, props: LeafProperties) => {
    setMorphHistory((prev) => ({
      ...prev,
      [zoneId]: props,
    }));
  }, []);

  // Get accumulated morph by blending all visited zones with CLAMP
  const getAccumulatedMorph = useCallback((zoneIds: string[]): LeafProperties => {
    if (zoneIds.length === 0) return currentMorph;

    let accumulated = DEFAULT_LEAF;
    for (const zoneId of zoneIds) {
      if (morphHistory[zoneId]) {
        // Blend with equal weight to previous accumulated
        accumulated = blendLeafProperties(accumulated, morphHistory[zoneId], 0.5);
      }
    }

    setCurrentMorph(accumulated);
    return accumulated;
  }, [morphHistory, currentMorph]);

  const resetHistory = useCallback(() => {
    setMorphHistory({});
    setCurrentMorph(DEFAULT_LEAF);
  }, []);

  const getCurrentMorph = useCallback(() => currentMorph, [currentMorph]);

  return (
    <LeafMorphHistoryContext.Provider
      value={{
        morphHistory,
        recordZoneMorph,
        getAccumulatedMorph,
        resetHistory,
        getCurrentMorph,
      }}
    >
      {children}
    </LeafMorphHistoryContext.Provider>
  );
};

export const useLeafMorphHistory = (): LeafMorphHistoryContextType => {
  const context = useContext(LeafMorphHistoryContext);
  if (!context) {
    throw new Error('useLeafMorphHistory must be used within LeafMorphHistoryProvider');
  }
  return context;
};
