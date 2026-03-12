# 🎨 GUÍA DE INTEGRACIÓN Y USO

## Resumen Rápido

Has creado los componentes refactorizados más profesionales:

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `useLeafPropertyVisualization.ts` | Hook mejorado para datos de props | ✅ Listo |
| `CLAMPPropertyVisualization.tsx` | Componentes UI reutilizables | ✅ Listo |
| `CLAMPDebugHUDRefactored.tsx` | HUD completamente rediseñado | ✅ Listo |
| `AdaptiveLeafMeshRefactored.tsx` | Transiciones smooth en geometría | ✅ Listo |

---

## INTEGRACIÓN PASO A PASO

### Paso 1: Reemplazar su componente HUD actual

**En `demo/src/App.tsx` o `demo/src/main.tsx`:**

Cambiar:
```typescript
import CLAMPDebugHUD from './components/CLAMPDebugHUD';

// ↓ A:

import CLAMPDebugHUDRefactored from './components/CLAMPDebugHUDRefactored';
```

Y en el JSX:
```typescript
<CLAMPDebugHUD />

// ↓ A:

<CLAMPDebugHUDRefactored />
```

### Paso 2: Reemplazar AdaptiveLeafMesh en miniviz

En `demo/src/components/ZoneMiniVisualizerWithHistory.tsx`:

Cambiar:
```typescript
import { AdaptiveLeafMesh } from './AdaptiveLeafMesh';

// ↓ A:

import AdaptiveLeafMeshRefactored from './AdaptiveLeafMeshRefactored';
```

Y en el Canvas:
```typescript
<AdaptiveLeafMesh zoneType={currentZoneType} color={color} />

// ↓ A:

<AdaptiveLeafMeshRefactored color={color} morphDuration={500} showSpores={true} />
```

### Paso 3: (Opcional) Usar componentes UI en otros lugares

Si quieres usar las barras en otros componentes:

```typescript
import {
  PropertyBar,
  PropertyGroupPanel,
  PropertyComparisonWidget,
} from './CLAMPPropertyVisualization';
import { useLeafPropertyVisualization } from '../hooks/useLeafPropertyVisualization';

export const MyComponent = () => {
  const propertyGroups = useLeafPropertyVisualization();
  
  return (
    <div>
      {propertyGroups.map(group => (
        <PropertyGroupPanel key={group.category} group={group} />
      ))}
    </div>
  );
};
```

---

## CARACTERÍSTICAS NUEVAS

### 1. Colores Inteligentes

Las barras **se adaptan automáticamente**:

```
Delta < 15% → Verde (✅ Convergiendo)
Delta 15-35% → Amarillo (⚠️ Cambio medio)
Delta 35-60% → Naranja (❗ Cambio notable)
Delta > 60% → Rojo (🔴 Máxima diferencia)
```

Además, la **intensidad** (saturación) aumenta cuando hay cambio activo.

### 2. Tres Vistas del HUD

Presiona **[1]**, **[2]**, **[3]** para cambiar:

- **[1] Overview**: Vista rápida, similarity score grande, cambios más importantes
- **[2] Detailed**: Todas las 13 propiedades agrupadas por categoría
- **[3] Changes**: Solo propiedades que están cambiando significativamente

### 3. Indicadores Visuales

Cada propiedad muestra:
- **▼** = Convergiendo hacia target (mejorando)
- **▲** = Alejándose del target (empeorando)
- **─** = Sin cambio significativo

### 4. Transiciones Smooth en Geometría

Usa **easing functions profesionales** (no lineal):
- `easeInOutCubic` - Muy suave en ambos lados
- `easeOutQuad` - Recomendado (suave al final)
- `easeOutCubic` - Muy orgánico
- `easeOutQuart` - Máximo suave

---

## MEJORAS TÉCNICAS

### Rendimiento
- ✅ Menos re-renders (useMemo optimizado)
- ✅ Hooks separados y reutilizables
- ✅ Componentes sin lógica de negocio
- ✅ Cleanup automático de geometrías

### Código
- ✅ DRY (Don't Repeat Yourself) - sin duplicación
- ✅ Single Responsibility - cada componente hace una cosa
- ✅ Profesional y auditable
- ✅ Fácil de debugear (console.log en lugares correctos)

### UX
- ✅ Colores más claros y contrastantes
- ✅ Narrativa botánica en tooltips
- ✅ Múltiples vistas para diferentes necesidades
- ✅ Transiciones suaves y satisfactorias

---

## CÓMO CONFIGURAR

### Cambiar Duración de Transición

En `ZoneMiniVisualizerWithHistory.tsx`:

```typescript
<AdaptiveLeafMeshRefactored
  color={color}
  morphDuration={300}  // 0.3 segundos (más rápido)
  showSpores={true}
/>
```

### Cambiar Easing Function

En `AdaptiveLeafMeshRefactored.tsx`, línea ~70:

```typescript
morphStateRef.current.easeFunction = EasingFunctions.easeInOutCubic;
// O cualquier otra función
```

### Cambiar Colores de Delta

En `useLeafPropertyVisualization.ts`, función `getDeltaColor()`:

```typescript
if (delta < 0.15) {
  return `hsl(120, ${100 * intensity}%, 45%)`; // Verde - EDITAR AQUÍ
}
```

---

## DEBUGGING

### Ver Stats en Console

```javascript
// En browser F12, copiar y pegar:
await import('./hooks/useLeafPropertyVisualization.js')
  .then(m => {
    const viz = m.useLeafPropertyVisualization();
    console.log('Property Groups:', viz);
  });
```

### Monitorear Cambios

En `AdaptiveLeafMeshRefactored.tsx`, línea ~130:

```typescript
console.log('Leaf properties changed:', currentLeaf);
```

---

## ESTRUCTURA ACTUAL vs NUEVA

### Antes (Problema)
```
CLAMPDebugHUD.tsx          ← Renderiza barras
└─ Código duplicado para colores

AdaptiveLeafMesh.tsx       ← Otro código similar
└─ Más duplicación

Resultado: Difícil de mantener, inconsistente
```

### Después (Solución)
```
useLeafPropertyVisualization.ts    ← ÚNICA fuente de datos
├─ CLAMPDebugHUDRefactored.tsx      ← Usa hook
├─ CLAMPPropertyVisualization.tsx   ← Componentes UI
├─ AdaptiveLeafMeshRefactored.tsx   ← Sincronizado
└─ Cualquier otro componente        ← Puede usar también

Resultado: DRY, consistente, profesional
```

---

## PRÓXIMOS PASOS OPCIONALES

### 1. Agregar Exportación de Stats

```typescript
// En App.tsx
const exportStats = () => {
  const groups = useLeafPropertyVisualization();
  const data = groups.map(g => ({
    category: g.category,
    delta: g.groupDelta,
    properties: g.properties.map(p => ({
      name: p.label,
      current: p.current,
      target: p.target,
    }))
  }));
  
  console.log(JSON.stringify(data, null, 2));
  // Copiar y guardar en archivo
};
```

### 2. Agregar Historial de Cambios

```typescript
// Nuevo hook
export const usePropertyHistory = () => {
  const [history, setHistory] = useState<PropertyVisualization[][]>([]);
  const props = useLeafPropertyVisualization();
  
  useEffect(() => {
    setHistory(prev => [...prev, flatMap(props, p => p.properties)]);
  }, [props]);
  
  return history;
};
```

### 3. Agregar Predicción de Convergencia

```typescript
// Calcular cuándo convergerá
const timeToConvergence = (
  delta: number,
  convergenceRate: number // props/segundo
) => delta / convergenceRate;
```

---

## COMPATIBILIDAD

Todos los archivos son **100% compatibles** con:
- React 18+
- Three.js r128+
- @react-three/fiber 8+
- TypeScript 4.9+

---

## TESTING

### Test Manual Rápido

1. Abre el juego
2. Presiona **H** para abrir HUD
3. Presiona **1**, **2**, **3** para cambiar vistas
4. Entra en una zona
5. Verifica que:
   - ✅ Las barras cambian de color (verde→amarillo→rojo)
   - ✅ Los números se actualizan suavemente
   - ✅ La hoja en miniviz hace transición smooth
   - ✅ Los indicadores (▼▲) aparecen cuando cambia

---

## REFERENCIAS RÁPIDAS

| Archivo | Línea | Descripción |
|---------|-------|-------------|
| `useLeafPropertyVisualization.ts` | 70 | Colores dinámicos |
| `useLeafPropertyVisualization.ts` | 150 | Metadata de props |
| `CLAMPDebugHUDRefactored.tsx` | 50 | Keyboard handling |
| `CLAMPDebugHUDRefactored.tsx` | 200 | Vista Overview |
| `AdaptiveLeafMeshRefactored.tsx` | 95 | Easing functions |
| `AdaptiveLeafMeshRefactored.tsx` | 175 | Animation loop |

