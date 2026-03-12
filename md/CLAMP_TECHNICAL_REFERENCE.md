# CLAMP Implementation Technical Reference

## Files Modified for CLAMP System

### 1. `demo/src/systems/LeafGeometrySystem.ts`

#### Updated Interface
```typescript
export interface LeafProperties {
  // Basic morphology (original)
  width: number;           // 0-1: narrow to broad
  length: number;          // 0.5-1.5: leaf length
  pointiness: number;      // 0-1: rounded to sharp
  surface: number;         // 0-1: smooth to bumpy
  thickness: number;       // 0-1: thin to thick

  // CLAMP paleobotanical scoring (new)
  lobed: number;           // 0-1: unlobed to heavily lobed
  teeth: number;           // 0-1: untoothed to heavily toothed
  teethRegularity: number; // 0-1: irregular to perfectly regular
  teethCloseness: number;  // 0-1: distant to close teeth
  teethRounded: number;    // 0-1: acute to rounded tooth shape
  teethAcute: number;      // 0-1: rounded to very acute tooth tip
  teethCompound: number;   // 0-1: no compound teeth to all compound
  apexEmarginate: number;  // 0-1: solid apex to deeply notched/bifurcated
}
```

#### Key Functions

**`clampLeafProperties(props: Partial<LeafProperties>): LeafProperties`**
- Clamps all 13 properties to their valid ranges
- Width/pointiness/surface/thickness/lobes/teeth/regularity/closeness/rounded/acute/compound/apex: 0-1
- Length: 0.5-1.5
- Provides fallback defaults for missing properties

**`generateLeafGeometry(props: LeafProperties): THREE.BufferGeometry`**
- Creates 2D procedural leaf with 64 segments
- Applies lobing through sinusoidal edge modulation
- Applies teeth through peak detection and projection
- Applies apex emargination by modifying tip coordinates
- Returns BufferGeometry with position, normal, and UV attributes

**`getLeafPropertiesFromZone(type: string): LeafProperties`**
- Maps zone type to complete CLAMP profile
- Returns Partial<LeafProperties> which is clamped immediately
- All 5 zone types have unique botanical signatures

**`morphLeafProperties(from: LeafProperties, to: LeafProperties, progress: number): LeafProperties`**
- Interpolates all 13 properties linearly (0 to 1 progress)
- Applies clamping post-interpolation to ensure validity
- Called during zone transitions to create smooth animations

---

### 2. `demo/src/context/LeafMorphHistoryContext.tsx`

#### Updated Context State
```typescript
const DEFAULT_LEAF: LeafProperties = {
  width: 0.5,
  length: 1.0,
  pointiness: 0.5,
  surface: 0.3,
  thickness: 0.1,
  // CLAMP defaults - start at neutral/untoothed/unslobed
  lobed: 0,
  teeth: 0,
  teethRegularity: 0.5,
  teethCloseness: 0,
  teethRounded: 0.5,
  teethAcute: 0.5,
  teethCompound: 0,
  apexEmarginate: 0,
};
```

#### Updated Hook
**`blendLeafProperties(a: LeafProperties, b: LeafProperties, weightB: number): LeafProperties`**
- Blends two complete LeafProperties using weighted average
- Each property uses proper range clamping:
  ```typescript
  width: clamp(lerp(a.width, b.width, w), 0, 1),
  // ... x13 total properties ...
  length: clamp(lerp(a.length, b.length, w), 0.5, 1.5),
  ```
- Used when player is in two zones simultaneously
- Returns accumulated morphology across zone visits

**`recordZoneMorph(zoneId: string, props: LeafProperties): void`**
- Stores morphology properties for specific zone
- Called on first zone entry to establish zone baseline
- Enables persistence - exiting and re-entering same zone maintains state

**`getCurrentMorph(): LeafProperties`**
- Returns accumulated morphology from all visited zones
- Accumulation uses `blendLeafProperties()` with equal weighting
- Provides final leaf characteristics for rendering

---

### 3. `demo/src/components/AdaptiveLeafMesh.tsx`

#### Shader Integration
- Uses `generateLeafGeometry()` to create mesh
- Passes LeafProperties to botanical GLSL shader
- Shader highlights features:
  - Vein intensity (uVeinIntensity) increased to 0.5
  - Normal calculation enhanced for lobes/teeth shadows
  - Morphing transitions include particle glow effect

#### Rendering Updates
```typescript
const geometry = useMemo(() => {
  const leaf = getLeafPropertiesFromZone(zone);
  return generateLeafGeometry(leaf);
}, [zone, properties]);
```

---

## Zone-to-Morphology Mapping

### Complete CLAMP Profiles by Zone

| Zone | lobed | teeth | regularity | closeness | rounded | acute | compound | apex |
|------|-------|-------|-----------|-----------|---------|-------|----------|------|
| speed_boost | 0.6 | 0.0 | -* | -* | 0.5 | 0.5 | 0 | 0.1 |
| jump_boost | 0.2 | 0.9 | 0.7 | 0.8 | 0.1 | 0.9 | 0.3 | 0.3 |
| ice | 0.0 | 0.2 | 0.5 | 0.3 | 0.7 | 0.3 | 0 | 0.0 |
| slow | 0.3 | 0.0 | -* | -* | 0.5 | 0.5 | 0 | 0.05 |
| damage | 0.7 | 0.6 | 0.1 | 0.4 | 0.3 | 0.7 | 0.5 | 0.8 |

*\* - Not specified, defaults to 0.5 (neutral)*

### Environmental Significance

- **speed_boost**: Rich/humid environment → Large, relaxed, unarmed leaves (tropical)
- **jump_boost**: High altitude/thin air → Small, heavily armed, precision teeth (alpine)
- **ice**: Cold/stress → Compact, simple, waxy protection (cryophyte)
- **slow**: Dry/drought → Thick, smooth, water-retention focus (xerophyte)
- **damage**: Toxic/polluted → Deformed, irregular, critical stress response (dystrophic)

---

## Clamping Implementation Details

### Three Layers of Clamping

**Layer 1: Zone Generation**
```typescript
function getLeafPropertiesFromZone(type: string): LeafProperties {
  const raw = zones[type]; // May be partial/invalid
  return clampLeafProperties(raw); // Ensures 0-1 ranges
}
```

**Layer 2: Morphing Interpolation**
```typescript
function morphLeafProperties(from, to, progress) {
  const raw = { // Interpolate each property
    width: lerp(from.width, to.width, progress),
    // ... x12 more ...
  };
  return clampLeafProperties(raw); // Ensure bounds respected
}
```

**Layer 3: Accumulation/Blending**
```typescript
const current = blendLeafProperties(prev, newest, 0.5);
// Each blend operation respects individual property ranges
```

### Why Three Layers?

1. **Zone Generation**: Typos or invalid data from developer never escape to rendering
2. **Morphing**: Floating-point interpolation can exceed bounds slightly; clanp ensures validity
3. **Blending**: Multiple zone contributions could accumulate out of range; clamping keeps sane

---

## Procedural Geometry Generation

### Lobe Generation
```typescript
if (props.lobed > 0) {
  const lobeFrequency = 3 + props.lobed * 4;     // 3-7 lobe cycles
  const lobeAmplitude = leafWidth * props.lobed * 0.3;
  const lobeWave = Math.sin(v * Math.PI * lobeFrequency) * lobeAmplitude * baseTaper;
  leafWidth += lobeWave;
}
```
- Frequency increases with lobation level
- Amplitude scaled by width for proportionality
- Applied as additive sine wave to base outline

### Tooth Generation
```typescript
if (props.teeth > 0) {
  const teethFrequency = 8 + props.teeth * 12;  // 8-20 teeth total
  const teethShape = Math.sin(v * Math.PI * teethFrequency);
  const isToothPeak = teethShape > 0.7;
  
  if (isToothPeak && Math.random() < teethRegularity) {
    const shapeBlend = lerp(
      teethRounded * 0.65,  // Rounded = wider base
      teethAcute * 1.35,     // Acute = narrow base
      teethShape
    );
    // Apply tooth projection
  }
}
```
- Frequency determines tooth count
- Regularity controls randomness of placement
- Shape splits between rounded (wider) and acute (narrow)

### Apex Emargination
```typescript
if (v > 0.9 && props.apexEmarginate > 0) {
  const tipProgress = (v - 0.9) / 0.1;
  const notchDepth = Math.pow(tipProgress, 2) * props.apexEmarginate;
  apexModifier = 1.0 - notchDepth * 0.3; // Creates V-notch
}
```
- Activates only in tip region (v > 0.9)
- Quadratic depth curve for smooth notching
- Reduces width modifier to create visible indentation

---

## Testing Checklist

- [ ] Speed boost zone: Large, smooth lobes (0.6), no teeth
- [ ] Jump boost zone: Small, many fine acute teeth (0.9), bifurcated tip (0.3 apex)
- [ ] Ice zone: Tiny, simple, rounded minimal teeth
- [ ] Slow zone: Large, thick, no teeth, simple apex
- [ ] Damage zone: Deformed, irregular teeth, deep notch at apex (0.8)
- [ ] Morphing smooth: Zone transitions blend all 13 properties
- [ ] Persistence: Revisiting zone maintains stored morphology
- [ ] No glitches: Procedure geometry smooth without holes/artifacts
- [ ] Plant variation: Flowers/plants on floor scale with morphology

---

## Performance Notes

- `generateLeafGeometry()` called ~O(n) times per frame (n = number of visible leaves)
- 64 segment leaf = 320 vertices, ~2KB per geometry
- Clamping is negligible cost (O(1) per property)
- Morphing interpolation O(13) operations = minimal overhead

---

## Future Extensions

1. **Apex shapes**: Add bifurcate/truncate vs emarginate variants
2. **Lobe types**: Pinnate vs palmate vs costate variants
3. **Tooth types**: Dentate, serrate, crenate differentiation
4. **Texture mapping**: CLAMP scores could drive procedural texture generation
5. **Animation**: Tooth angle could respond to wind simulation
6. **Compound features**: Factorial compound teeth (teeth on teeth on teeth)

