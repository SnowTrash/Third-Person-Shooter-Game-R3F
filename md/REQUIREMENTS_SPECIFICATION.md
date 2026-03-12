# Especificación de Requerimientos: Quercus Paleobotanical Evolution System

## 1. CONTEXTO CIENTÍFICO

### Problema Paleobotánico
- **Formación Geológica**: Olmos (Eoceno Temprano, ~55-50 Ma)
- **Especie Target**: *Quercus* (Roble fósil - género conservador, muy reconocible)
- **Morfología Quercus**:
  - Hojas fuertemente lobuladas (5-11 lóbulos profundos redondeados)
  - Margen entero (sin dientes/serración)
  - Simetría palmatinervada
  - Ápice agudo pero sin emarginación
  - Textura: coriácea (gruesa, waxy)
  
### Variantes Intermedias (Trayectoria Evolutiva)
1. **Forma primitiva** → Hojas simples, ligeramente lobuladas
2. **Forma intermedia** → Lobulación moderada, algo de variación
3. **Forma Quercus** → Lobulación profunda, redondeada, sin dientes

---

## 2. REQUERIMIENTOS FUNCIONALES

### RF-1: Sistema de Debugging Visual de CLAMP

**Descripción**: El desarrollador/diseñador necesita visualizar en tiempo real qué parámetros CLAMP se están usando, cómo se interpolan y qué efecto tienen en la geometría de la hoja.

**Requisitos**:
- RF-1.1: HUD de debug mostrable/ocultable (tecla `D`)
- RF-1.2: Mostrar valores actuales de 13 propiedades CLAMP (0.00-1.00)
- RF-1.3: Indicadores visuales de cada propiedad con barras/colores
- RF-1.4: Mostrar zona actual y tiempo en zona
- RF-1.5: Presets guardables/cargables de perfiles CLAMP (desarrollo)
- RF-1.6: Modo "inspector de hoja": click en hoja para inspeccionar su geometría

**Aceptación**: 
- ✅ HUD visible sin overhead de performance >1ms
- ✅ Valores CLAMP actualizados en tiempo real (tap en 16ms)

---

### RF-2: Sistema de Progresión por Tiempo en Zona

**Descripción**: El jugador logra transformaciones de hoja permaneciendo en zona de influencia durante tiempo determinado, con feedback visual/audio.

**Requisitos**:
- RF-2.1: Cada zona tiene un "target" de tiempo acumulado (ej: 30s para jump_boost)
- RF-2.2: Barra de progresión visible cuando jugador está en zona
- RF-2.3: El tiempo acumulado se preserva (no reseta al salir/volver)
- RF-2.4: Al completar tiempo → transformación suave (2-3s) hacia forma goal
- RF-2.5: Partículas/efectos visuales cuando transformación se completa
- RF-2.6: Sonido de "evolución completada" (SFX)
- RF-2.7: Opcionalmente: movimiento del jugador debe ser >0.5m/s (no esperar AFK)

**Aceptación**:
- ✅ Progreso se guarda y persiste entre sesiones
- ✅ Feedback visual claro del progreso actual
- ✅ Transformaciones suaves sin popping

---

### RF-3: Sistema de Mini-Puzzles por Zona

**Descripción**: Desafíos interactivos que, al completarlos, destrancan transformaciones más rápidamente que esperar tiempo.

**Requisitos**:
- RF-3.1: Framework general para puzzles (interfaz base)
- RF-3.2: Cada zona puede tener 1 puzzle asociado
- RF-3.3: Al completar puzzle → 50% del tiempo target se cuenta como completado
- RF-3.4: Puzzle types iniciales:
  - Pattern matching (toques en secuencia)
  - Collection (recolectar partículas flotantes)
  - Memory (recordar patrón de 4 elementos)
- RF-3.5: UI clara de estado puzzle (sin completar/en progreso/completado)
- RF-3.6: Hint system (presionar `H` para pista)

**Aceptación**:
- ✅ Al menos 1 puzzle implementado y probado
- ✅ Progresión cuenta hacia la transformación

---

### RF-4: Sistema de Narrativa Educativa Paleobotánica

**Descripción**: Experiencia educativa integrada que enseña paleobotánica mientras el jugador interactúa con zonas y evoluciones.

**Requisitos**:
- RF-4.1: Objects de lectura (Learning Orbs) interactivos en cada zona
- RF-4.2: Cada zona tiene 3-4 hechos paleobotánicos asociados (cards)
- RF-4.3: UI de lectura no-instrusive (popup corner, pausable)
- RF-4.4: Sistema de "completionismo educativo": coleccionar todos los cards
- RF-4.5: Skill/Badge system: "Aprendiste sobre CLAMP lobes" → unlock hint en zona
- RF-4.6: Glossary interactivo (accesible vía HUD): términos botánicos con imágenes 3D
- RF-4.7: Narrativa secundaria: "El Paleobotánico 95" - personaje NPC que guía aprendizaje

**Aceptación**:
- ✅ Al menos 10 learning cards escritas por experto en paleobotánica
- ✅ UI clara de colección/progreso
- ✅ Integración sin ruptura de flujo de juego

---

### RF-5: Sistema de Boss Arena (Quercus)

**Descripción**: Arena especial con escenario Quercus donde el boss final reúne todos los conceptos.

**Requisitos**:
- RF-5.1: Arena contiene 5-7 árboles Quercus procedurales (geometría realista)
- RF-5.2: Boss AI (YUKA) patrullas y reacciona a jugador
- RF-5.3: Mecánica: Boss echa "spores" de cada parámetro CLAMP (enemigos menores)
- RF-5.4: Ganar requiere transformar hoja a Quercus completo (lobed: 1.0, teeth: 0, apex: 0)
- RF-5.5: Progresión de fases: 3 fases, cada una requiere CLAMP configuration diferente
- RF-5.6: Victoria desbloquea "Paleobotanist Ending" cinematográfico

**Aceptación**:
- ✅ Boss derrotado en <5 minutos por jugador competente
- ✅ Fases tienen clara progresión dificultad
- ✅ CLAMP transformations son parte crítica de la victoria

---

### RF-6: Sistema de Quercus Target Shape

**Descripción**: Definición precisa de la forma Quercus como "estado final" del CLAMP evolution.

**Requisitos**:
- RF-6.1: Quercus profile = conjunto específico de parámetros CLAMP
- RF-6.2: Definición científica:
  ```
  quercus_target: {
    lobed: 0.95,              // Muy fuertemente lobulada
    teeth: 0.0,               // Completamente sin dientes
    teethRegularity: 0.5,     // N/A (sin dientes)
    teethCloseness: 0.5,      // N/A (sin dientes)
    teethRounded: 0.5,        // N/A (sin dientes)
    teethAcute: 0.5,          // N/A (sin dientes)
    teethCompound: 0.0,       // Sin compuestos
    apexEmarginate: 0.0,      // Ápice sólido, no emarginado
    width: 0.7,               // Moderadamente ancha (lóbulos requieren ancho)
    length: 1.3,              // Más larga que ancha
    pointiness: 0.3,          // Lóbulos redondeados (baja puntería)
    surface: 0.2,             // Muy lisa (coriácea)
    thickness: 0.35,          // Gruesa (adaptación xerofítica)
  }
  ```
- RF-6.3: Geometría generada de Quercus debe ser "recognizable" por experto botánico
- RF-6.4: Progressive morphing: cada transformación inter-media es estéticamente válida

**Aceptación**:
- ✅ Hoja final visualmente similar a Quercus real
- ✅ Pasos intermedios biológicamente plausibles

---

## 3. REQUERIMIENTOS NO FUNCIONALES

### RNF-1: Performance
- Debugging HUD: <1ms overhead
- CLAMP claculation: <0.5ms por frame
- Puzzle systems: <2ms
- Boss arena: mantener 60 FPS con 7 Quercus + boss + particles

### RNF-2: Escalabilidad
- Sistema extensible para nuevas formas target (no solo Quercus)
- Framework puzzle reutilizable para otras zonas
- Learning cards sin hard-coding (data-driven)

### RNF-3: Usabilidad
- Control intuititvo sin tutoriales (visual feedback suficiente)
- Modo debug fácil de activar/desactivar sin restart
- Accesibilidad: fonts legibles, colores con contraste, soporte para daltonismo

### RNF-4: Calidad de Código
- TypeScript strict mode
- Componentes independientes y testables
- Documentación inline para lógica botánica/CLAMP
- Zero runtime errors en build final

### RNF-5: Fidelidad Científica
- Todos los parámetros CLAMP basados en literatura paleobotánica real
- Learning cards verificados por paleobotánicos (o consulta literatura)
- Morfología final (Quercus) basada en especímenes fósiles reales

### RNF-6: Narrativa
- Tono educativo pero nunca "lecturante"
- Boss fight integrado narrativamente (no es random)
- "Paleobotanist 95" personaje con voz/personalidad

---

## 4. USUARIO PRIMARIO vs SECUNDARIO

| Rol | Necesidades | User Stories |
|-----|-------------|--------------|
| **Game Player** | Diversión, progresión clara, reto | "Quiero ver cómo evolucionan mis hojas mientras explore" |
| **Educator** | Enseñanza de paleobotánica | "Quiero que mis estudiantes aprendan CLAMP interactivamente" |
| **Developer/Designer** | Debug fácil, control fino de parámetros | "Necesito debuggear qué hace cada parámetro CLAMP" |
| **Paleobotanist Consultant** | Fidelidad científica | "Quiero que la morfología sea correcta según literatura" |

---

## 5. ARQUITECTURA DE SOLUCIÓN

### Componentes Clave a Implementar

```
demo/src/
├── systems/
│   ├── LeafGeometrySystem.ts (existente, mejorar)
│   ├── CLAMPDebugSystem.ts (NEW)
│   ├── ZoneProgressionSystem.ts (NEW)
│   ├── PuzzleSystem.ts (NEW)
│   └── PaleobotanyLearningSystem.ts (NEW)
├── components/
│   ├── CLAMPDebugHUD.tsx (NEW)
│   ├── ZoneProgressBar.tsx (NEW)
│   ├── PuzzleUI.tsx (NEW)
│   ├── LearningOrb.tsx (NEW)
│   ├── GlossaryPanel.tsx (NEW)
│   └── BossArenaQuercus.tsx (NEW)
├── context/
│   ├── LeafMorphHistoryContext.tsx (existente)
│   ├── ZoneProgressionContext.tsx (NEW)
│   ├── PuzzleContext.tsx (NEW)
│   └── PaleobotanyContext.tsx (NEW)
└── data/
    ├── quercus-target-profile.json (NEW)
    ├── learning-cards.json (NEW)
    └── puzzle-definitions.json (NEW)
```

---

## 6. SPRINTS DE IMPLEMENTACIÓN

**Sprint 1** (This week): Debugging CLAMP
- CLAMPDebugSystem + CLAMPDebugHUD
- Quercus target profile definition
- Verificación visual de geometría

**Sprint 2**: Zone Progression
- ZoneProgressionSystem + Context
- ZoneProgressBar UI
- Persistencia de progreso

**Sprint 3**: Mini-Puzzles
- Framework base puzzle
- 1 puzzle implementado (pattern matching)
- Integración con progresión

**Sprint 4**: Learning System
- PaleobotanyLearningSystem
- Learning cards data
- GlossaryPanel

**Sprint 5**: Boss Arena
- Procedural Quercus gen
- YUKA integration (basic)
- Boss phases

---

## 7. ÉXITO CRÍTICO

El sistema es exitoso cuando:
1. ✅ Un diseñador puede debuggear CLAMP sin tocar código (todo visual)
2. ✅ Un estudiante entiende qué es CLAMP después de jugar 30 min
3. ✅ La forma final (Quercus) es visualmente y científicamente válida
4. ✅ El boss fight es desafiante pero justo
5. ✅ La narrativa se integra sin romper el gameplay

