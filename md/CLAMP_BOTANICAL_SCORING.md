# Sistema CLAMP Scoring de Características Botánicas

## Descripción General

Se implementó un sofisticado sistema de scoring CLAMP (0-1) basado en características botánicas reales para la hoja morfénica del mini visualizador. Cada zona de influencia ahora genera hojas con características distintas que reflejan adaptaciones ambientales.

## Características Implementadas

### 1. **Lobed** (Lóbulos)
- **Rango**: 0 = sin lóbulos, 1 = muy lobulada
- **Implementación**: Ondulaciones suaves en los bordes de la hoja
  - Frecuencia de lóbulos aumenta con el valor
  - Amplitud controlada por el score
- **Mapeo por zona**:
  - `speed_boost`: 0.6 (moderadamente lobulada - hojas lozanas)
  - `jump_boost`: 0.2 (ligeramente lobulada - hojas jagged)
  - `ice`: 0 (sin lóbulos - hoja simple)
  - `slow`: 0.3 (ligeramente lobulada)
  - `damage`: 0.7 (muy lobulada - deformada)

### 2. **Teeth** (Dientes/Margen dentado)
- **Rango**: 0 = sin dientes, 1 = muy dentada
- **Implementación**: Proyecciones pequeñas en los bordes
  - Más dientes con valor más alto
  - Integrado con otro scoring para forma
- **Mapeo por zona**:
  - `speed_boost`: 0 (sin dientes - margen entero)
  - `jump_boost`: 0.9 (muy dentada - adaptación defensiva)
  - `ice`: 0.2 (mínimos dientes)
  - `slow`: 0 (sin dientes)
  - `damage`: 0.6 (dientes irregulares - dañada)

### 3. **Teeth Regularity** (Regularidad de dientes)
- **Rango**: 0 = muy irregular, 1 = perfectamente regular
- **Implementación**: Control del espaciado y simetría
- **Mapeo**:
  - `jump_boost`: 0.7 (bastante regular - adaptación genética)
  - `damage`: 0.1 (muy irregular - estrés)

### 4. **Teeth Closeness** (Cercanía de dientes)
- **Rango**: 0 = dientes distantes, 1 = muy cerrados
- **Implementación**: Espaciado controlado entre proyecciones
- **Mapeo**:
  - `jump_boost`: 0.8 (muy cerrados)
  - `ice`: 0.3 (moderadamente espaciados)

### 5. **Teeth Rounded** (Dientes redondeados)
- **Rango**: 0 = agudos, 1 = redondeados
- **Implementación**: Forma de las proyecciones
- **Mapeo**:
  - `ice`: 0.7 (dientes redondeados - protección)
  - `jump_boost`: 0.1 (muy agudos - defensivos)

### 6. **Teeth Acute** (Dientes agudos)
- **Rango**: 0 = redondeados, 1 = muy agudos
- **Implementación**: Altitud/acuteness de proyecciones
- **Mapeo**:
  - `jump_boost`: 0.9 (muy agudos - adaptación a altitud)
  - `damage`: 0.7 (predominantemente agudos)

### 7. **Teeth Compound** (Dientes compuestos)
- **Rango**: 0 = sin compuestos, 1 = mayormente compuestos
- **Implementación**: Dientes dentro de dientes (fractal)
- **Mapeo**:
  - `jump_boost`: 0.3 (algunos compuestos)
  - `damage`: 0.5 (malformados/compuestos anómalos)

### 8. **Apex Emarginate** (Ápice emarginado)
- **Rango**: 0 = punta sólida, 1 = profundamente emarginada
- **Implementación**: Muesca/bifurcación en la punta
  - Pequeña muesca a valores bajos
  - Profundamente dividida a valores altos
- **Mapeo**:
  - `speed_boost`: 0.1 (ligeramente emarginada - hojas saludables)
  - `jump_boost`: 0.3 (emarginada moderada)
  - `ice`: 0 (punta afilada - compactación)
  - `slow`: 0.05 (mínima muesca)
  - `damage`: 0.8 (profundamente emarginada - daño crítico)

---

## Mapeo de Zonas a Características

### `speed_boost` (Tropical - alta humedad)
```
Descripción: Hojas grandes, lozanas, sin defensa química
lobed: 0.6      // Moderadamente relajadas
teeth: 0        // Sin defensa mecánica
apexEmarginate: 0.1  // Punta completa pero suave
```

### `jump_boost` (Montaña - altitud alta)
```
Descripción: Hojas pequeñas, dentadas, muy defensivas
lobed: 0.2      // Marco rugoso
teeth: 0.9      // Muy dentada (defensa contra herbívoros)
teethRegularity: 0.7   // Patrón genético claro
teethCloseness: 0.8    // Apretadas
teethAcute: 0.9        // Muy punzantes
teethCompound: 0.3     // Defensa multinivel
apexEmarginate: 0.3    // Bifurcada
```

### `ice` (Frío - estrés térmico)
```
Descripción: Hojas compactas, simples, protegidas
lobed: 0        // Marco simple
teeth: 0.2      // Mínimos (defensa baja)
teethRounded: 0.7   // Suaves (retención de calor)
surface: 0.9    // Muy waxy/cubierta cerosa
thickness: 0.15 // Grosor aumentado
apexEmarginate: 0  // Punta afilada y sólida
```

### `slow` (Sequía - baja humedad)
```
Descripción: Hojas suculentas, sin dientes, ligeramente onduladas
lobed: 0.3      // Ligeramente ondulada
teeth: 0        // Sin dientes (retención hídrica)
thickness: 0.2  // Muy grueso (almacenaje de agua)
apexEmarginate: 0.05 // Punta robusta
```

### `damage` (Toxicidad - estrés crítico)
```
Descripción: Hojas deformadas, anómalas, dañadas
lobed: 0.7      // Muy lobulada/ondulada (deformación)
teeth: 0.6      // Dientes anómalos
teethRegularity: 0.1   // Muy irregular (estrés)
teethCloseness: 0.4    // Inconsistente
teethAcute: 0.7        // Predominantemente agudos
teethCompound: 0.5     // Malformaciones compuestas
apexEmarginate: 0.8    // Muy dañada/dividida
```

---

## Cómo Funciona el Morphing

1. **Entrada en zona**: Jugador detectado en zona → `getLeafPropertiesFromZone()` retorna scores
2. **Interpolación**: `morphLeafProperties()` interpola suavemente entre estado anterior y nuevo
3. **Generación geométrica**: `generateLeafGeometry()` crea geometría con:
   - Ondulaciones (lobed)
   - Proyecciones dentadas (teeth, acuteness)
   - Muesca de ápice (apexEmarginate)
4. **CLAMP en todos los niveles**:
   - Parámetros de zona clampeados
   - Interpolación clampeada
   - Generación geométrica clampeada

---

## Código Clave

### Ejemplo: Generación con lóbulos y dientes
```typescript
// Lóbulos - ondulaciones sinusoidales en bordes
const lobeFrequency = 3 + props.lobed * 4;
const lobeAmplitude = leafWidth * props.lobed * 0.3;
const lobeWave = Math.sin(v * Math.PI * lobeFrequency) * lobeAmplitude;
leafWidth += lobeWave;

// Dientes - proyecciones controladas
const teethFrequency = 8 + props.teeth * 12;
const isToothPeak = teethShape > 0.7;
if (isToothPeak && props.teeth > Math.random()) {
  const toothAmount = leafWidth * props.teeth * 0.2;
  leafWidth += toothAmount;
}

// Ápice emarginado
if (v > 0.9 && props.apexEmarginate > 0) {
  const notchDepth = Math.pow(v - 0.9, 2) / 0.01 * props.apexEmarginate;
  apexModifier = 1.0 - notchDepth * 0.3;
}
```

---

## Visualización Esperada

### Speed Boost Zone
- Hoja grande, suave, con ondulaciones moderadas
- Sin proyecciones dentadas
- Punta ligeramente redondeada
- Color verde vibrante

### Jump Boost Zone
- Hoja pequeña con fila de dientes pequeños y afilados
- Bordes rugosos (lobed)
- Punta bifurcada
- Color dorado (altitud solar)

### Ice Zone
- Hoja pequeña y compacta, muy simple
- Sin dientes visibles
- Bordes lisos y suaves
- Color azul frío

### Damage Zone
- Hoja severamente deformada
- Lóbulos anómalos
- Dientes irregulares y agudos
- Punta profundamente dañada/bifurcada
- Color rojo oxidado

---

## Escalabilidad

El sistema es completamente extensible:
- **Nuevas zonas**: simplemente añade parámetros en `getLeafPropertiesFromZone()`
- **Nuevas características**: añade propiedades a `LeafProperties` y actualiza `generateLeafGeometry()`
- **Nuevos valores**: todos están clampeados entre 0-1, por lo que son resistentes a errores

