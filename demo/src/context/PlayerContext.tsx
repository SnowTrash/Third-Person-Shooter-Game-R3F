import React, { createContext, useContext, useState, useCallback } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';

interface PlayerContextType {
  rigidBodyRef: React.MutableRefObject<RapierRigidBody | null>;
  setPlayerRigidBody: (body: RapierRigidBody | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ 
  children: React.ReactNode;
  rigidBodyRef: React.MutableRefObject<RapierRigidBody | null>;
}> = ({ children, rigidBodyRef }) => {
  const setPlayerRigidBody = useCallback((body: RapierRigidBody | null) => {
    if (body) {
      rigidBodyRef.current = body;
    }
  }, [rigidBodyRef]);

  return (
    <PlayerContext.Provider value={{ rigidBodyRef, setPlayerRigidBody }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerRigidBody = (): React.MutableRefObject<RapierRigidBody | null> => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerRigidBody must be used within PlayerProvider');
  }
  return context.rigidBodyRef;
};

export const useSetPlayerRigidBody = (): ((body: RapierRigidBody | null) => void) => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('useSetPlayerRigidBody must be used within PlayerProvider');
  }
  return context.setPlayerRigidBody;
};
