/**
 * GrenadeSystem.ts
 * Lógica pura para granadasl (sin React)
 */

import type { ZoneType } from '../context/InfluenceZoneContext';
import type { InfluenceZone } from '../context/InfluenceZoneContext';
import * as THREE from 'three';

export interface GrenadeTemplate {
  id: string;
  name: string;
  zoneRadius: number;        // Radio de la zona creada (metros)
  duration: number;          // Duración de la zona (ms)
  zoneType: ZoneType;        // Tipo de efecto
  color: string;             // Color visual
  description: string;
}

export interface GrenadeInstance {
  id: string;
  templateId: string;
  position: THREE.Vector3;
  createdAt: number;         // timestamp
  duration: number;          // ms (cuando creada)
  isActive: boolean;
}

export interface GrenadeZone extends InfluenceZone {
  isTemporary: true;
  grenadeId: string;
  expiresAt: number;
}

/**
 * Plantillas de granadasl predefinidas
 */
export const GRENADE_TEMPLATES: Record<string, GrenadeTemplate> = {
  speed_burst: {
    id: 'speed_burst',
    name: 'Speed Grenade',
    zoneRadius: 3,
    duration: 15000,
    zoneType: 'speed_boost',
    color: '#7FD8BE',
    description: 'Crea zona de velocidad aumentada',
  },

  jump_pulse: {
    id: 'jump_pulse',
    name: 'Jump Grenade',
    zoneRadius: 2.5,
    duration: 10000,
    zoneType: 'jump_boost',
    color: '#FFE066',
    description: 'Crea zona de salto mejorado',
  },

  frost_blast: {
    id: 'frost_blast',
    name: 'Frost Grenade',
    zoneRadius: 4,
    duration: 20000,
    zoneType: 'ice',
    color: '#A8D8EA',
    description: 'Crea zona de hielo/ralentización',
  },

  toxin_cloud: {
    id: 'toxin_cloud',
    name: 'Toxin Grenade',
    zoneRadius: 3.5,
    duration: 12000,
    zoneType: 'damage',
    color: '#E85D75',
    description: 'Crea zona de daño/estrés botánico',
  },
};

/**
 * Crear instancia de granada
 */
export function createGrenade(
  templateId: string,
  position: THREE.Vector3
): GrenadeInstance {
  // Generate simple ID using timestamp + random number
  const id = `grenade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    templateId,
    position: new THREE.Vector3().copy(position),
    createdAt: Date.now(),
    duration: GRENADE_TEMPLATES[templateId]?.duration || 15000,
    isActive: true,
  };
}

/**
 * Convertir granada a zona de influencia
 */
export function grenadeToZone(
  grenade: GrenadeInstance,
  template: GrenadeTemplate
): GrenadeZone {
  return {
    id: `zone_${grenade.id}`,
    grenadeId: grenade.id,
    type: template.zoneType,
    position: grenade.position,
    radius: template.zoneRadius,
    color: template.color,
    intensity: 1,
    description: template.description,
    isTemporary: true,
    expiresAt: grenade.createdAt + grenade.duration,
  };
}

/**
 * Verificar si granada sigue activa
 */
export function isGrenadeActive(grenade: GrenadeInstance): boolean {
  const elapsed = Date.now() - grenade.createdAt;
  return elapsed < grenade.duration;
}

/**
 * Obtener tiempo restante (ms)
 */
export function getGrenadeTimeRemaining(grenade: GrenadeInstance): number {
  const elapsed = Date.now() - grenade.createdAt;
  const remaining = Math.max(0, grenade.duration - elapsed);
  return remaining;
}

/**
 * Obtener porcentaje de duración (0-100)
 */
export function getGrenadeProgress(grenade: GrenadeInstance): number {
  const remaining = getGrenadeTimeRemaining(grenade);
  return ((grenade.duration - remaining) / grenade.duration) * 100;
}

/**
 * Filtrar granadasl activas
 */
export function filterActiveGrenades(grenades: GrenadeInstance[]): GrenadeInstance[] {
  return grenades.filter(g => isGrenadeActive(g));
}

/**
 * Filtrar granadasl expiradas
 */
export function filterExpiredGrenades(grenades: GrenadeInstance[]): GrenadeInstance[] {
  return grenades.filter(g => !isGrenadeActive(g));
}

/**
 * Actualizar estado de granadasl (remover expiradas)
 */
export function updateGrenades(grenades: GrenadeInstance[]): GrenadeInstance[] {
  return filterActiveGrenades(grenades);
}

/**
 * Calcular si posición está dentro de zona grenada
 */
export function isPositionInGrenadeZone(
  position: THREE.Vector3,
  grenade: GrenadeInstance,
  template: GrenadeTemplate
): boolean {
  const distance = position.distanceTo(grenade.position);
  return distance <= template.zoneRadius;
}

/**
 * Obtener variables de efecto (para shader/visual)
 */
export function getGrenadeEffect(
  grenade: GrenadeInstance
): {
  intensity: number;
  pulse: number; // 0-1 para animación de pulso
} {
  const remaining = getGrenadeTimeRemaining(grenade);
  const progress = 1 - remaining / grenade.duration;

  // Intensidad disminuye hacia el final
  const intensity = Math.max(0.3, 1 - progress * 0.7);

  // Pulso oscilante para efecto visual
  const pulse = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;

  return { intensity, pulse };
}
