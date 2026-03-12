import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import {
  GrenadeInstance,
  GrenadeZone,
  GRENADE_TEMPLATES,
  createGrenade,
  grenadeToZone,
  isGrenadeActive,
  getGrenadeProgress,
} from '../systems/GrenadeSystem';
import { useInfluenceZones } from './InfluenceZoneContext';

export interface GrenadeContextType {
  grenades: GrenadeInstance[];
  launchGrenade: (
    type: keyof typeof GRENADE_TEMPLATES,
    position: [number, number, number],
    direction?: [number, number, number]
  ) => { success: boolean; grenadeId: string; zone?: GrenadeZone };
  getActiveGrenades: () => GrenadeInstance[];
  getGrenadeProgress: (grenadeId: string) => number;
  clearExpiredGrenades: () => void;
  getGrenadeCount: (type?: keyof typeof GRENADE_TEMPLATES) => number;
  detonateGrenade: (grenadeId: string) => boolean;
}

const GrenadeContext = createContext<GrenadeContextType | undefined>(undefined);

export const GrenadeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [grenades, setGrenades] = useState<GrenadeInstance[]>([]);
  const { addZone, removeZone } = useInfluenceZones();
  const zoneIdsRef = useRef<Map<string, string>>(new Map()); // grenadeId -> zoneId

  const clearExpiredGrenades = useCallback(() => {
    setGrenades(prev => {
      const active = prev.filter(g => isGrenadeActive(g));

      // Remove zones for expired grenades
      prev.forEach(g => {
        if (!isGrenadeActive(g)) {
          const zoneId = zoneIdsRef.current.get(g.id);
          if (zoneId) {
            removeZone(zoneId);
            zoneIdsRef.current.delete(g.id);
          }
        }
      });

      return active;
    });
  }, [removeZone]);

  // Cleanup expired grenades every 100ms
  React.useEffect(() => {
    const interval = setInterval(clearExpiredGrenades, 100);
    return () => clearInterval(interval);
  }, [clearExpiredGrenades]);

  const launchGrenade = useCallback(
    (
      type: keyof typeof GRENADE_TEMPLATES,
      position: [number, number, number]
    ): { success: boolean; grenadeId: string; zone?: GrenadeZone } => {
      const template = GRENADE_TEMPLATES[type];
      if (!template) {
        return { success: false, grenadeId: '' };
      }

      // Convert position array to THREE.Vector3
      const posVector = new THREE.Vector3(position[0], position[1], position[2]);
      
      // Create grenade with templateId (not type parameter)
      const newGrenade = createGrenade(type, posVector);
      const zone = grenadeToZone(newGrenade, template);

      // Add zone to context
      addZone(zone);

      // Track zone ID for cleanup
      zoneIdsRef.current.set(newGrenade.id, zone.id);

      // Add grenade to state
      setGrenades(prev => [...prev, newGrenade]);

      return {
        success: true,
        grenadeId: newGrenade.id,
        zone,
      };
    },
    [addZone]
  );

  const getActiveGrenades = useCallback((): GrenadeInstance[] => {
    return grenades.filter(g => isGrenadeActive(g));
  }, [grenades]);

  const getProgressFn = useCallback(
    (grenadeId: string): number => {
      const grenade = grenades.find(g => g.id === grenadeId);
      if (!grenade) return 0;
      return getGrenadeProgress(grenade);
    },
    [grenades]
  );

  const getGrenadeCountFn = useCallback(
    (type?: keyof typeof GRENADE_TEMPLATES): number => {
      const active = grenades.filter(g => isGrenadeActive(g));
      if (!type) return active.length;
      return active.filter(g => g.templateId === type).length;
    },
    [grenades]
  );

  const detonateGrenade = useCallback(
    (grenadeId: string): boolean => {
      const grenade = grenades.find(g => g.id === grenadeId);
      if (!grenade) return false;

      // Remove grenade and its zone
      const zoneId = zoneIdsRef.current.get(grenadeId);
      if (zoneId) {
        removeZone(zoneId);
        zoneIdsRef.current.delete(grenadeId);
      }

      setGrenades(prev => prev.filter(g => g.id !== grenadeId));
      return true;
    },
    [grenades, removeZone]
  );

  const value: GrenadeContextType = {
    grenades,
    launchGrenade,
    getActiveGrenades,
    getGrenadeProgress: getProgressFn,
    clearExpiredGrenades,
    getGrenadeCount: getGrenadeCountFn,
    detonateGrenade,
  };

  return (
    <GrenadeContext.Provider value={value}>
      {children}
    </GrenadeContext.Provider>
  );
};

export const useGrenades = (): GrenadeContextType => {
  const context = useContext(GrenadeContext);
  if (!context) {
    throw new Error('useGrenades must be used within GrenadeProvider');
  }
  return context;
};
