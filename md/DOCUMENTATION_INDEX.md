# 📖 DOCUMENTACIÓN COMPLETA - Índice

Bienvenido al **Quercus Evolution System** - Juego educativo sobre paleobotánica.

Este documento es el índice central. Selecciona lo que buscas:

---

## 🚨 ¿TENGO UN PROBLEMA?

### El juego se cuelga / está muy lento
→ **Lee primero:** [`PERFORMANCE_GUIDE.md`](PERFORMANCE_GUIDE.md)  
**Solución rápida:** Agregar `PerformanceManager.setLevel('LOW')` en `main.tsx`

### La hoja cambia forma dramáticamente al salir de zona
→ **Lee:** [`BUG_FIX_LEAF_MORPH.md`](BUG_FIX_LEAF_MORPH.md)  
**Tiempo:** 5 minutos para arreglarlo

### Quiero empezar a usar esto ahora
→ **Lee:** [`QUICK_START.md`](QUICK_START.md)  
**Tiempo:** 15 minutos para entender

---

## 🏗️ ¿QUIERO ENTENDER LA ARQUITECTURA?

### Visión completa del proyecto
→ [`PROJECT_ARCHITECTURE.md`](PROJECT_ARCHITECTURE.md)

**Cubre:**
- Diagrama de capas (6 niveles)
- Flujo de datos
- Cómo interactúan contextos
- Cómo funcionan los hooks

### Diagramas técnicos
→ Ver sección "Arquitectura de Capas" en PROJECT_ARCHITECTURE.md

---

## ✨ ¿QUIERO AGREGAR O EDITAR CARACTERÍSTICAS?

### Agregar una nueva zona
→ [`QUICK_START.md`](#agregar-nueva-zona-5-minutos) - Sección 1  
**Pasos:** 4 archivos a editar, ~5 min

### Cambiar apariencia de plantas
→ [`QUICK_START.md`](#cambiar-aspecto-de-plantas) - Sección 2  
**Pasos:** 2 opciones, ~2 min cada una

### Modificar propiedades CLAMP de una propiedad
→ [`PROJECT_ARCHITECTURE.md`](#caso-2-agregar-nueva-propiedad-clamp) - Línea 450  
**Pasos:** 4 archivos

### Optimizar más para hardware débil
→ [`PERFORMANCE_GUIDE.md`](#cómo-usarlo) - Sección de customización

---

## 🐛 DEBUGGING Y TROUBLESHOOTING

### Monitor de performance en tiempo real
→ [`PERFORMANCE_GUIDE.md`](#monitoreo-de-performance)  
Ver cache stats, hitrate, garbage collection

### Comandos de debug del juego
→ [`PROJECT_ARCHITECTURE.md`](#sistema-de-debugging)  
Teclas: H, T, P, F + console commands

### Problemas comunes y soluciones
→ [`PROJECT_ARCHITECTURE.md`](#troubleshooting) (tabla)  
→ [`PERFORMANCE_GUIDE.md`](#troubleshooting-performance)

---

## 📊 ARCHIVOS DE DOCUMENTACIÓN

| Archivo | Propósito | Audiencia |
|---------|-----------|-----------|
| **QUICK_START.md** | Empezar rápido | Todos |
| **PROJECT_ARCHITECTURE.md** | Entender sistema completo | Developers |
| **PERFORMANCE_GUIDE.md** | Optimizaciones + analytics | Developers |
| **BUG_FIX_LEAF_MORPH.md** | Reparar bug específico | Developers |
| **DOCUMENTATION_INDEX.md** | Este archivo | Todos |

---

## 🎯 RUTAS POR TIPO DE USUARIO

### Soy Usuario / Reporté un Crash
1. Lee **QUICK_START.md** (2 min)
2. Implementa solución en PerformanceConfig (30 sec)
3. Reinicia
4. ✅ Listo

### Soy Developer Nuevo en el Proyecto
1. Lee **QUICK_START.md** (10 min)
2. Lee **PROJECT_ARCHITECTURE.md** - secciones 1-3 (20 min)
3. Abre archivos en `src/` y correlaciona
4. Eres experto ✅

### Soy Developer Experimentado
1. Lee **PROJECT_ARCHITECTURE.md** completo (15 min)
2. Revisa **PERFORMANCE_GUIDE.md** (10 min)
3. Puedes editar cualquier cosa ✅

### Quiero Agregar una Característica Pequeña
1. Ve a **QUICK_START.md** - sección "Agregar Nueva Zona"
2. Sigue pasos (5 min)
3. Lista ✅

### El Juego va Lento y Quiero Optimizarlo
1. Lee **PERFORMANCE_GUIDE.md** completo (20 min)
2. Aplica los cambios sugeridos
3. Monitorea con console stats
4. Ajusta PerformanceConfig
5. ✅ Optimizado

---

## 📝 RESUMEN: QUÉ CAMBIÓ (Desde la última versión)

### Nuevos Archivos
- ✅ `PerformanceConfig.ts` - Configuración centralizada
- ✅ `GeometryCache.ts` - Sistema de caching automático
- ✅ `PROJECT_ARCHITECTURE.md` - Guía arquitectónica
- ✅ `QUICK_START.md` - Guía para empezar
- ✅ `PERFORMANCE_GUIDE.md` - Guía de optimizaciones
- ✅ `BUG_FIX_LEAF_MORPH.md` - Fix para bug conocido
- ✅ `DOCUMENTATION_INDEX.md` - Este archivo

### Cambios en Archivos Existentes
- ✅ `CLAMPDebugHUD.tsx` - Tecla D → H (no interfiere con movimiento)
- ✅ `LeafGeometrySystem.ts` - Ahora usa cache automáticamente
- ✅ `Environment.tsx` - Ya usa AdaptiveFlowerPlant (si estaba actualizado)

### Funcionalidad de Performance
- ✅ Auto-detect de nivel (LOW/MEDIUM/HIGH)
- ✅ Geometry caching con LRU eviction
- ✅ Material caching para shaders
- ✅ Segmentos adaptativos (16-64)
- ✅ Estadísticas en tiempo real

---

## 🔗 NAVEGACIÓN RÁPIDA

### Por Tema

**Performance & Rendering**
- [`PERFORMANCE_GUIDE.md`](PERFORMANCE_GUIDE.md) - Todo sobre optimización
- [`PROJECT_ARCHITECTURE.md`](#nivel-2-caching-inteligente-geometrycache) - Caching

**Agregar/Editar Features**
- [`QUICK_START.md`](#para-developers-que-quieren-editar) - Editar
- [`PROJECT_ARCHITECTURE.md`](#cómo-agregar-características) - Referencia completa

**Debugging**
- [`PROJECT_ARCHITECTURE.md`](#sistema-de-debugging) - Comandos debug
- [`PERFORMANCE_GUIDE.md`](#monitoreo-de-performance) - Console stats
- [`BUG_FIX_LEAF_MORPH.md`](BUG_FIX_LEAF_MORPH.md) - Bug específico

**Entender el Sistema**
- [`PROJECT_ARCHITECTURE.md`](PROJECT_ARCHITECTURE.md) - Visión completa
- [`QUICK_START.md`](#estructura-de-carpetas-simplificada) - Carpetas

---

## 🎮 CONTROLES DE JUEGO (una vez en el juego)

| Tecla | Acción |
|-------|--------|
| **WASD** | Movimiento |
| **Espacio** | Saltar |
| **H** | Toggle Debug HUD (nuevo: fue D) |
| **T** | +10 segundos (debug) |
| **P** | Completar puzzle (debug) |
| **F** | Avanzar fase (debug) |

---

## 🆘 SOPORTE

Si encuentras un problema NO documentado aquí:

1. Abre **PERFORMANCE_GUIDE.md** → Troubleshooting
2. Si no está, abre **PROJECT_ARCHITECTURE.md** → Troubleshooting  
3. Si sigue sin respuesta, revisa console (F12) para errores

**Errores comunes:**
- "Cannot find module" → Problema de imports (verificar rutas)
- "Shader compile error" → Sintaxis GLSL en AdaptiveLeafMesh
- "Memory leak" → geometry.dispose() no se llama

---

## 📈 ROADMAP FUTURO

### Próximas Optimizaciones
- [ ] LOD system completo
- [ ] Instanced rendering para plantas
- [ ] WebWorker para generación
- [ ] GPGPU morphing

### Próximas Features
- [ ] Grenade mechanic
- [ ] Puzzle minigames
- [ ] Inventory system
- [ ] Codex con narrativas

### Documentación Faltante
- [ ] Video tutorial (YouTube)
- [ ] API reference para sistemas
- [ ] Performance profiling guide

---

## ✅ CHECKLIST PARA NUEVO DEVELOPER

- [ ] Leí QUICK_START.md
- [ ] Leí PROJECT_ARCHITECTURE.md
- [ ] Entiendo dónde está cada cosa
- [ ] Probé agregar una zona (test)
- [ ] Cambié PerformanceLevel para testear
- [ ] Leí PERFORMANCE_GUIDE.md
- [ ] Entiendo el caching
- [ ] Soy experto ✅

---

**Última actualización:** Marzo 2025  
**Versión:** 2.0 - Architecture & Performance Edition  
**Autor:** Professional AI Development Assistant

