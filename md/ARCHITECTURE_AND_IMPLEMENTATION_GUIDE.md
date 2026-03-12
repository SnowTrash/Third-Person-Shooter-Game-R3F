# Análisis Arquitectónico: Third-Person-Shooter Quercus Evolution

**Fecha**: 28 Febrero 2026  
**Propósito**: Guía técnica para modificaciones del proyecto + Integración de nuevas features  
**Audiencia**: Desarrollador fullstack React/Three.js  

---

## 📐 ARQUITECTURA ACTUAL DEL PROYECTO

### **1. Estructura General**

```
demo/src/
│
├── systems/                           ← LÓGICA PURA (sin React)
│   ├── LeafGeometrySystem.ts         [Generación procedural de hojas]
│   ├── QuercusEvolutionSystem.ts     [Progresión de fases 0-4]
│   ├── GeometryMorphSystem.ts        [Transiciones smooth]
│   └── CLAMPDebugSystem.ts           [Utilidades de debug]
│
├── context/                           ← STATE MANAGEMENT GLOBAL
│   ├── InfluenceZoneContext.tsx      [Zonas + detección jugador]
│   ├── LeafMorphHistoryContext.tsx   [Historial de morphing de hojas]
│   ├── PaleobotanyEducationContext.tsx [Progresión educativa]
│   └── PlayerContext.tsx              [Estado del jugador]
│
├── components/                        ← UI / VISUALIZACIÓN
│   ├── CLAMPDebugHUD.tsx             [Panel de debugging]
│   ├── ZoneMiniVisualizerWithHistory.tsx [Mini visualizador]
│   ├── AdaptiveLeafMesh.tsx          [Hoja 3D con shader]
│   ├── ProceduralFlower.tsx          [Flores procedurales]
│   ├── ProceduralTailPlant.tsx       [Plantas]
│   └── ZoneUIFeedback.tsx            [UI de zonas]
│
├── data/                              ← CONTENIDO ESTÁTICO
│   └── paleobotanyDatabase.json      [Narrativa + puzzles]
│
├── Environment.tsx                    ← ESCENA PRINCIPAL
└── App.tsx                            ← ROOT (providers)
```

---

## 🔄 FLUJO DE DATOS ACTUAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GAMEPLAY LOOP (60 FPS)                            │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
        ┌─────────────────────────────────────────┐
        │ Player Physics (Rapier)                  │
        │ - Position updated 60 FPS                │
        └─────────────────────────────────────────┘
                                  ↓
        ┌─────────────────────────────────────────┐
        │ InfluenceZoneContext.updatePlayerZones() │
        │ - Detecta qué zona está el jugador       │
        │ - Actualiza dominantZone                 │
        └─────────────────────────────────────────┘
                                  ↓
        ┌─────────────────────────────────────────┐
        │ PaleobotanyEducationContext              │
        │ - Si en zona → accumulateZoneTime()      │
        │ - Calcula progreso (0-1)                 │
        │ - Intenta avanzar fase                   │
        └─────────────────────────────────────────┘
                                  ↓
        ┌─────────────────────────────────────────┐
        │ LeafMorphHistoryContext                  │
        │ - currentMorph interpolado               │
        │ - Basado en tiempo + puzzles             │
        └─────────────────────────────────────────┘
                                  ↓
        ┌─────────────────────────────────────────┐
        │ AdaptiveLeafMesh                         │
        │ - Renderiza hoja 3D                      │
        │ - Usa currentMorph para geometría        │
        │ - Rotación continua                      │
        └─────────────────────────────────────────┘
                                  ↓
        ┌─────────────────────────────────────────┐
        │ CLAMPDebugHUD (si visible)               │
        │ - Muestra similitud actual vs target     │
        │ - Monitorea todas las propiedades        │
        └─────────────────────────────────────────┘
```

---

## 🗂️ DÓNDE AGREGAR CODIGO (PROCEDIMIENTO)

### **RULE 1: Lógica Pura → `/systems`**
No requiere React hooks. Funciones puras.

```typescript
// demo/src/systems/InventorySystem.ts
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export interface Inventory {
  items: InventoryItem[];
  capacity: number;
}

export function addItem(inventory: Inventory, item: InventoryItem): Inventory {
  // Lógica pura - sin React
  return { ...inventory, items: [...inventory.items, item] };
}
```

### **RULE 2: Estado Global → `/context`**
Requiere Context API + hooks.

```typescript
// demo/src/context/InventoryContext.tsx
export const InventoryProvider: React.FC<{ children }> = ({ children }) => {
  const [inventory, setInventory] = useState<Inventory>(initialState);
  const addItem = (item: InventoryItem) => { /* ... */ };
  
  return (
    <InventoryContext.Provider value={{ inventory, addItem }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
```

### **RULE 3: Visualización → `/components`**
Usa contextos para acceder state.

```typescript
// demo/src/components/InventoryUI.tsx
export const InventoryUI: React.FC = () => {
  const { inventory } = useInventory();
  
  return (
    <div>
      {inventory.items.map(item => (
        <div key={item.id}>{item.name} x{item.quantity}</div>
      ))}
    </div>
  );
};
```

### **RULE 4: Datos Estáticos → `/data`**
JSON o TS const.

```typescript
// demo/src/data/grenadeTemplates.json
{
  "grenades": [
    {
      "id": "influence_grenade_small",
      "zoneRadius": 5,
      "duration": 15,
      "type": "speed_boost"
    }
  ]
}
```

---

## 🎯 REFORMULACIÓN: TU SOLICITUD COMO REQUERIMIENTOS

Tu pregunta original:
> "Necesito conectar debugger con miniviz, ambos sobre misma hoja. Además necesito inventario y 'granada' que cree zonas de influencia pequeñas."

### **REQUERIMIENTO TÉCNICO FORMAL (REQ)**

#### **REQ-1: Sincronización Visual Debug ↔ MiniViz**
**Actual**: Ambos usan `LeafMorphHistoryContext.getCurrentMorph()` pero renderizan por separado  
**Deseado**: Una única "fuente de verdad" para propiedades CLAMP  
**Solución**: Crear `useLeafVisualization()` hook que centraliza datos

#### **REQ-2: Sistema de Inventario**
**Alcance**: Almacenar items, UI de inventario visual, Persistencia  
**Componentes**:
- `InventorySystem.ts` - Lógica
- `InventoryContext.tsx` - State global
- `InventoryUI.tsx` - Visualización

#### **REQ-3: Grenade Launcher Mechanic**
**Funcionalidad**: Lanzar granadasque crean zonas de influencia temporales  
**Interacciones**:
- Se consume 1 grenade del inventario
- Crea zona pequeña en punto de impacto
- Desaparece después X segundos
- Aplica efectos CLAMP mientras activa

#### **Matriz de Dependencias**
```
InventorySystem (lógica pura)
    ↓
InventoryContext (state global)
    ↓
GrenadeComponent (visualización 3D)
    ↓
InfluenceZoneContext (adiciona zona temporal)
    ↓
LeafMorphHistoryContext (aplica morphing)
    ↓
CLAMPDebugHUD (monitorea cambios)
```

---

## 📋 LISTA DE ACCIONES (ORDEN RECOMENDADO)

### **PHASE 1: Sincronización Debug ↔ MiniViz (30 min)**

```
1. [ ] Crear hook centralizado
   Archivo: demo/src/hooks/useLeafVisualization.ts
   Código:
   ```typescript
   export const useLeafVisualization = () => {
     const { getCurrentMorph } = useLeafMorphHistory();
     const { evolutionState } = usePaleobotanyEducation();
     const { dominantZone } = useInfluenceZones().playerZoneState;
     
     return {
       currentLeaf: getCurrentMorph(),
       targetLeaf: getInterpolatedLeafTarget(evolutionState),
       similarity: calculateCLAMPSimilarity(...),
       zone: dominantZone,
     };
   };
   ```

2. [ ] Refactorizar CLAMPDebugHUD
   Cambio: Usar useLeafVisualization() en lugar de llamadas directas

3. [ ] Refactorizar ZoneMiniVisualizerWithHistory
   Cambio: Usar useLeafVisualization() en lugar de llamadas directas

4. [ ] Resultado: Ambos leen de misma fuente
```

### **PHASE 2: Sistema de Inventario (1-2 horas)**

```
5. [ ] Crear InventorySystem.ts
   - Interfaces: Item, Inventory
   - Funciones: addItem, removeItem, useItem, getItemCount

6. [ ] Crear InventoryContext.tsx
   - State: inventory, capacity
   - Acciones: addItem, useItem, dropItem

7. [ ] Crear InventoryUI.tsx
   - Grid visual de items
   - Contador de cantidad
   - Mostrar en esquina HUD

8. [ ] Integrar en App.tsx
   - Envolver con <InventoryProvider></InventoryProvider>
   - Renderizar <InventoryUI />
```

### **PHASE 3: Grenade Mechanic (2-3 horas)**

```
9. [ ] Crear GrenadeSystem.ts
   - Interface: Grenade, GrenadeTemplate
   - Función: createGrenadeZone()

10.[ ] Crear GrenadeContext.tsx
   - State: activeGrenades
   - Action: launchGrenade()

11.[ ] Crear GrenadeProjectile.tsx
   - Malla 3D
   - Física rapier
   - Raycast al lanzar

12.[ ] Conectar con InfluenceZoneContext
   - launchGrenade() → addZone() temporal

13.[ ] UI del launcher
   - Tecla para lanzar (Click mouse o Space)
   - Validar inventario antes

14.[ ] Sistema de duración
   - Timer para remover zona después Xms
   - Visualización de duración (barra o contador)
```

### **PHASE 4: Testing & Polish (1 hora)**

```
15.[ ] Test sincronización Debug ↔ MiniViz
   - Presionan D, T, F
   - Verifican que ambos paneles usan mismos datos

16.[ ] Test Grenade System
   - Lanzar grenade
   - Verificar zona se crea
   - Verificar zona desaparece
   - Verificar inversario decrece

17.[ ] Documentación de cambios
```

---

## 🔍 EXPLICACIÓN TÉCNICA: CÓMO FUNCIONAN LOS ARCHIVOS CLAVE

### **1. LeafGeometrySystem.ts**
**Rol**: Convierte propiedades CLAMP (13 números) → Geometría 3D de hoja  
**Entrada**: `LeafProperties { lobed, teeth, apexEmarginate, ... }`  
**Salida**: `THREE.BufferGeometry`

```typescript
// Ejemplo
const props = { lobed: 0.85, teeth: 0.08, ... };
const geometry = generateLeafGeometry(props);
// Retorna geometría con 64 vértices, lóbulos procedurales, etc
```

**Dónde se llama**:
- `AdaptiveLeafMesh.tsx` - Para renderizar miniViz
- `CLAMPDebugHUD.tsx` - Podría usarse para mostrar hoja target

**Si necesitas modificar**: Cambiar algoritmo de lobes, teeth, apex

---

### **2. LeafMorphHistoryContext.tsx**
**Rol**: Almacena historial de morphing + interpola entre estados  
**Estado**: `morphHistory: { [zoneId]: LeafProperties }`  
**Función clave**: `getCurrentMorph()` retorna hoja actual interpolada

```typescript
// Si jugador visitó 3 zonas:
// morphHistory = {
//   "zone_1": { lobed: 0.1, ... },
//   "zone_2": { lobed: 0.5, ... },
//   "zone_3": { lobed: 0.7, ... }
// }
//
// getCurrentMorph() retorna promedio ponderado
// Resultado: { lobed: 0.43, ... }
```

**Dónde se llama**:
- `AdaptiveLeafMesh.tsx` - obtiene hoja actual
- `CLAMPDebugHUD.tsx` - compara con target
- `PaleobotanyEducationContext.tsx` - monitorea cambios

**Si necesitas modificar**: Cambiar ponderación, agregar histórico completo

---

### **3. InfluenceZoneContext.tsx**
**Rol**: Gestión global de zonas + detección de jugador  
**Estado**:
```typescript
zones: InfluenceZone[]           // Array de todas las zonas
playerZoneState: {
  activeZones: InfluenceZone[],  // Zonas donde está jugador
  isInZone: boolean,
  dominantZone: InfluenceZone    // Zona "principal" actual
}
```

**Funciones**:
- `addZone(zone)` - Crear nueva zona
- `removeZone(zoneId)` - Eliminar zona
- `updatePlayerZones(playerPos)` - Actualizar qué zona es dominante

**Dónde se llama**:
- `Environment.tsx` - Al inicializar, crea zonas del escenario

**Si necesitas modificar**: Aquí iría `addGrenadeZone()` para grenade temporal

---

### **4. PaleobotanyEducationContext.tsx**
**Rol**: Progresión de fases (0→4) + tracking de tiempo  
**Estado**:
```typescript
evolutionState: {
  currentPhase: number,          // 0-4
  progressTowardsNext: number,   // 0-1 (barra visual)
  timeAccumulatedInZone: number, // segundos
  puzzlesCompletedInPhase: number
}
```

**Flujo**:
1. `updateEvolution(deltaTime)` llamado cada frame
2. Si `dominantZone === 'speed_boost'` → suma tiempo
3. Si tiempo > threshold → intenta `attemptPhaseAdvancement()`
4. Si avanza → desbloquea narrativa

**Dónde se llama**:
- `CLAMPDebugHUD.tsx` - Monitorea estado

**Si necesitas modificar**: Cambiar thresholds, agregar multiplicador de velocidad

---

### **5. InfluenceZone vs Grenade Zone**
**Actualmente**: Las 5 zonas de Environment.tsx son globales/estáticas

**Para granadasl**: Necesitas **zonas temporales**

```typescript
// Diferencia:
interface StaticZone extends InfluenceZone {
  // Creada al inicio, nunca desaparece
}

interface GrenadZone extends InfluenceZone {
  createdAt: number,      // timestamp
  duration: number,       // 10000 ms
  isTemporary: true
}

// En InfluenceZoneContext:
const updatePlayerZones = () => {
  // Solo procesar zonas no expiradas
  const activeZones = zones.filter(z => 
    !z.isTemporary || (Date.now() - z.createdAt) < z.duration
  );
  
  // Auto-remover expiradas
  setZones(prev => 
    prev.filter(z => !(z.isTemporary && expired))
  );
};
```

---

## 💾 ARCHIVOS QUE NECESITAS CREAR/MODIFICAR

### **Nuevos Archivos**

```
✨ demo/src/systems/InventorySystem.ts        [200 líneas]
✨ demo/src/context/InventoryContext.tsx       [150 líneas]
✨ demo/src/context/GrenadeContext.tsx         [200 líneas]
✨ demo/src/systems/GrenadeSystem.ts           [150 líneas]
✨ demo/src/components/InventoryUI.tsx         [100 líneas]
✨ demo/src/components/GrenadeProjectile.tsx   [150 líneas]
✨ demo/src/hooks/useLeafVisualization.ts      [50 líneas]
✨ demo/src/data/grenadeTemplates.json         [50 líneas]
```

### **Archivos a Modificar**

```
🔄 demo/src/App.tsx
   - Añadir <InventoryProvider>
   - Añadir <GrenadeProvider>

🔄 demo/src/components/CLAMPDebugHUD.tsx
   - Usar useLeafVisualization()

🔄 demo/src/components/ZoneMiniVisualizerWithHistory.tsx
   - Usar useLeafVisualization()

🔄 demo/src/context/InfluenceZoneContext.tsx
   - Filtrar zonas expiradas
   - Opcionalmente: agregar isTemporary field

🔄 demo/src/Environment.tsx
   - Opcionalmente: visualizar granadasl
```

---

## 🎮 FLUJO DE INTERACCIÓN: GRENADE SYSTEM

```
Usuario presiona 'G' (Grenade)
    ↓
GrenadeProjectile.tsx
  - Inicia en posición de mano del jugador
  - Física Rapier (siguetrayectoria parabólica)
  ↓
Colisiona con objeto/piso
    ↓
GrenadeContext.launchGrenade()
  - Calcula zona de explosión
  - Solicita creación de zona temporal
    ↓
InfluenceZoneContext.addZone({
  isTemporary: true,
  duration: 15000,
  radius: 3,
  type: 'damage' (o personalizado)
})
    ↓
Zone activa 15 segundos
  - LeafMorphHistoryContext detecta cambios
  - CLAMP properties morphean
  - CLAMPDebugHUD monitorea
    ↓
Auto-expire después 15s
  - removeZone() automático
  - Hoja vuelve a estado anterior
```

---

## 🚀 ORDEN RECOMENDADO (TIMELINE)

| Fase | Tiempo | Tareas |
|------|--------|--------|
| 1 | 30 min | Hook centralizado + refactor |
| 2 | 1-2h | InventorySystem + Context + UI |
| 3 | 2-3h | GrenadeSystem + Projectile + Integration |
| 4 | 1h | Testing + Documentation |
| **TOTAL** | **4.5-7h** | **Sistema completo funcional** |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

```markdown
## ANTES DE EMPEZAR
- [ ] Entender flujo actual (este documento)
- [ ] Tener servidor corriendo (pnpm run dev)
- [ ] Leer LeafGeometrySystem.ts (entender CLAMP)
- [ ] Leer InfluenceZoneContext.tsx (entender zonas)

## PHASE 1: Hook Centralizado
- [ ] Crear useLeafVisualization.ts
- [ ] Refactor CLAMPDebugHUD.tsx
- [ ] Refactor ZoneMiniVisualizer.tsx
- [ ] Test: Ambos paneles idénticos

## PHASE 2: Inventario
- [ ] Crear InventorySystem.ts
- [ ] Crear InventoryContext.tsx
- [ ] Crear InventoryUI.tsx
- [ ] Integrar en App.tsx
- [ ] Test: Agregar/remover items

## PHASE 3: Grenades
- [ ] Crear GrenadeSystem.ts
- [ ] Crear GrenadeContext.tsx
- [ ] Crear GrenadeProjectile.tsx
- [ ] Integrar con InfluenceZoneContext
- [ ] Crear GrenadeUI.tsx
- [ ] Test: Lanzar, crear zona, expirar

## PHASE 4: Polish
- [ ] Sin errores TypeScript
- [ ] Sync perfecto Debug ↔ MiniViz
- [ ] Inventario persiste (opcional)
- [ ] Documentación actualizada

## TESTING FINAL
- [ ] Abrir Debug (D)
- [ ] Lanzar Grenade (G)
- [ ] Ver zona temporal creada
- [ ] Ver CLAMP morphing
- [ ] Ver zona desaparecer después 15s
```

---

## 📞 REFERENCIAS RÁPIDAS

Si necesitas cambiar...

| Qué | Dónde | Línea Aprox |
|-----|-------|-------------|
| Duración grenade | `GrenadeSystem.ts` | ~50 |
| Radio grenade | `grenadeTemplates.json` | ~10 |
| Tecla para lanzar | `GrenadeUI.tsx` | TBD |
| Radius zona stats | `InfluenceZoneContext.tsx` | ~35 |
| CLAMP similarities | `QuercusEvolutionSystem.ts` | ~300 |
| Visualización hoja | `AdaptiveLeafMesh.tsx` | ~50 |

