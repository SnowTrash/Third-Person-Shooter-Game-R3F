# 🚀 QUICK START GUIDE

## Para Usuarios que REPORTAN CRASHES

### ⚡ Solución Inmediata (30 segundos)

Abre `demo/src/main.tsx` y agrega ANTES del ReactDOM.createRoot():

```typescript
import { PerformanceManager } from './systems/PerformanceConfig';

// ← AGREGAR ESTA LINEA
PerformanceManager.setLevel('LOW');  // Para laptops viejos

// O si tienes GPU potente:
// PerformanceManager.setLevel('HIGH');
```

**Resultado esperado:** El juego ya no se cuelga.

### ✅ Verificar que funciona

1. `pnpm run dev`
2. Entrar en cualquier zona
3. Abrir Console (F12)
4. Escribir: `await import('./systems/PerformanceConfig').then(m => console.log(m.PerformanceManager.getConfig()))`
5. Verificar que `leafSegments: 16` (en LOW mode)

---

## Para Developers que QUIEREN EDITAR

### 1. Agregar Nueva Zona (5 minutos)

**Paso 1:** `demo/src/context/InfluenceZoneContext.tsx`
```typescript
// Línea ~15
export type ZoneType = 'ice' | 'jump_boost' | 'speed_boost' | 'slow' | 'damage' | 'FOREST';
                                                                                      // ↑ Agregar
```

**Paso 2:** `demo/src/systems/LeafGeometrySystem.ts`
```typescript
// Función getLeafPropertiesFromZone(), agregar antes del return:
'FOREST': {
  width: 0.7,
  length: 1.2,
  pointiness: 0.4,
  surface: 0.4,
  thickness: 0.12,
  lobed: 0.4,
  teeth: 0.3,
  teethRegularity: 0.6,
  teethCloseness: 0.5,
  teethRounded: 0.6,
  teethAcute: 0.4,
  teethCompound: 0.2,
  apexEmarginate: 0.1,
},
```

**Paso 3:** `demo/src/Environment.tsx`
```typescript
// Línea ~17, agregar en zonePlantMap:
const zonePlantMap = {
  // ... existing
  'FOREST': { plant: 'flower', color: '#2d5016' },  // Color verde oscuro
};
```

**Paso 4:** En mismo archivo, agregar zona en array `zones`:
```typescript
// Dentro de const zones = [...]
{
  id: 'forest-zone-1',
  type: 'FOREST',
  position: [20, 1, 0],  // Tu ubicación deseada
  radius: 5,
  color: '#2d5016',
  description: 'Bosque tropical'
}
```

**¡LISTO!** La nueva zona está funcionando.

### 2. Cambiar Aspecto de Plantas

**Opción A:** Cambiar CLAMP properties (recomendado)
```typescript
// En LeafGeometrySystem.ts, función getLeafPropertiesFromZone()
'speed_boost': {
  width: 0.9,      // ← Más ancho
  lobed: 0.8,      // ← Muy lobulado
  teeth: 0.6,      // ← Con dientes
  // ...
}
```

**Opción B:** Cambiar exageración visual (en AdaptiveFlowerPlant.tsx)
```typescript
const exaggeratedProps: LeafProperties = {
  ...leafProps,
  lobed: Math.min(1, leafProps.lobed * 5),      // ← Aún más exagerado
  teeth: Math.min(1, leafProps.teeth * 4),
  teethCloseness: Math.min(1, leafProps.teethCloseness * 3),
};
```

### 3. Ajustar Performance

En `PerformanceConfig.ts`, editar el objeto `CONFIG`:

```typescript
const CONFIG: Record<PerformanceLevel, PerformanceSettings> = {
  LOW: {
    leafSegments: 12,              // ← Menos detalles (más rápido)
    flowerPetals: 3,
    maxPlantsPerZone: 1,           // ← Menos plantas
    enableSpores: false,           // ← Sin partículas
    //...
  },
```

---

## Comandos Útiles

### Compilar y ejecutar
```bash
pnpm run dev
```

### Check de errores TypeScript
```bash
pnpm run build
```

### Limpiar cache
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Estructura de Carpetas (Simplificada)

```
demo/src/
├── components/          ← Renderizado (React + Three.js)
│   ├── AdaptiveLeafMesh.tsx         (Mini hoja en esquina)
│   ├── AdaptiveFlowerPlant.tsx      (Plantas adaptativas)
│   ├── CLAMPDebugHUD.tsx            (Panel debug)
│   └── ZoneMiniVisualizerWithHistory.tsx
│
├── context/             ← Estado Global (React Context)
│   ├── InfluenceZoneContext.tsx     (Zonas detectadas)
│   ├── LeafMorphHistoryContext.tsx  (Cambios acumulados)
│   └── PaleobotanyEducationContext.tsx (Progreso)
│
├── systems/             ← Lógica Core (Sin React)
│   ├── LeafGeometrySystem.ts        ⭐ EDITAR AQUÍ
│   ├── PerformanceConfig.ts         ⭐ Performance
│   └── GeometryCache.ts             (Caching automático)
│
├── hooks/               ← Derived data + Memoization
│   └── useLeafVisualization.ts      (Datos para UI)
│
└── Environment.tsx      ← Escena 3D + zonas           ⭐ EDITAR AQUÍ
```

**⭐ = Archivos que probablemente edites**

---

## Debug Rápido

### Tecla `H` = Panel Debug
Muestra:
- Zona actual
- Fase actual
- Similarity score
- 13 propiedades CLAMP

### Teclas útiles
- `T` = Agregar 10 segundos
- `P` = Completar puzzle
- `F` = Avanzar fase

---

## Problemas Comunes & Soluciones

| Problema | Solución |
|----------|----------|
| **"El juego se cuelga"** | `PerformanceManager.setLevel('LOW')` |
| **"Las plantas no cambian"** | Verificar que `getLeafPropertiesFromZone()` tenga la zona |
| **"No veo el debug HUD"** | Presionar `H` |
| **"Demasiadas plantas"** | Bajar `maxPlantsPerZone` en PerformanceConfig |
| **"Quiero más detalles"** | Cambiar a `HIGH` mode |

---

## Video Tutorial (Recomendado)

Pendiente de crear - Sigue pasos de "Agregar Nueva Zona" arriba.

