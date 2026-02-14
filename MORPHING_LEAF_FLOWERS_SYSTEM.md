# Sistema Completo de Hoja Morfogenética y Plantas en Zonas

## Resumen General

Se implementó un sistema integrado donde:

1. **Hoja Morfogenética en Mini Visualizador**: Una hoja adaptativa que cambia de forma al entrar en cada zona de influencia, guardando su estado y acumulando cambios con **CLAMP** para evitar valores extremos.

2. **Plantas en el Suelo**: Flores y cola de plantas procedurales se renderizan en cada zona, distribuidas en un círculo alrededor de la posición de la zona.

3. **Persistencia de Nivel**: El nivel comienza con una hoja base y termina con una forma morfeada acumulada por todas las zonas visitadas.

4. **Extensibilidad**: El sistema está diseñado para fácil expansión con nuevas zonas y tipos de plantas.

---

## Archivos Creados y Modificados

### Nuevos Archivos

#### 1. **`demo/src/context/LeafMorphHistoryContext.tsx`**
- Context de React que gestiona el historial de morfología de la hoja
- Funciones principales:
  - `recordZoneMorph(zoneId, props)` - Guarda el estado de morph para una zona
  - `getAccumulatedMorph(zoneIds)` - Obtiene la morph acumulada blendiendo todas las zonas visitadas
  - `getCurrentMorph()` - Retorna el estado actual de la hoja
  - `resetHistory()` - Limpia el historial
- **CLAMP**: Todos los valores de propiedades de hoja están clampeados a [0, 1] usando la función `clamp()`
- **Blending**: Las propiedades se interpolan suavemente entre zonas visitadas con peso 0.5

#### 2. **`demo/src/components/ZoneMiniVisualizerWithHistory.tsx`**
- Reemplaza el antiguo mini visualizador
- Usa `AdaptiveLeafMesh` en lugar de `MorphingOrganicMesh`
- Integra el historial de morph para guardar cambios por zona
- Muestra contador de zonas visitadas en el HUD
- Actualiza la hoja visual en tiempo real con transiciones suaves

### Archivos Modificados

#### 3. **`demo/src/App.tsx`**
- Añadido `LeafMorphHistoryProvider` que envuelve toda la aplicación
- Actualizado import para usar `ZoneMiniVisualizerWithHistory`

#### 4. **`demo/src/components/ProceduralFlower.tsx`**
- Añadidos props: `position`, `seed`, `color`
- Las flores ahora se pueden posicionar en el suelo
- Color configurable o basado en seed para variación
- Envuelto en `<group position={position}>` para permitir ubicación en zonas

#### 5. **`demo/src/components/ProceduralTailPlant.tsx`**
- Añadidos props: `position`
- Las plantas cola ahora se pueden posicionar en el suelo
- Envuelto en `<group position={position}>` para renderizado en zonas

#### 6. **`demo/src/Environment.tsx`**
- Añadida función `ZonePlants()` que renderiza flores/plantas para cada zona
- Mapeado automático de tipo de zona a tipo de planta:
  - `ice`, `jump_boost`, `speed_boost` → Flores (ProceduralFlower)
  - `damage`, `slow` → Plantas cola (TailPlant)
- Las plantas se distribuyen en círculo alrededor de cada zona
- Llamada a `<ZonePlants zones={zones} />` en el retorno de Environment

---

## Cómo Funciona

### Flujo de Gameplay

1. **Inicio del Nivel**
   - Jugador comienza con una hoja base (propiedades por defecto)
   - Historial de morph está vacío

2. **Entrar en una Zona**
   - El sistema detecta que el jugador está en una zona dominante
   - Se crean propiedades de hoja para esa zona usando `getLeafPropertiesFromZone()`
   - El historial se actualiza con `recordZoneMorph()`

3. **Visualización en Mini Visualizador**
   - `AdaptiveLeafMesh` renderiza la hoja con transición suave (0.5s)
   - Esporas/partículas salen durante la transición
   - El HUD muestra el conteo de zonas visitadas

4. **Acumulación de Morph**
   - Cada zona visitada se suma al estado acumulado
   - Las propiedades se blend suavemente usando pesos iguales
   - El CLAMP previene valores extremos (< 0 o > 1)

5. **Final del Nivel**
   - La hoja final representa una mezcla de TODAS las zonas visitadas
   - La forma final es única según la ruta del jugador

### Propiedades de la Hoja (Clampeadas [0, 1])

- **width** (0 = estrecho, 1 = ancho) - Adapta a humedad
- **length** (0 = corta, 1 = larga) - Adapta a altitud
- **pointiness** (0 = redondeada, 1 = afilada) - Adapta a estrés por presión
- **surface** (0 = lisa, 1 = áspera) - Adapta a estrés ambient
- **thickness** (0 = fina, 1 = gruesa) - Adapta a estrés general

---

## Plantas en Cada Zona

### Mapeo de Zona → Planta

```typescript
const zonePlantMap = {
  'ice': { plant: 'flower', color: '#A8D8EA' },          // Azul frío
  'jump_boost': { plant: 'flower', color: '#FFE066' },  // Dorado
  'damage': { plant: 'tail', color: '#E85D75' },        // Rojo profundo
  'slow': { plant: 'tail', color: '#9B8B7D' },          // Marrón cálido
  'speed_boost': { plant: 'flower', color: '#7FD8BE' }, // Verde vibrante
};
```

### Distribución en Suelo

- 5 plantas por zona
- Distribuidas en círculo alrededor de la posición de la zona
- Radio = 70% del radio de zona
- Altura = posición Y de zona + 0.1

---

## Customización y Extensión

### Agregar una Nueva Zona

1. En `demo/src/Environment.tsx`, crea la zona como siempre
2. En `zonePlantMap`, añade el mapeo:
   ```typescript
   'nueva_zona': { plant: 'flower', color: '#XXXXXX' },
   ```
3. En `demo/src/systems/LeafGeometrySystem.ts`, añade propiedades de hoja en `getLeafPropertiesFromZone()`

### Crear un Nuevo Tipo de Planta

1. Crea un componente React Three Fiber con soporte para `position` prop
2. En `ZonePlants()`, añade lógica para renderizar tu planta
3. Actualiza `zonePlantMap` para usar tu nuevo tipo

### Ajustar Parámetros de Morph

En `LeafMorphHistoryContext.tsx`:
- Cambiar el peso de blending en `blendLeafProperties()` (actualmente 0.5)
- Cambiar valores de `DEFAULT_LEAF` para otros defaults iniciales
- Ajustar rango de clamp si es necesario

---

## Código Clave

### Blending con CLAMP

```typescript
const blendLeafProperties = (a, b, weightB = 0.5): LeafProperties => {
  const w = clamp(weightB, 0, 1);
  return {
    width: clamp(a.width * (1 - w) + b.width * w),
    length: clamp(a.length * (1 - w) + b.length * w),
    pointiness: clamp(a.pointiness * (1 - w) + b.pointiness * w),
    surface: clamp(a.surface * (1 - w) + b.surface * w),
    thickness: clamp(a.thickness * (1 - w) + b.thickness * w),
  };
};
```

### Hook de Integración en Mini Visualizador

```typescript
useEffect(() => {
  if (!dominantZone) return;
  const morphProps = getLeafPropertiesFromZone(dominantZone.type);
  recordZoneMorph(dominantZone.id, morphProps);
  visitedZonesRef.current.add(dominantZone.id);
}, [dominantZone, recordZoneMorph]);
```

---

## Próximas Mejoras (Opcionales)

1. **Animación de Crecimiento**: Las plantas podrían "crecer" cuando el jugador entra en la zona (escalado/alpha animation)
2. **Sonido**: Añadir audio cuando la hoja morfa
3. **Persistencia**: Guardar el historial de morph en localStorage para análisis post-nivel
4. **UI de Historial**: Mostrar timeline visual de todas las morphs realizadas
5. **Variación de Plantas**: Usar `seed` para crear plantas únicas por par (zona, índice)
6. **Limpieza Progresiva**: Hacer que las plantas desaparezcan después de cierto tiempo

---

## Prueba Rápida

1. Ejecuta `pnpm run dev:watch`
2. Muévete hacia diferentes zonas
3. Observa en el mini visualizador (abajo a la derecha):
   - La hoja cambia de forma
   - El contador de zonas aumenta
   - Las esporas salen durante la transición
4. Observa en el suelo:
   - Flores/plantas alrededor de cada zona
   - Animaciones sutiles (respiración, rotación)

