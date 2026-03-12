# Especificación: Evolución Paleobotánica hacia Quercus

**Fecha**: Febrero 2026  
**Proyecto**: Third-Person-Shooter-Game-R3F  
**Objetivo**: Crear progresión educativa jugable desde genoma botánico Formación Olmos → Quercus moderno

---

## 1. REQUERIMIENTOS FUNCIONALES (RF)

### RF-1: Sistema de Progresión Quercus (Mecánica de Núcleo)
- **RF-1.1**: Definir 5 fases de transformación evolutiva hacia Quercus
  - Fase 0 (Base): Hoja primitiva de Olmos
  - Fase 1: Proto-roble temprano (Early Eocene)
  - Fase 2: Roble medio (Paleoceno tardío)
  - Fase 3: Proto-Quercus (Eoceno medio)
  - Fase 4: **Quercus moderno** (Target final)

- **RF-1.2**: Cada fase tiene "checkpoint" botánico específico (CLAMP scoring)
  ```
  Fase 0 [Base]:        lobed=0.1, teeth=0.0, apex=0.0
  Fase 1 {Proto-Q1}:    lobed=0.3, teeth=0.1, apex=0.05
  Fase 2 [Proto-Q2]:    lobed=0.5, teeth=0.2, apex=0.1
  Fase 3 {Proto-Q3}:    lobed=0.7, teeth=0.15, apex=0.1
  Fase 4 [Quercus]      lobed=0.85, teeth=0.08, apex=0.05, surface=0.4
  ```

### RF-2: Acumulación Temporal de Adaptaciones
- **RF-2.1**: Permanencia mínima en zona → desbloquea siguiente fase
  - Fase 0→1: 30 segundos en speed_boost
  - Fase 1→2: 45 segundos en speed_boost + 1 mini-puzzle completado
  - Fase 2→3: 60 segundos en speed_boost + 2 mini-puzzles
  - Fase 3→4: 90 segundos + "boss understanding" (YUKA enemy puzzle)

- **RF-2.2**: Sistema de acumulación:
  ```typescript
  interface ZoneTimeAccumulator {
    zoneId: string;
    timeAccumulated: number;
    lastEntered: number;
    puzzlesCompleted: number;
  }
  ```

### RF-3: Mini-Puzzle System (Aprendizaje Experiencial)
- **RF-3.1**: Tipos de puzzles educativos:
  - **Morphology Matching**: Emparejar característica CLAMP con zona ambiental
  - **Temporal Sequence**: Ordenar fases evolutivas correctamente
  - **Botanical Traits**: Identificar si característica es presente en fase actual

- **RF-3.2**: Cada puzzle completa proporciona:
  - +15% progreso hacia siguiente fase
  - +1 "Paleobotany Insight" (edukativo)
  - Desbloquea lectura narrativa relacionada

### RF-4: Sistema de Narrativa Educativa
- **RF-4.1**: "Paleobotany Codex" - Sistema de lectura progresiva
  ```typescript
  interface PaleobotanyEntry {
    id: string;
    phase: number;
    title: string;
    content: string;
    scientificName: string;
    botanicalCharacteristics: string[];
    environmentalContext: string;
    unlockCondition: 'phase_unlock' | 'puzzle_complete' | 'time_milestone';
  }
  ```

- **RF-4.2**: Entradas desbloqueables:
  - Fase 0: "Olmos Fósil - Formación Olmos" (automático)
  - Fase 1: "Proto-robles tempranos" (después puzzle 1)
  - Fase 2: "Adaptación a clima Eoceno" (después puzzle 2)
  - Fase 3: "Especiación de Quercus" (después puzzle 3)
  - Fase 4: "Quercus moderno - Éxito evolutivo" (boss completado)

### RF-5: Sistema de Debugging CLAMP
- **RF-5.1**: HUD interactivo que muestre:
  - Valores CLAMP actuales (13 propiedades)
  - Fase actual y progreso hacia siguiente
  - Tiempo acumulado en zona
  - Puzzles completados / faltan

- **RF-5.2**: Controles de debugging:
  - Tecla D: Toggle debug mode on/off
  - Tecla T: Avanzar tiempo 10 segundos
  - Tecla P: Completar puzzle manual
  - Tecla F: Forzar siguiente fase (dev only)

### RF-6: Integración con Sistema YUKA (Boss)
- **RF-6.1**: Boss (YUKA) habita zona Quercus final
- **RF-6.2**: Derrota del boss = fase final desbloqueada
- **RF-6.3**: Boss mechanics relacionados a botánica:
  - Puede "moverse entre hojas" del escenario Quercus
  - Comportamiento influido por morphology actual del jugador

---

## 2. REQUERIMIENTOS NO-FUNCIONALES (RNF)

### RNF-1: Rendimiento
- HUD debug debe renderizar con <1ms overhead
- Cada update de CLAMP scoring <0.5ms
- Mini visualizador Quercus 60 FPS constante

### RNF-2: Educativo
- Contenido debe ser botánicamente preciso según literatura paleobotánica
- Nivel de dificultad graduado (fácil → difícil)
- Tiempo de lectura promedio: 2-3 min por entrada

### RNF-3: Experiencia de usuario
- No debe interrumpir gameplay para progresar
- Puzzles completables en <2 minutos
- Feedback visual claro de progreso

### RNF-4: Mantenibilidad
- Todos los CLAMP targets en archivo config centralizado
- Sistema de puzzle extensible (fácil añadir nuevos)
- Narrativa en JSON separado de código lógica

---

## 3. ESPECIFICACIÓN BOTÁNICA: QUERCUS TARGET

### 3.1 Características de Hoja Quercus (Real)

| Característica | Rango Esperado | Descripción |
|---|---|---|
| **Lobation** | 0.75-0.95 | Profundamente lobulada (5-11 lóbulos) |
| **Teeth** | 0.0-0.15 | Márgenes lisos-ligeramente dentados |
| **Lobes Shape** | Rounded (0.8 rounded) | Lóbulos redondeados típicos |
| **Apex** | 0.0-0.1 | Ápice agudo pero no emarginado |
| **Surface Texture** | 0.3-0.5 | Algo áspero (nervios prominentes) |
| **Length** | 1.0-1.3 | Hoja grande (7-14 cm teórico) |
| **Width** | 0.6-0.8 | Ancha comparada a largo |

### 3.2 CLAMP Target Vector para Quercus
```typescript
const QUERCUS_TARGET: LeafProperties = {
  // Morfología base
  width: 0.7,      // Ancha característica
  length: 1.2,     // Grande
  pointiness: 0.3, // No puntiaguda
  surface: 0.45,   // Textura nerviosa
  thickness: 0.2,  // Robusto
  
  // CLAMP Botánico
  lobed: 0.85,           // CARACTERÍSTICA DISTINTIVA
  teeth: 0.08,           // Mínimos dientes
  teethRegularity: 0.2,  // Si hay, irregulares
  teethCloseness: 0.1,   // Si hay, separados
  teethRounded: 0.9,     // Si hay, redondeados
  teethAcute: 0.1,       // No son agudos
  teethCompound: 0.0,    // Sin dientes compuestos
  apexEmarginate: 0.05,  // Ápice simple (no dividido)
};
```

### 3.3 Narrativa Científica (Paleobotánica Real)
- **Quercus**: Género de Fagaceae, origen Eoceno (~50 Ma)
- **Distribución**: Originario de Laurasia (Norteamérica/Eurasia)
- **Características evolutivas clave**:
  - Adaptación a regímenes de humedad variables
  - Hojas lobuladas = ventaja en climas estacionales
  - Dureza madera = defensa contra herbívoros
  - Fructificación lenta = estrategia K-selection

---

## 4. ARQUITECTURA DEL SISTEMA

### 4.1 Componentes Nuevos a Implementar
```
├── Systems/
│   ├── QuercusEvolutionSystem.ts     [NEW] Lógica de progresión
│   └── MiniPuzzleSystem.ts           [NEW] Sistema puzzle
│
├── Context/
│   └── PaleobotanyEducationContext.tsx [NEW] Narrativa + state
│
├── Components/
│   ├── CLAMPDebugHUD.tsx             [UPDATE] Mejorado
│   ├── MiniPuzzleUI.tsx              [NEW] Interfaz puzzles
│   ├── PaleobotanyCodexUI.tsx        [NEW] Lectura
│   ├── QuercusPhaseIndicator.tsx     [NEW] Fase actual
│   └── QuercusTargetLeafMesh.tsx     [NEW] Hoja target para comparar
│
└── Data/
    └── paleobotanyDatabase.json      [NEW] Narrativa + CLAMP targets
```

### 4.2 Data Flow
```
PlayerZoneState 
  ↓ 
QuercusEvolutionSystem (calcula tiempo + puzzles)
  ↓
PaleobotanyEducationContext (actualiza narrativa desbloqueada)
  ↓
CLAMPDebugHUD (renderiza estado actual)
  ↓
AdaptiveLeafMesh + QuercusTargetLeafMesh (visualiza progreso)
```

---

## 5. PLAN DE IMPLEMENTACIÓN FASE 1

**Objetivos Fase 1 (Ahora):**
1. ✅ Especificación botánica del Quercus (ESTO)
2. ⚠️ Sistema de debugging CLAMP mejorado
3. ⚠️ Sistema de acumulación temporal básico
4. ⚠️ Mini-puzzle tipo "Morphology Matching" simple
5. ⚠️ Narrativa educativa base (Fase 0 y 1)

**Metricas de éxito Fase 1:**
- Jugador puede ver en HUD su valor CLAMP actual vs Quercus target
- Permanencia 30 segundos en speed_boost → Fase 1 desbloqueada visualmente
- Completar 1 puzzle simple → Desbloquea primer acta narrativa
- Sin errores de compilación TypeScript

---

## 6. REQUERIMIENTOS INTERDISCIPLINARIOS

### Ingeniería de Software ✓
- Arquitectura modular (separación de concerns)
- State management con Context API
- Clamping en todos los niveles

### Botánica / Paleobotánica ✓
- Características CLAMP botánicamente precisas
- Datos de Formación Olmos + Quercus real
- Selección de características distintivas

### Game Design ✓
- Progresión clara (5 fases)
- Mecánica de aprendizaje experiencial
- Boss encounter cognitivamente complejo

### Pedagogía ✓
- Andamiaje educativo (scaffolding)
- Aprendizaje a través de juego (game-based learning)
- Desbloqueo progresivo de complejidad

### Narrativa ✓
- Historia secundaria coherente
- Conexión gameplay ↔ educación
- Humor educativo

---

## 7. REFERENCIAS CIENTÍFICAS

- **Wolfe, J.A. et al** (2009). "Paleocene and Eocene precipitation" - CLAMP validation
- **Fagaceae phylogeny** - Quercus origin ~50 Ma
- **Smith, S.Y., Manchester, S.R.** - Paleobotany methodology
- **Formación Olmos** - Paleoceno-Eoceno (México), ~60-55 Ma

