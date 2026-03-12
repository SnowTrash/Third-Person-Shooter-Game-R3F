# 🐛 BUG FIX GUIDE - Leaf Morphing Issues

## PROBLEMA: La hoja cambia forma exageradamente al salir de una zona

### ¿Qué está pasando? 🔴

Cuando sales de una zona:
1. `dominantZone` se vuelve `null`
2. Código usa: `const zoneType = dominantZone?.type || 'default'`
3. Se carga geometría 'default' (completamente diferente)
4. AdaptiveLeafMesh regenera la forma
5. **Resultado:** La hoja "jala" a forma totalmente diferente ❌

### Diagrama del Bug

```
EN ZONA                          AL SALIR
dominantZone = { type: 'ice' }  dominantZone = null
        ↓                               ↓
currentZoneType = 'ice'         currentZoneType = 'default'
        ↓                               ↓
AdaptiveLeafMesh recibe         AdaptiveLeafMesh recibe
zoneType='ice'                  zoneType='default'
        ↓                               ↓
Geometría COMPACTA              Geometría GENÉRICA
        ↓                               ↓
MORPH DRAMÁTICO ❌
```

---

## ✅ SOLUCIÓN CORRECTA

El problema está en:  **`ZoneMiniVisualizerWithHistory.tsx`** línea ~70

### Antes (INCORRECTO)

```typescript
// File: ZoneMiniVisualizerWithHistory.tsx
const currentZoneType = useMemo(
  () => dominantZone?.type || 'default',    // ❌ PROBLEM HERE
  [dominantZone]
);

return (
  <Canvas ...>
    <AdaptiveLeafMesh zoneType={currentZoneType} color={color} />
  </Canvas>
);
```

**¿Por qué falla?**
- Cuando `dominantZone = null`, `currentZoneType` cambia a `'default'`
- Se dispara efecto en AdaptiveLeafMesh
- Regenera geometría completamente diferente
- El jugador ve un "salto" visual

### Después (CORRECTO)

```typescript
// File: ZoneMiniVisualizerWithHistory.tsx
import { useLeafMorphHistory } from '../context/LeafMorphHistoryContext';

const MiniVisualizerCanvas: React.FC<MiniVisualizerProps> = ({ size = 200 }) => {
  const { playerZoneState } = useInfluenceZones();
  const { dominantZone } = playerZoneState;
  const { getCurrentMorph } = useLeafMorphHistory();  // ← AGREGAR
  const { recordZoneMorph } = useLeafMorphHistory();
  // ... rest of code

  // ✅ Usar propiedades acumuladas en lugar de zona actual
  const leafProps = useMemo(
    () => getCurrentMorph(),  // CAMBIO: obtener morph histórico
    [getCurrentMorph]
  );

  return (
    <Canvas ...>
      {/* ✅ Pasar propiedades reales en lugar de tipo de zona */}
      <AdaptiveLeafMesh leafProps={leafProps} color={color} />
    </Canvas>
  );
};
```

---

## Cambios en AdaptiveLeafMesh

Además, necesitas actualizar `AdaptiveLeafMesh.tsx` para recibir `leafProps` en lugar de `zoneType`:

### Antes

```typescript
const AdaptiveLeafMesh = ({
  zoneType,              // ❌ Recibe string
  color,
}: {
  zoneType: string;
  color: THREE.Color;
})
```

### Después

```typescript
const AdaptiveLeafMesh = ({
  leafProps,             // ✅ Recibe LeafProperties
  color,
}: {
  leafProps: LeafProperties;  // Cambiar tipado
  color: THREE.Color;
})
```

**Y actualizar la lógica interna:**

```typescript
// Antes
const currentProps = getLeafPropertiesFromZone(previousZoneType.current || 'default');
const targetProps = getLeafPropertiesFromZone(zoneType);

// Después
const targetProps = leafProps;  // Simplemente usa lo que recibe
```

---

## ¿Es fácil el fix? ✅ SÍ

**Cambios necesarios:**
1. Cambiar 1 línea en ZoneMiniVisualizerWithHistory.tsx
2. Actualizar interfaz de AdaptiveLeafMesh
3. Actualizar lógica interna de AdaptiveLeafMesh

**Líneas de código: ~15**

**Tiempo estimado: 5 minutos**

---

## Cómo Implementarlo Paso a Paso

### Paso 1: Editar ZoneMiniVisualizerWithHistory.tsx

Reemplazar esta sección (línea ~65-75):

```typescript
// ANTES
const currentZoneType = useMemo(
  () => dominantZone?.type || 'default',
  [dominantZone]
);

return (
  <Canvas>
    <AdaptiveLeafMesh zoneType={currentZoneType} color={color} />
```

Con esto:

```typescript
// DESPUÉS
const leafProps = useMemo(
  () => getCurrentMorph(),
  [getCurrentMorph]
);

return (
  <Canvas>
    <AdaptiveLeafMesh leafProps={leafProps} color={color} />
```

### Paso 2: Editar AdaptiveLeafMesh.tsx

**Cambiar interfaz (línea ~20-25):**

```typescript
// ANTES
const AdaptiveLeafMesh = ({
  zoneType,
  color,
}: {
  zoneType: string;
  color: THREE.Color;
}) => {

// DESPUÉS
const AdaptiveLeafMesh = ({
  leafProps,
  color,
}: {
  leafProps: LeafProperties;
  color: THREE.Color;
}) => {
```

**Cambiar lógica (línea ~165-180):**

```typescript
// ANTES
useEffect(() => {
  if (zoneType === previousZoneType.current) return;

  const currentProps = getLeafPropertiesFromZone(
    previousZoneType.current || 'default'
  );
  const targetProps = getLeafPropertiesFromZone(zoneType);
  
  // ... rest
}, [zoneType]);

// DESPUÉS
useEffect(() => {
  // Comparar propiedades reales, no tipo de zona
  const propsChanged = !previousPropsRef.current || 
    JSON.stringify(leafProps) !== JSON.stringify(previousPropsRef.current);
  
  if (!propsChanged) return;

  const currentProps = previousPropsRef.current || leafProps;
  const targetProps = leafProps;
  
  morphStateRef.current.currentLeafGeometry = generateLeafGeometry(currentProps);
  morphStateRef.current.targetLeafGeometry = generateLeafGeometry(targetProps);
  morphStateRef.current.morphProgress = 0;
  morphStateRef.current.isTransitioning = true;
  showSporesRef.current = true;

  previousPropsRef.current = leafProps;
}, [leafProps]);
```

---

## Beneficios de Esta Solución

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Morfing al salir** | ❌ Dramático | ✅ Suave/nulo |
| **Acumulación CLAMP** | ❌ Se ignora | ✅ Se preserva |
| **Fuente de verdad** | ❌ MúltiBránqueas | ✅ Única (getCurrentMorph) |
| **Performance** | ⚠️ Regenera siempre | ✅ Usa cache |

---

## Testing Manual

Después de implementar, prueba:

1. **Entrar en zona**
   - Hoja debe cambiar suavemente
   - ✅ Zona se detecta correctamente

2. **Salir de zona**
   - Hoja debe quedarse igual (NO cambiar)
   - ✅ Morfing no debe ocurrir

3. **Entrar en otra zona diferente**
   - Hoja debe cambiar hacia nuevas propiedades
   - ✅ Transición suave

4. **Panel Debug (H)**
   - Debe mostrar propiedades acumuladas
   - ✅ Similarity score consistente

---

## Alternate Solution (Si no quieres cambiar AdaptiveLeafMesh)

Si prefieres no tocar mucho código, podrías:

```typescript
// En ZoneMiniVisualizerWithHistory.tsx
const currentZoneType = useMemo(() => {
  // Mantenerse en la última zona conocida incluso si salimos
  if (dominantZone?.type) {
    lastZoneType.current = dominantZone.type;
  }
  return lastZoneType.current || 'default';
}, [dominantZone]);
```

**PERO:** Esto es un parche. La solución correcta es pasar `leafProps`.

---

## Referencias

- [`ZoneMiniVisualizerWithHistory.tsx`](demo/src/components/ZoneMiniVisualizerWithHistory.tsx)
- [`AdaptiveLeafMesh.tsx`](demo/src/components/AdaptiveLeafMesh.tsx)
- [`LeafMorphHistoryContext.tsx`](demo/src/context/LeafMorphHistoryContext.tsx)

