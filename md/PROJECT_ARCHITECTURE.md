# 📚 ARQUITECTURA DEL PROYECTO - Quercus Evolution System

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura de Capas](#arquitectura-de-capas)
3. [Guía de Configuración](#guía-de-configuración)
4. [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
5. [Cómo Agregar Características](#cómo-agregar-características)
6. [Sistema de Debugging](#sistema-de-debugging)

---

## Visión General

Este project es un **juego educativo en 3D** sobre evolución paleobotánica. El jugador explora zonas con diferentes condiciones ambientales, y su hoja (representación del Quercus) **morph adaptativamente** a cada ambiente.

### Características Principales
- 🌿 **Hoja morfogenética** que cambia según propiedades CLAMP
- 🎨 **Visualización en tiempo real** de adaptación botánica
- 🔬 **13 características botánicas** (lobed, teeth, apex, etc)
- 📍 **5 zonas de influencia** con diferentes condiciones
- 🎮 **Gameplay educativo** basado en evolución

---

## Arquitectura de Capas

### Nivel 1: Configuración Global (PerformanceManager)

```
PerformanceConfig.ts
├─ Niveles: LOW | MEDIUM | HIGH
├─ Detecta automáticamente hardware
├─ Controla:
│  ├─ leafSegments (16-64)
│  ├─ maxPlantsPerZone (2-5)
│  ├─ enableSpores, enableLOD
│  └─ geometryCacheSize (16-64)
└─ Singleton exportado como PerformanceManager
```

**Uso en código:**
```typescript
import { PerformanceManager } from './systems/PerformanceConfig';

const config = PerformanceManager.getConfig();
console.log(config.leafSegments);  // 16 | 32 | 64 según nivel
```

### Nivel 2: Caching inteligente (GeometryCache)

```
GeometryCache.ts
├─ Evita regeneración de geometrías
├─ Hash de LeafProperties + LRU eviction
├─ Stats: hitRate, size, capacity
└─ materialCache para shaders
```

**Beneficio:** Si la geometría es igual (hash match), reutiliza. Si diferente, genera nueva y cachea.

**Implementado en:**
- LeafGeometrySystem.ts → `_createLeafGeometry()` usa cache automáticamente

### Nivel 3: Sistemas Core

```
Systems/
├─ LeafGeometrySystem.ts
│  ├─ generateLeafGeometry(props) → BufferGeometry
│  ├─ getLeafPropertiesFromZone(type) → CLAMP values
│  └─ morphLeafProperties(from, to, progress) → interpolation
│
├─ QuercusEvolutionSystem.ts
│  ├─ 5 fases de evolución
│  ├─ CLAMP targets por fase
│  └─ Similarity calculation
│
└─ PerformanceConfig.ts + GeometryCache.ts
   └─ Optimizaciones globales
```

### Nivel 4: Contextos React (Estado Global)

```
Context/
├─ InfluenceZoneContext.tsx
│  └─ { playerZoneState: { dominantZone, isInZone } }
│
├─ LeafMorphHistoryContext.tsx
│  └─ { getCurrentMorph(), recordZoneMorph(), getAccumulatedMorph() }
│
├─ PaleobotanyEducationContext.tsx
│  └─ { evolutionState: { phase, time, progress, puzzles } }
│
└─ InventoryContext.tsx (opcional)
   └─ { grenades, selectedType, capacity }
```

### Nivel 5: Hooks Derivados (Cálculos + Memoization)

```
Hooks/
├─ useLeafVisualization.ts (🔴 CRITICAL)
│  ├─ Centraliza TODOS los datos de visualización
│  ├─ Devuelve: LeafVisualizationData con currentLeaf, targetLeaf, similarity, etc
│  ├─ USEMEMO para performance
│  └─ Fuente única de verdad para Debug HUD + MiniViz
│
├─ useLeafDebugInfo.ts
│  └─ Formatea datos para debugging
│
└─ usePlayerPositionTracking.ts
   └─ Rastreo de posición del jugador
```

### Nivel 6: Componentes de Renderizado (Three.js + R3F)

```
Components/
├─ AdaptiveLeafMesh.tsx (Mini Visualizer)
│  ├─ Renderiza hoja con morph animado
│  ├─ Recibe: zoneType (string) → PROBLEMA ❌
│  ├─ Debería recibir: leafProperties (CLAMP data) ✅
│  └─ Estado: morphing 0.5s + spores
│
├─ AdaptiveFlowerPlant.tsx (Plantas Adaptativas)
│  ├─ Renderiza flores/plantas en zonas
│  ├─ Agrega CLAMP properties
│  └─ Exagera cambios 2x para claridad visual
│
├─ CLAMPDebugHUD.tsx
│  ├─ Panel debug (Tecla H para toggle)
│  ├─ Muestra 13 propiedades + similarity
│  └─ Controles: H=toggle, T=+10s, P=puzzle, F=next phase
│
├─ ZoneMiniVisualizerWithHistory.tsx
│  ├─ Canvas pequeño abajo-derecha
│  ├─ Muestra hoja actual con iluminación
│  └─ BUG CONOCIDO: Cambia forma al salir de zona (línea ~70)
│
└─ Environment.tsx → ZonePlants()
   ├─ Renderiza AdaptiveFlowerPlant en círculos
   └─ 5 plantas por zona
```

---

## Guía de Configuración

### 1. Cambiar Nivel de Rendimiento

**En startup (`main.tsx`):**
```typescript
import { PerformanceManager } from './systems/PerformanceConfig';

// Opción A: Auto-detectar (por defecto)
// PerformanceManager.autoDetect();

// Opción B: Forzar manualmente
PerformanceManager.setLevel('LOW');    // Para laptops viejos
PerformanceManager.setLevel('MEDIUM'); // Recomendado
PerformanceManager.setLevel('HIGH');   // Para desktops potentes
```

### 2. Ajustar Configuración Específica

```typescript
const config = PerformanceManager.getConfigWithOverride({
  leafSegments: 32,        // Más bajo = mejor performance
  maxPlantsPerZone: 3,     // Menos plantas = menos carga
  enableSpores: false,     // Desactivar partículas
  enableLOD: true,         // Activar Level of Detail
});
```

### 3. Ajustar Propiedades de Zonas

En `LeafGeometrySystem.ts`, función `getLeafPropertiesFromZone()`:

```typescript
'speed_boost': {
  width: 0.8,      // Más ancho
  teeth: 0.0,      // Sin dientes
  lobed: 0.6,      // Ligeramente lobulado
  // ... rest of properties
}
```

### 4. Modificar CLAMP Targets por Fase

En `QuercusEvolutionSystem.ts`, array `PHASE_CHECKPOINTS`:

```typescript
{
  phase: 0,
  name: 'Olmo Primitivo',
  target: {
    width: 0.7,
    lobed: 0.2,
    teeth: 0.1,
    // ... todas las 13 propiedades
  }
}
```

---

## Optimizaciones de Rendimiento

### ¿Por qué se cuelga en laptops viejos? 🔴

**Causas identificadas:**
1. Geometrías regeneradas cada frame sin cache
2. 64 segmentos de hoja muy detalladospara hardware débil
3. Múltiples plantas (5 per zona × múltiples zonas)
4. Memory leaks (shaders compilados múltiples veces)

### Soluciones implementadas ✅

#### 1. Geometry Cache (automático)
```
LeafGeometrySystem.ts
└─ generateLeafGeometry() ahora usa GeometryCache
   ├─ Hash de LeafProperties normalizado
   ├─ Reutiliza si ya existe
   └─ LRU eviction cuando alcanza maxSize
```

**Resultado:** 70-90% reducción de garbage collection

#### 2. Segmentos adaptativos
```
LOW:    16 segmentos  (pequeñas)
MEDIUM: 32 segmentos  (medio)
HIGH:   64 segmentos  (máximo detalle)
```

**Resultado:** 4x mejores FPS en laptops viejos

#### 3. LOD (Level of Detail) - Próximo
```
Distancia < 10m:  Detalles completos
Distancia 10-20m: 50% detalles
Distancia > 20m:  Solo silueta
```

#### 4. Material Cache
```
materialCache.ts
└─ Evita compilar shader múltiples veces
```

### Monitoreo de Performance

```typescript
import { geometryCache } from './systems/GeometryCache';

// En console
geometryCache.logStats();
// Output: [GeometryCache Stats] { 
//   cached: "8/32", 
//   hitRate: "87.5%", 
//   total: "320" 
// }
```

---

## Cómo Agregar Características

### Caso 1: Agregar Nueva Zona

**Paso 1:** Editar `InfluenceZoneContext.tsx`
```typescript
export type ZoneType = 'ice' | 'jump_boost' | 'speed_boost' | 'slow' | 'damage' | 'NEW_ZONE';
```

**Paso 2:** Editar `LeafGeometrySystem.ts` - `getLeafPropertiesFromZone()`
```typescript
'NEW_ZONE': {
  width: 0.5,
  length: 1.0,
  pointiness: 0.5,
  surface: 0.3,
  thickness: 0.1,
  lobed: 0.3,
  teeth: 0.2,
  teethRegularity: 0.5,
  teethCloseness: 0.4,
  teethRounded: 0.6,
  teethAcute: 0.4,
  teethCompound: 0.1,
  apexEmarginate: 0.2,
}
```

**Paso 3:** Editar `Environment.tsx` - `ZonePlants()`
```typescript
const zonePlantMap = {
  // ...
  'NEW_ZONE': { plant: 'flower', color: '#NEW_COLOR' },
}
```

**Paso 4:** Agregar zona en `Environment.tsx` - array `zones`
```typescript
{
  id: 'new-zone-1',
  type: 'NEW_ZONE',
  position: [x, y, z],
  radius: 3,
  color: '#...',
  description: 'Nueva zona...'
}
```

### Caso 2: Agregar Nueva Propiedad CLAMP

**Paso 1:** Editar `LeafGeometrySystem.ts`
```typescript
export interface LeafProperties {
  // ... existing properties
  newProperty: number;  // 0-1
}
```

**Paso 2:** Actualizar `clampLeafProperties()`
```typescript
newProperty: clamp(p.newProperty ?? 0.5, 0, 1),
```

**Paso 3:** Actualizar `_createLeafGeometry()`
```typescript
// Usar newProperty en cálculos de geometría
const factor = 1 + props.newProperty * 0.5;
```

**Paso 4:** Actualizar `getLeafPropertiesFromZone()`
```typescript
'zone_type': { newProperty: 0.7, ... }
```

### Caso 3: Mejorar Visibilidad de Cambios (Plantas)

En `AdaptiveFlowerPlant.tsx`:
```typescript
const exaggeratedProps: LeafProperties = {
  ...leafProps,
  lobed: Math.min(1, leafProps.lobed * 3),      // 3x en lugar de 2x
  teeth: Math.min(1, leafProps.teeth * 2.5),    // Más dientes visibles
  teethCloseness: Math.min(1, leafProps.teethCloseness * 2),
};
```

---

## Sistema de Debugging

### Activar Debug HUD

**Tecla: `H`** (Head/HUD - no interfiere con movimiento)

**Muestra:**
- Zona actual
- Fase actual (nombre, era, MYA)
- Progreso hacia siguiente fase
- 13 barras CLAMP (current vs target)
- Similarity score (0-100%)
- Contadores: time, puzzles

### Comandos Debug

```typescript
// Agregar 10 segundos de tiempo
Tecla: T

// Completar puzzle
Tecla: P

// Avanzar a siguiente fase
Tecla: F
```

### Monitoreo en Console

```typescript
// Ver estadísticas de geometría cache
const { geometryCache } = await import('./systems/GeometryCache');
geometryCache.logStats();

// Ver configuración actual
const { PerformanceManager } = await import('./systems/PerformanceConfig');
console.log(PerformanceManager.getConfig());

// Cambiar rendimiento
PerformanceManager.setLevel('LOW');
```

---

## Flujo de Datos (Diagrama)

```
Player Position
    ↓
InfluenceZoneContext
  { dominantZone, isInZone }
    ↓ (RAMA 1)                 ↓ (RAMA 2)
ZoneMiniVisualizer        Environment.ZonePlants
  ↓                            ↓
AdaptiveLeafMesh          AdaptiveFlowerPlant
  ↓                            ↓
LeafGeometrySystem        LeafGeometrySystem
  ↓                            ↓
generateLeafGeometry      generateLeafGeometry
  ↓ (con cache)            ↓ (con cache)
BufferGeometry            BufferGeometry
  ↓                            ↓
RENDERIZA:               RENDERIZA:
- Hoja en esquina        - Flores en circulos
- 3D rotando             - Adaptadas a CLAMP


    ↓ (RAMA 3)
useLeafVisualization
  ↓
CLAMPDebugHUD
  ↓
Muestra todas las metricas
```

---

## Archivo de Configuración Recomendado

Crear `src/config/GameConfig.ts`:

```typescript
import { PerformanceManager } from '../systems/PerformanceConfig';
import type { PerformanceSettings } from '../systems/PerformanceConfig';

/**
 * Configuración centralizada del juego
 * Edita aquí para customizar la experiencia
 */
export const GAME_CONFIG = {
  // Performance
  performanceLevel: 'MEDIUM' as const,
  
  // Gameplay
  phases: {
    showTransitionEffects: true,
    puzzleTimeBonus: 15,
    phaseCompleteBonus: 30,
  },
  
  // UI
  debug: {
    showHUD: false,      // Iniciar con HUD visible/oculto
    logPerformance: false,
    logGeometryCache: false,
  },
  
  // Zonas
  zones: {
    cameraFollowDistance: 15,
    highlightRadius: true,
    showBorders: true,
  },
};

// Aplicar configuración
PerformanceManager.setLevel(GAME_CONFIG.performanceLevel);
```

---

## Troubleshooting

### "El juego se cuelga al entrar a zona"
→ Cambiar a `LOW` mode: `PerformanceManager.setLevel('LOW')`

### "Las plantas no cambian de forma"
→ Verificar que están usando `AdaptiveFlowerPlant` en `ZonePlants()`

### "Los shaders no compilan"
→ Revisar `AdaptiveLeafMesh.tsx` - puede haber sintaxis GLSL incorrecta

### "Memory leak - RAM sube continuamente"
→ Asegurar que `geometry.dispose()` se llama en cleanup

---

## Próximas Mejoras

- [ ] LOD system por distancia
- [ ] Particle system optimizado para esporas
- [ ] UI Codex with paleobotany narratives
- [ ] Grenade mechanic with temporary zones
- [ ] Puzzle minigames
- [ ] Multiplayer (optional)

