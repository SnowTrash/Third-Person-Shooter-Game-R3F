# 📁 Quercus Evolution System - Estructura de Archivos

## 📦 Lo que fue Creado

```
/workspaces/Third-Person-Shooter-Game-R3F/
│
├── 📄 QUERCUS_EVOLUTION_SPECIFICATION.md         ← Requerimientos formales
├── 📄 QUERCUS_IMPLEMENTATION_v0.1.md             ← Reporte técnico de integración
├── 📄 QUERCUS_DEBUG_QUICKSTART.md                ← Guía rápida (¡EMPIEZA AQUÍ!)
├── 📄 QUERCUS_INTERDISCIPLINARY_ANALYSIS.md     ← Análisis conceptual
├── 📄 CLAMP_BOTANICAL_SCORING.md                ← Guía botánica (ya existía)
├── 📄 CLAMP_TECHNICAL_REFERENCE.md              ← Referencia técnica (ya existía)
│
└── demo/src/
    │
    ├── 🆕 systems/
    │   └── QuercusEvolutionSystem.ts             [373 líneas]
    │       ├─ EvolutionState interface
    │       ├─ PHASE_CHECKPOINTS (5 fases)
    │       ├─ Funciones de progresión
    │       └─ Funciones de debugging
    │
    ├── 🆕 context/
    │   └── PaleobotanyEducationContext.tsx       [140 líneas]
    │       ├─ usePaleobotanyEducation() hook
    │       ├─ State management de evolución
    │       └─ Integración con InfluenceZones
    │
    ├── 🔄 components/
    │   └── CLAMPDebugHUD.tsx                     [Reescrito - 290 líneas]
    │       ├─ Panel de fase actual
    │       ├─ Barra de progreso
    │       ├─ 13 propiedades CLAMP visuales
    │       ├─ CLAMP Similarity score
    │       └─ Controles de debug (D/T/P/F)
    │
    ├── 🆕 data/
    │   └── paleobotanyDatabase.json              [250+ líneas]
    │       ├─ 5 narrativas educativas
    │       ├─ 3 definiciones de puzzles
    │       └─ Environmental mapping
    │
    └── App.tsx                                   [Modificado]
        └─ Añadido: PaleobotanyEducationProvider
        └─ Añadido: CLAMPDebugHUD component
```

---

## 🎯 5 Componentes Principales

### 1️⃣ QuercusEvolutionSystem.ts
**Rol**: Lógica de progresión
- Gestiona 5 fases (0-4)
- Define CLAMP targets por fase
- Calcula progreso (0-1)
- Interpola entre fases
- Calcula similitud con Quercus

**Uso**:
```typescript
import { 
  accumulateZoneTime, 
  completePuzzle,
  getInterpolatedLeafTarget,
  calculateCLAMPSimilarity 
} from '@/systems/QuercusEvolutionSystem'
```

---

### 2️⃣ PaleobotanyEducationContext.tsx
**Rol**: State management global
- Monitorea si jugador está en zona
- Acumula tiempo automáticamente
- Maneja state de evolución
- Desbloquea narrativa

**Uso**:
```typescript
const { 
  evolutionState,      // phase, time, progress
  updateEvolution,     // llamado cada frame
  completePuzzleAction // para puzzles
} = usePaleobotanyEducation()
```

---

### 3️⃣ CLAMPDebugHUD.tsx
**Rol**: Visualización de debugging
- HUD interactivo (Press D)
- Muestra 13 propiedades
- Similarity score
- Controles (T/P/F)
- Feedback visual

**Keyboard**:
- `D`: Toggle HUD
- `T`: +10 segundos
- `P`: Completar puzzle
- `F`: Siguiente fase

---

### 4️⃣ paleobotanyDatabase.json
**Rol**: Contenido educativo
- 5 arqueivos narrativos (0-4)
- 3 tipos de puzzles
- Environmental context

**Estructura**:
```json
{
  "paleobotanyEntries": [...],
  "puzzleDefinitions": [...],
  "environmentalConditionsMapping": {...}
}
```

---

### 5️⃣ App.tsx (Modificado)
**Rol**: Integración
- Envuelve con PaleobotanyEducationProvider
- Renderiza CLAMPDebugHUD
- Mantiene provider hierarchy

**Árbol**:
```tsx
<InfluenceZoneProvider>
  <LeafMorphHistoryProvider>
    <PaleobotanyEducationProvider>  ← NUEVA
      <PlayerProvider>
        <CLAMPDebugHUD />             ← NUEVA
        <ZoneUIFeedback />
        <ZoneMiniVisualizer />
      </PlayerProvider>
    </PaleobotanyEducationProvider>
  </LeafMorphHistoryProvider>
</InfluenceZoneProvider>
```

---

## ⚡ Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│ Gameplay Loop (60 FPS)                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
                Player en zona
                        ↓
    ┌───────────────────────────────────────┐
    │ PaleobotanyEducationContext            │
    │ .updateEvolution(deltaTime)            │
    └───────────────────────────────────────┘
                        ↓
    ┌───────────────────────────────────────┐
    │ QuercusEvolutionSystem                 │
    │ accumulateZoneTime()                   │
    │ attemptPhaseAdvancement()              │
    │ getInterpolatedLeafTarget()            │
    └───────────────────────────────────────┘
                        ↓
    ┌───────────────────────────────────────┐
    │ CLAMPDebugHUD                         │
    │ Renderiza state actual                 │
    │ Muestra similarity vs target           │
    └───────────────────────────────────────┘
                        ↓
    ┌───────────────────────────────────────┐
    │ LeafMorphHistory / AdaptiveLeafMesh   │
    │ Hoja visualmente morphea               │
    └───────────────────────────────────────┘
```

---

## 📊 Estado de Implementación

### ✅ COMPLETADO (Phase 0)

- [x] QuercusEvolutionSystem.ts - Lógica 100%
- [x] PaleobotanyEducationContext.tsx - State 100%
- [x] CLAMPDebugHUD.tsx - UI Debug 100%
- [x] paleobotanyDatabase.json - Data 100%
- [x] App.tsx integration - Providers 100%
- [x] TypeScript - Sin errores ✓
- [x] Documentación completa

### 🟡 PENDIENTE (Phase 1-2)

- [ ] MiniPuzzleUI.tsx - Interfaz de puzzles
- [ ] QuercusTargetLeafMesh.tsx - Visualizador hoja target
- [ ] PaleobotanyCodexUI.tsx - Lector de narrativa
- [ ] YUKA integration - Enemigos
- [ ] Boss encounter - Final Quercus
- [ ] Sound design
- [ ] Serialization / Save system

---

## 🚀 Cómo Empezar (Orden de Prioridad)

### AHORA (1 minuto)
1. Lee `QUERCUS_DEBUG_QUICKSTART.md`
2. Inicia server: `pnpm run dev`
3. Presiona `D` en juego
4. Observa HUD

### HOY (1 hora)
1. Presiona `T` varias veces → ve propiedad morphear
2. Mueve a zona speed_boost → ve tiempo acumular
3. Espera fase avance automáticamente
4. Lee `QUERCUS_IMPLEMENTATION_v0.1.md` para entender arquitectura

### ESTA SEMANA (4-8 horas)
1. Implementa MiniPuzzleUI.tsx
2. Conecta `completePuzzleAction()` a botones
3. Crea QuercusTargetLeafMesh.tsx para visualizar meta
4. Testea sistema de progresión completo

---

## 🧪 Testing Checklist

```markdown
## Pre-Testing Setup
- [ ] pnpm run dev ejecuta sin errores
- [ ] Escena 3D carga correctamente
- [ ] Jugador spawned en zona

## Debugging HUD
- [ ] Presionar D abre panel
- [ ] Presionar D lo cierra
- [ ] Panel muestra "Phase 0/4"
- [ ] Barra de progreso visible

## Acumulación de Tiempo
- [ ] Presionar T suma 10s (visible en HUD)
- [ ] Time: XX.Xs / 30s actualiza
- [ ] Barra progresa visualmente

## Phase Advancement
- [ ] Presionar T 3 veces (30s) → automáticamente Fase 1
- [ ] "Phase 1/4" visible en HUD
- [ ] Properties CLAMP comienzan a cambiar

## CLAMP Properties
- [ ] Ver 13 propiedades listadas
- [ ] Cada una tiene barra visual
- [ ] Números actuales vs target visibles
- [ ] lobed morphea 0.1 → 0.3 (Fase 0 → 1)

## Similarity Score
- [ ] Score calcula correctamente
- [ ] Mejora cuando phase avanza
- [ ] Máximo alcanzable: ~94% (muy cerca Quercus)

## Debug Controls
- [ ] T suma tiempo
- [ ] P completa puzzle (si implementado)
- [ ] F avanza fase
- [ ] Ningún error en consola
```

---

## 💻 Líneas de Código Mapa

| Archivo | Uso | Modificar para |
|---------|-----|-----------------|
| QuercusEvolutionSystem.ts | Lógica progresión | Cambiar timings/targets |
| PaleobotanyEducationContext.tsx | State/Context | Añadir nuevas acciones |
| CLAMPDebugHUD.tsx | Visualización | Mejorar UI/UX |
| paleobotanyDatabase.json | Contenido | Añadir narrativa/puzzles |
| App.tsx | Integración | Añadir nuevos componentes |

---

## 🎓 Learning Path Recomendado

**Si quieres entender el sistema:**

1. Lee: `QUERCUS_INTERDISCIPLINARY_ANALYSIS.md` (conceptual)
2. Lee: `QUERCUS_EVOLUTION_SPECIFICATION.md` (requirements)
3. Abre: `demo/src/systems/QuercusEvolutionSystem.ts` (lógica)
4. Lee: `QUERCUS_IMPLEMENTATION_v0.1.md` (técnico)
5. Abre: `demo/src/components/CLAMPDebugHUD.tsx` (visualización)

**Si solo quieres testear:**

1. Lee: `QUERCUS_DEBUG_QUICKSTART.md`
2. Abre juego
3. Presiona D
4. Presiona T/P/F para controlar fase

---

## 📞 Archivos Clave para Modificación

Si necesitas cambiar algo:

### Cambiar tiempo requerido por fase
→ Edita `demo/src/systems/QuercusEvolutionSystem.ts` líneas ~45-75
```typescript
PHASE_CHECKPOINTS: {
  0: { requiredTimeInZone: 0, ... },
  1: { requiredTimeInZone: 30, ... },  ← CAMBIAR AQUÍ
  ...
}
```

### Cambiar CLAMP targets
→ Edita `demo/src/systems/QuercusEvolutionSystem.ts` líneas ~45-160
```typescript
leafTarget: {
  lobed: 0.85,    ← CAMBIAR VALORES
  teeth: 0.08,
  ...
}
```

### Cambiar narrativa
→ Edita `demo/src/data/paleobotanyDatabase.json`
```json
{
  "title": "Nuevo título",
  "content": "Nuevo contenido..."
}
```

### Mejorar HUD visualmente
→ Edita `demo/src/components/CLAMPDebugHUD.tsx` (todo es inline styles)

---

## ✨ Lo que Hemos Hecho en Resumen

```
Tu Pregunta:
"¿Cómo debuggear CLAMP para Quercus?"

Nuestra Respuesta:
1. Creamos sistema que trackea 13 propiedades botánicas
2. Definimos 5 fases de transformación (0.1 lobed → 0.85 lobed)
3. Creamos HUD que visualiza progreso en tiempo real
4. Integramos con progresión temporal (Tiempo en zona → Progreso)
5. Preparamos estructura para puzzles educativos
6. Documentamos todo para continuación

Resultado:
→ Sistema implementado, testing-ready
→ HUD interactivo para debugging visual
→ Arquitectura escalable para Phase 1/2
→ Cero errores TypeScript
```

---

## 🎬 Próxima Escena

La arquitectura está lista. Ahora:
- Tú implementas puzzles UI
- Tú conectas narrativa educativa a pantalla
- Sistema automáticamente trackea progresión
- Gameplay enseña paleobotánica sin sentir "educativo"

**¡Listo para desarrollar!**

