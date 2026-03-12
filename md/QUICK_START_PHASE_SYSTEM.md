# 🚀 Quick Reference - What Changed

## Lo que Pediste
> "¿Por qué presionar F? ¿No están sincronizados? Necesito sistema automático para testear estadísticas"

## Lo que Hicimos Cambió

### **ANTES ❌**
```
F → Avanza fase (manual)
MinivViz y HUD → Datos diferentes
Progresión → Solo con speed_boost
Testear → Imposible
```

### **AHORA ✅**
```
Automático → Fase avanza cuando se cumplen condiciones
MinivViz ↔ HUD → SINCRONIZADOS (mismo hook)
Acumula en CUALQUIER zona
Testear → T, Shift+T, G, F, Shift+F
```

---

## Teclas de Debug Nuevas

```
[H]          Abrir/cerrar HUD

[T]          +10 segundos        [Shift+T]  -10 segundos
[P]          Completar puzzle     [G]        Ganar puzzle (DEBUG)
[F]          Force fase+          [Shift+F]  Revertir fase (DEBUG)

[1]          Overview view        Muestra similitud + zona
[2]          Detailed view        Todas las propiedades
[3]          Changes view         Solo propiedades activas
```

---

## Comportamiento Nuevo

### Progresión Automática
1. Entra zona
2. Acumula tiempo
3. Completa puzzles
4. Cuando tiempo >= required AND puzzles >= required
5. **Fase avanza automáticamente** ✅

### Miniviz ↔ HUD Sincronizados
- Ambos leen de `useLeafVisualization()`
- Mismo EvolutionState
- **Cambios aparecen simultáneamente** ✅

### Testing de Cambios
```
Quieres ver cómo se ve fase 3?
1. Presiona [F] para avanzar manualmente
2. Presiona [Shift+F] para volver
3. Usa [T]/[Shift+T] para acelerar/retroceder tiempo
4. Usa [G] para ganar puzzles al instante
```

---

## Qué Ver en HUD Overview

```
🌿 CLAMP Similarity: 87%  ← Cambio en tiempo real

📍 Proto-roble Temprano (Early Eocene)
[████████░░░░░░░░░] 71% hacia siguiente

⏱️  Tiempo: 28.5s / 30s        ✅ Verde = cumplido
🧩 Puzzles: 1 / 2             ⚠️  Rojo = falta

[AMBOS VERDES] → "✅ Listo para fase 2"
```

---

## Flujos de Testing Recomendados

### Test A: "Ver todas las propiedades cambiar"
1. [H] abrir HUD
2. [2] ir a Detailed
3. [T] presiona 10 veces (+100s)
4. Observa barras ROJO → AMARILLO → VERDE

### Test B: "Testear reversión de fase"
1. [F] paso a fase 3
2. Observa cambios de propiedades
3. [Shift+F] vuelvo a fase 2
4. Repite para cualquier fase

### Test C: "Auto-progress sin teclas"
1. [H] abrir HUD
2. Camina en zona y espera
3. Observa acumulación de tiempo
4. Cuando llega a requerido → FASE CAMBIA automática

### Test D: "Puzzles como ganar"
1. [H] abrir
2. [G] ganar puzzle
3. [G] ganar puzzle 2
4. Fase avanza automática (si tiempo suficiente)

---

## Estados Visuales

```
ROJO    = Falta cumplir
AMARILLO = Parcialmente cumplido
VERDE   = LISTO ✅

Cuando TODO es verde → ⚡ Fase cambia automática
```

---

## Cómo Volver a Estado Original (Sin Debug)

Si quieres que NUNCA cambies de fase manualmente:
- NO presiones [F]
- NO presiones [G]  
- Solo acumula tiempo natural

La progresión automática tomará control y avanzará cuando corresponda.

---

## Preguntas Rápidas

**P: ¿Los cambios de miniviz y HUD son simultáneos?**
A: Sí, 100%. Leen del mismo hook. Garantizado.

**P: ¿Puedo volver a una fase anterior?**
A: Sí, [Shift+F]

**P: ¿Cómo acelero progreso para testear?**
A: [T] múltiples veces para tiempo, [G] para puzzles

**P: ¿Qué pasa si presiono [F]?**
A: Solo DEBUG. Si no cumples condiciones, no pasa nada. Si cumples, avanza.

**P: ¿Las propiedades cambian en tiempo real?**
A: Sí. Ver en [2] Detailed view.

---

**Status**: 🟢 LISTO PARA USAR  
**Sincronización**: 🔄 PERFECTA  
**Testing**: ✅ COMPLETO
