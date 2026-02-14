import React, { createContext, useContext, useState, useCallback } from 'react';
import * as THREE from 'three';

export type ZoneType = 'ice' | 'jump_boost' | 'damage' | 'slow' | 'speed_boost';

export interface InfluenceZone {
  id: string;
  type: ZoneType;
  position: THREE.Vector3;
  radius: number;
  color: string;
  intensity: number;
  description: string;
}

export interface PlayerZoneState {
  activeZones: InfluenceZone[];
  isInZone: boolean;
  dominantZone: InfluenceZone | null;
}

interface InfluenceZoneContextType {
  zones: InfluenceZone[];
  playerZoneState: PlayerZoneState;
  playerPosition: THREE.Vector3;
  addZone: (zone: InfluenceZone) => void;
  removeZone: (zoneId: string) => void;
  updatePlayerZones: (playerPos: THREE.Vector3) => void;
  getZoneEffect: (zone: InfluenceZone) => number;
}

const InfluenceZoneContext = createContext<InfluenceZoneContextType | undefined>(undefined);

export const InfluenceZoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<InfluenceZone[]>([]);
  const [playerPosition, setPlayerPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  const [playerZoneState, setPlayerZoneState] = useState<PlayerZoneState>({
    activeZones: [],
    isInZone: false,
    dominantZone: null,
  });

  const addZone = useCallback((zone: InfluenceZone) => {
    setZones(prev => [...prev, zone]);
  }, []);

  const removeZone = useCallback((zoneId: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
  }, []);

  const getZoneEffect = useCallback((zone: InfluenceZone): number => {
    // Return effect multiplier based on zone type
    const effects: Record<ZoneType, number> = {
      'ice': 0.5,        // 50% movement speed (slippery)
      'jump_boost': 1.5, // 150% jump power
      'damage': 0,       // 0% movement (freezing damage effect)
      'slow': 0.6,       // 60% movement speed
      'speed_boost': 1.5, // 150% movement speed
    };
    return effects[zone.type] || 1;
  }, []);

  const updatePlayerZones = useCallback((playerPos: THREE.Vector3) => {
    const active = zones.filter(zone => {
      const distance = playerPos.distanceTo(zone.position);
      const isInside = distance <= zone.radius;
      return isInside;
    });

    const dominant = active.length > 0 ? active[0] : null;

    setPlayerPosition(new THREE.Vector3().copy(playerPos));
    setPlayerZoneState({
      activeZones: active,
      isInZone: active.length > 0,
      dominantZone: dominant,
    });
  }, [zones]);

  return (
    <InfluenceZoneContext.Provider value={{ zones, playerZoneState, playerPosition, addZone, removeZone, updatePlayerZones, getZoneEffect }}>
      {children}
    </InfluenceZoneContext.Provider>
  );
};

export const useInfluenceZones = (): InfluenceZoneContextType => {
  const context = useContext(InfluenceZoneContext);
  if (!context) {
    throw new Error('useInfluenceZones must be used within InfluenceZoneProvider');
  }
  return context;
};
