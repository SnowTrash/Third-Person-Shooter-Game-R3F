# Paleobotanical Leaf Adaptation System

## Concept Overview

The game world presents a **paleobotanical experience** where zones represent distinct environmental conditions. Players explore environments with different atmospheric, altitude, and humidity characteristics. As they move through these zones, a living leaf in the 3D mini-visualizer **morphs in real-time** to show botanical adaptations to those conditions.

This system demonstrates how ancient plants evolved leaf morphologies in response to environmental stress, pressure, and resource availability.

## System Architecture

### 1. Environmental Conditions (Context)
Location: [`demo/src/context/InfluenceZoneContext.tsx`](demo/src/context/InfluenceZoneContext.tsx)

Each zone includes `EnvironmentalConditions`:
- **humidity** (0-1): Water availability in air
  - 0.1 = Arid desert
  - 0.9 = Tropical rainforest
- **altitude** (meters): Sea level to mountain tops (100-4000m)
- **pressure** (mb): Atmospheric pressure (900-1500 mb)
  - Low pressure = Thin air at high altitude
  - High pressure = Crushing atmospheric stress
- **temperature** (°C): Climate condition (-10°C to 38°C)
- **toxicity** (0-1): Environmental stress/pollution level

### 2. Leaf Geometry System
Location: [`demo/src/systems/LeafGeometrySystem.ts`](demo/src/systems/LeafGeometrySystem.ts)

**Generates procedural botanical leaf geometry** with properties:
- **width**: Controls leaf blade width (0.2 = narrow, 0.8 = broad)
- **length**: Blade length multiplier relative to stem
- **pointiness**: Tip acuteness (0.2 = rounded, 0.9 = sharp spines)
- **surface**: Texture complexity (0.2 = smooth, 0.9 = bumpy/hairy)
- **thickness**: 3D depth for volumetric rendering

**Zone-to-Adaptation Mapping**:

| Zone | Condition | Leaf Adaptation | Width | Pointiness | Thickness |
|------|-----------|-----------------|-------|-----------|-----------|
| **speed_boost** | High Humidity | Broad, smooth leaves | 0.8 | 0.2 | 0.12 |
| **jump_boost** | High Mountain | Narrow, spiky defense | 0.3 | 0.8 | 0.18 |
| **ice** | Cold/Protected | Compact, rolled edges | 0.4 | 0.6 | 0.15 |
| **slow** | Drought/Arid | Thick, waxy succulents | 0.6 | 0.3 | 0.2 |
| **damage** | Pressure/Toxic | Severely stunted growth | 0.2 | 0.9 | 0.08 |

### 3. Leaf Mesh Component
Location: [`demo/src/components/AdaptiveLeafMesh.tsx`](demo/src/components/AdaptiveLeafMesh.tsx)

**Renders an animated 3D leaf** with:
- **Real-time morphing** between leaf shapes as zone changes (0.5s transition)
- **Botanical shader** with:
  - Vein pattern generation (main vein + secondary branches)
  - Stomata simulation (gas exchange pores)
  - Diffuse lighting with natural coloration
  - Morphing glow effect during transitions
- **Continuous rotation** to showcase leaf from multiple angles
- **Spore particle system** during transitions (see below)

### 4. Spore Particle System
Location: [`demo/src/components/SporeEffectMesh.tsx`](demo/src/components/SporeEffectMesh.tsx)

**Biological spore/pollen particle effects** for visual feedback:
- 48-64 particles per transition
- Simulated physics: gravity (0.5 m/s²), velocity damping
- Spiral motion and drift patterns
- Zone-colored particles matching leaf pigmentation
- Lifecycle: 0.3-0.8 seconds with fade-out
- Visible during leaf morphing transitions only

### 5. Mini Visualizer Integration
Location: [`demo/src/components/ZoneMiniVisualizerAdvanced.tsx`](demo/src/components/ZoneMiniVisualizerAdvanced.tsx)

**3D Canvas overlay** (bottom-right, z-index 9999) displaying:
- Adaptive leaf rendered with proper lighting
- Real-time zone detection and leaf morphing
- Zone-specific colors based on pigmentation:
  - **speed_boost**: Vibrant green (#7FD8BE) - chlorophyll-rich
  - **jump_boost**: Golden yellow (#FFE066) - high altitude adaptation
  - **ice**: Cool blue (#A8D8EA) - cold stress pigments
  - **slow**: Warm brown (#9B8B7D) - drought protective colors
  - **damage**: Deep red (#E85D75) - stress anthocyanin response
- Backdrop blur effect for depth
- Border glow matching zone type

### 6. Zone Environment Parameters
Location: [`demo/src/Environment.tsx`](demo/src/Environment.tsx)

Example zone with environmental conditions:
```typescript
addZone({
  id: 'speed_boost_1',
  type: 'speed_boost',
  position: new THREE.Vector3(-12, 1.5, -8),
  radius: 3.5,
  description: 'Tropical zone - broad leaves',
  environment: {
    humidity: 0.95,     // Rainforest humidity
    altitude: 100,      // Lowland elevation
    pressure: 1013,     // Sea level pressure
    temperature: 28,    // Warm tropical climate
    toxicity: 0.0,      // No environmental stress
  },
});
```

## Player Experience

### Exploration Narrative
Players move through the game world encountering distinct environmental zones. Each zone visually and mechanically represents a different stress condition:
- **Tropical zones** provide speed boosts (resource abundance)
- **Mountain zones** provide jump boosts (light, thin air)
- **Desert zones** slow movement (water scarcity)
- **High-pressure zones** stunt growth and cause damage
- **Cold zones** compact and protect leaves

### Visual Feedback Loop
1. **Player enters zone** → Zone detection triggers
2. **Leaf begins morphing** → Smooth 0.5-second interpolation
3. **Spore particles** → Biological adaptation particles drift outward
4. **New leaf shape** → Represents adaptation to current environmental conditions
5. **Continuous rotation** → Shows leaf characteristics from multiple angles
6. **Zone label** → HUD displays zone name and "Morphing" status

### Gameplay Integration
- **Shift key sprint** affected by zone type
- **Jump height** boosted in mountain zones (2.7x impulse)
- **Movement speed** increased in tropical zones, decreased in deserts
- **Health impact** in high-pressure toxic zones

## Technical Implementation Details

### Procedural Leaf Generation
The leaf geometry is generated algorithmically using:
1. **Midrib (center vein)** constructed from bezier segments
2. **Width variation** along length (narrower at tip following botanical realism)
3. **Pointiness deformation** using sine-wave amplitude control
4. **UV mapping** for vein pattern projection
5. **Normal computation** via Three.js computeVertexNormals()

### Botanical Shader Features
**Vertex Shader**:
- Position morphing during transitions
- Wave animation for organic motion
- Normal calculations for lighting

**Fragment Shader**:
- Vein pattern generation using noise functions
- Stomata (pore) simulation with grid-based placement
- Diffuse lighting with natural green coloration
- Transition glow effect (blue-green hue during morphing)
- Opacity pulsing synchronized with morph progress

### Performance Optimization
- Single leaf mesh (efficient geometry)
- Particle system uses buffer attributes (GPU-accelerated)
- Spore particles only visible during transitions (0.5-0.8s)
- Separate Canvas overlay prevents scene occlusion
- Z-index: 9999 ensures visibility above 3D scene

## Paleobotanical Learning Outcomes

Through this system, players learn:
1. **Leaf morphology** responds to environmental stress (real botanical principle)
2. **Humidity adaptation**: High humidity → broad leaves (water regulation)
3. **Altitude adaptation**: High altitude → narrow leaves, spiky defenses
4. **Drought response**: Low humidity → thick, waxy leaves (water storage)
5. **Pressure sensitivity**: Atmospheric pressure can stunt plant growth
6. **Photosynthetic efficiency**: Leaf shape optimizes for available light

## Visual Design Philosophy

The system emphasizes:
- **Biological authenticity** in leaf morphologies
- **Smooth transitions** showing adaptation as continuous process
- **Color-coded zones** using real plant pigmentation
- **Particle effects** suggesting spore dispersal and biological processes
- **Educational narrative** without explicit text (learning through observation)

## Future Enhancement Opportunities

1. **Seasonal variations**: Zones change environmental conditions over game time
2. **Genetic drift**: Leaf shapes diverge based on player's traversal patterns
3. **Fossil records**: Players can "unlock" ancient leaf forms based on zone visits
4. **Cross-breeding**: Combining leaf traits from multiple environmental exposures
5. **Ecosystem simulation**: Other organisms adapt alongside player observations
6. **Detailed venation**: Procedurally generated vein patterns matching real species

## Files Modified/Created

### New Components
- ✅ [`demo/src/components/AdaptiveLeafMesh.tsx`](demo/src/components/AdaptiveLeafMesh.tsx)
- ✅ [`demo/src/components/SporeEffectMesh.tsx`](demo/src/components/SporeEffectMesh.tsx)

### New Systems
- ✅ [`demo/src/systems/LeafGeometrySystem.ts`](demo/src/systems/LeafGeometrySystem.ts)

### Updated Components
- ✅ [`demo/src/components/ZoneMiniVisualizerAdvanced.tsx`](demo/src/components/ZoneMiniVisualizerAdvanced.tsx) - Replaced shape morphing with leaf morphing
- ✅ [`demo/src/context/InfluenceZoneContext.tsx`](demo/src/context/InfluenceZoneContext.tsx) - Added EnvironmentalConditions interface
- ✅ [`demo/src/Environment.tsx`](demo/src/Environment.tsx) - Added environmental parameters to all zones

## Testing Zones

Quick testing by moving to these spawn-adjacent zones:
- **Speed boost test** at (5, 1.5, -3) - 3 unit radius (tropical)
- **Jump boost test** at (-5, 1.5, 5) - 3 unit radius (mountain)
- **Ice zone test** at (0, 1.5, -8) - 3 unit radius (cold)

Watch the leaf in the mini-visualizer morph smoothly as you enter and exit zones!

---

**Game Concept**: A paleobotanical exploration game where zones represent environmental conditions, and leaf morphologies serve as visual representation of botanical adaptation to stress.
