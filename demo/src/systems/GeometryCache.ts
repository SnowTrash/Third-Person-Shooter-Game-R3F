import * as THREE from 'three';
import { PerformanceManager } from './PerformanceConfig';
import type { LeafProperties } from './LeafGeometrySystem';

/**
 * GeometryCache.ts
 * 
 * Sistema profesional de caching y pooling de geometrías.
 * Evita regeneración costosa y memory leaks.
 * 
 * Arquitectura:
 * - GeometryPool: Cache de geometrías generadas
 * - Clave: hash de LeafProperties
 * - Beneficio: Reutiliza geometría si los valores son iguales
 */

interface CacheEntry {
  geometry: THREE.BufferGeometry;
  hits: number;
  lastAccess: number;
}

class GeometryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxSize: number = 32) {
    this.maxSize = maxSize;
  }

  /**
   * Generar clave hash de propiedades de hoja
   * Permite reutilizar geometría incluso si objetos diferentes
   */
  private getKey(props: LeafProperties): string {
    // Round valores a 2 decimales para normalizar
    const rounded = {
      width: Math.round(props.width * 100) / 100,
      length: Math.round(props.length * 100) / 100,
      pointiness: Math.round(props.pointiness * 100) / 100,
      surface: Math.round(props.surface * 100) / 100,
      thickness: Math.round(props.thickness * 100) / 100,
      lobed: Math.round(props.lobed * 100) / 100,
      teeth: Math.round(props.teeth * 100) / 100,
      teethRegularity: Math.round(props.teethRegularity * 100) / 100,
      teethCloseness: Math.round(props.teethCloseness * 100) / 100,
      teethRounded: Math.round(props.teethRounded * 100) / 100,
      teethAcute: Math.round(props.teethAcute * 100) / 100,
      teethCompound: Math.round(props.teethCompound * 100) / 100,
      apexEmarginate: Math.round(props.apexEmarginate * 100) / 100,
    };

    return JSON.stringify(rounded);
  }

  /**
   * Obtener geometría (del cache o generar nueva)
   */
  get(props: LeafProperties, generator: (props: LeafProperties) => THREE.BufferGeometry): THREE.BufferGeometry {
    const key = this.getKey(props);
    const now = Date.now();

    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      entry.hits++;
      entry.lastAccess = now;
      this.hits++;
      return entry.geometry;
    }

    // Generar nueva geometría
    const geometry = generator(props);
    this.misses++;

    // Limpiar si alcanzamos máximo
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      geometry,
      hits: 1,
      lastAccess: now,
    });

    return geometry;
  }

  /**
   * Eliminar entrada menos usada (LRU)
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime: number = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < lruTime) {
        lruTime = entry.lastAccess;
        lruKey = key;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey)!;
      entry.geometry.dispose();
      this.cache.delete(lruKey);
    }
  }

  /**
   * Limpiar todo el cache
   */
  clear(): void {
    for (const entry of this.cache.values()) {
      entry.geometry.dispose();
    }
    this.cache.clear();
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return {
      size: this.cache.size,
      capacity: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0,
    };
  }

  /**
   * Loguear estadísticas
   */
  logStats(): void {
    const stats = this.getStats();
    console.log('[GeometryCache Stats]', {
      cached: `${stats.size}/${stats.capacity}`,
      hitRate: `${(stats.hitRate * 100).toFixed(1)}%`,
      total: `${stats.hits + stats.misses}`,
    });
  }

  /**
   * Cambiar tamaño máximo
   */
  setMaxSize(size: number): void {
    this.maxSize = size;
    while (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }
}

/**
 * Material cache - evita compilar shader innecesariamente
 */
class MaterialCache {
  private cache: Map<string, THREE.Material> = new Map();

  /**
   * Obtener o crear material
   */
  get(key: string, creator: () => THREE.Material): THREE.Material {
    if (!this.cache.has(key)) {
      this.cache.set(key, creator());
    }
    return this.cache.get(key)!;
  }

  clear(): void {
    for (const material of this.cache.values()) {
      material.dispose();
    }
    this.cache.clear();
  }
}

// Singleton instances
export const geometryCache = new GeometryCache(
  PerformanceManager.getConfig().geometryCacheSize
);

export const materialCache = new MaterialCache();

/**
 * Hook para monitoreo de recursos
 */
export function useGeometryCache() {
  return {
    getGeometry: (
      props: LeafProperties,
      generator: (props: LeafProperties) => THREE.BufferGeometry
    ) => geometryCache.get(props, generator),
    
    stats: () => geometryCache.getStats(),
    
    log: () => geometryCache.logStats(),
  };
}

export type { CacheEntry };
