# QUICK START: Debuggear Quercus Evolution

## 🚀 Cómo empezar en 2 minutos

### 1. Iniciar servidor de desarrollo
```bash
cd /workspaces/Third-Person-Shooter-Game-R3F
pnpm run dev
```

### 2. En el navegador
- Abre `http://localhost:5173`
- Espera a que cargue el escenario 3D
- Si ves el jugador y zona de influencia → ¡Listo!

### 3. Presiona `D`
- Aparecerá el **CLAMP Debug HUD** en la esquina superior derecha
- Deberías ver:
  - Phase 0/4: Olmos Fósil - Base
  - Barra de progreso en 0%
  - 13 propiedades CLAMP
  - CLAMP Similarity: algún %

---

## 🎮 Controles de Debug

| Tecla | Acción | Para qué |
|-------|--------|----------|
| **D** | Toggle HUD | Abre/cierra debug panel |
| **T** | +10 segundos | Simula estar 10s en speed_boost |
| **P** | 1 puzzle | Completa puzzle (dev) |
| **F** | Siguiente fase | Salta a fase siguiente |

---

## 📊 Qué Observar en el HUD

### Barra de Progreso
- Velocidad del llenado = acumulación de tiempo
- Cuando llega 100% → automáticamente avanza a fase siguiente

### CLAMP Similarity
```
0-33%    = Rojo    → muy lejos de Quercus
33-66%   = Amarillo → medio camino
66-100%  = Verde    → muy cerca de Quercus (ÉXITO)
```

### Propiedades CLAMP
Cada una muestra:
- **Barra de progreso**: valor actual (0-1 o 0.5-1.5 para length)
- **Números**: `actual → target`
- **Línea azul**: dónde está el target

---

## 🧪 Escenario de Testing #1: Fase Rápida

**Objetivo**: Ver morphing suave entre fases

1. Abre HUD (`D`)
2. Presiona `T` 3 veces (30 segundos)
   - Observa: progreso bar llena a 100%
   - Observa: Fase avanza automáticamente a 1
3. Observa propiedades:
   - `lobed`: 0.1 → 0.3
   - `teeth`: 0.0 → 0.1
   - `surface`: 0.2 → 0.28
4. Similarity debería mejorar (~17%)
5. Repite presionando `T` para llegar a Fase 4

---

## 🧪 Escenario de Testing #2: Gameplay Real

**Objetivo**: Ver acumulación natural de tiempo

1. Abre HUD (`D`)
2. Mueve jugador a una zona **verde** (speed_boost)
   - En speed_boost, tiempo comienza a acumularse
   - Deberías ver timer aumentar en HUD
3. Espera ~30 segundos
   - Progreso bar llena lentamente
   - Cuando llega 100% → automáticamente avanza a Fase 1
4. Lee los cambios en propiedades CLAMP
5. Repite en speed_boost ~45s más para llevar a Fase 2

---

## 🐛 Debugging: Qué Significa Cada Propiedad

Si quieres ver **Quercus específicamente**, observa estas:

| Propiedad | Valor Quercus | Significado |
|-----------|---------------|------------|
| **lobed** | 0.85 | ← Esto define Quercus = profundamente lobulada |
| **teeth** | 0.08 | ← Muy pocos dientes (mínima defensa) |
| **surface** | 0.45 | ← Textura nerviosa visible |
| length | 1.2 | ← Hoja grande |
| pointiness | 0.3 | ← No puntiaguda |

**Estrategia de debugging**:
1. Ve hacia qué valores se acerca cada propiedad
2. Si `lobed` sube pero `teeth` baja = correcto (Fase 4 has lobed=0.85, teeth=0.08)
3. Si algo sube cuando debería bajar = bug

---

## 🔍 Observar la Hoja Morfando

El mini visualizador en **esquina inferior derecha** muestra la hoja actual. 

- **Fase 0**: Hoja pequeña, simple, sin lóbulos
- **Fase 1**: Primeros lóbulos débiles
- **Fase 2**: Lóbulos + pequeños dientes
- **Fase 3**: Profundamente lobulada, dientes más regulares
- **Fase 4**: Quercus completo (lobulación máxima, dientes minúsculos)

Si visualizador **no morphea** → verificar que `updateEvolution()` se esté llamando

---

## ⚡ Troubleshooting Rápido

### "HUD no abre con D"
→ Verifica que focus esté en canvas 3D (haz click en pantalla primero)

### "Tiempo no sube"
→ ¿Está jugador en zona **verde** (speed_boost)?
→ Si no, mueve a zona verde en HUD

### "Similarity siempre igual"
→ Presiona `T` para ver si calcula
→ Si cambia al presionar → decorrelated de gameplay (check updateEvolution en frame)

### "Fase no avanza en 30s"
→ ¿Presionaste `T` 3 veces? = 30s acumulados
→ O ¿permaneces 30s naturales en speed_boost?
→ Hoja debe morphar suavemente (no jump)

---

## 📚 Estructura Mental del Sistema

```
CLAMP = Comparative Leaf Architecture & Morphology Platform
(Botánica científica real convertida a videojuego)

Quercus = Roble (meta final)
Fases = 5 etapas evolutivas (0 a 4)
↓
Cada fase tiene 13 características botánicas
↓
Sistema interpola suavemente entre fases
↓
HUD muestra progreso numérico + visual
↓
Tú debuggeas viendo 13 números morph hacia target
```

---

## 💾 Next Steps Después de Testing Básico

Una vez confirmes que:
- [ ] HUD abre
- [ ] Tiempo sube en speed_boost
- [ ] Propiedades CLAMP morph suavemente
- [ ] Fase avanza automáticamente

Entonces puedes:
1. Implementar mini-puzzles (añade 15% progreso cada uno)
2. Crear UI de narrativa educativa
3. Hacer boss encounter final
4. Ajustar parámetros de tiempo/dificultad

---

## 📞 Quick Reference

**Archivo Principal**: `demo/src/systems/QuercusEvolutionSystem.ts`
- Aquí están los 5 targets CLAMP por fase
- Aquí está la lógica de progresión

**Debug HUD**: `demo/src/components/CLAMPDebugHUD.tsx`
- Aquí modificas lo que se muestra
- Aquí añades nuevos controles

**Context**: `demo/src/context/PaleobotanyEducationContext.tsx`
- Aquí gestiona `updateEvolution()` automático
- Aquí manejas state de progresión

**Data**: `demo/src/data/paleobotanyDatabase.json`
- Aquí está narrativa educativa (para Phase 1)
- Aquí están puzzles (para Phase 1)

---

## 🎯 Objetivo Final Recuerda

Transformar el CLAMP del jugador desde:
```
Fase 0: lobed=0.1,  teeth=0.0    (Olmos)
→ 
Fase 4: lobed=0.85, teeth=0.08   (Quercus) ✓
```

Si lo ves morpheando en HUD → ✅ **System works!**

