# TPS-Controls

A comprehensive, production-ready **third-person shooter controls** package for React Three Fiber applications. Built with React, Three.js, and Rapier Physics.

[![npm version](https://badge.fury.io/js/tps-controls.svg)](https://www.npmjs.com/package/tps-controls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Physics-Based Movement** - Realistic movement powered by Rapier Physics
- **Third-Person Camera** - Smart camera with collision detection and zoom (ADS)
- **Animation System** - 9 blended animations (idle, walk, run, strafe, jump)
- **Shooting Mechanics** - Raycasting with recoil and muzzle flash effects
- **Positional Audio** - 3D sound effects for immersive gameplay
- **Zero-Friction Setup** - Works out of the box with CDN-hosted assets
- **Fully Customizable** - Modular architecture with extensive prop options
- **TypeScript** - Full type safety and IntelliSense support

## Quick Start

### Installation

```bash
npm install tps-controls
# or
pnpm add tps-controls
# or
yarn add tps-controls
```

### Peer Dependencies

This package requires the following dependencies in your project:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "three": "^0.153.0",
    "@react-three/fiber": "^8.14.0",
    "@react-three/drei": "^9.92.0",
    "@react-three/rapier": "^1.3.0"
  }
}
```

### Basic Usage

```tsx
import { Canvas } from '@react-three/fiber'
import { Physics, Debug } from '@react-three/rapier'
import { Player } from 'tps-controls'
import { Sky, Environment } from '@react-three/drei'

function App() {
  return (
    <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }}>
      <Physics debug={false} timeStep="vary">
        <Player />
        {/* Your game environment here */}
      </Physics>
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="city" />
    </Canvas>
  )
}
```

## Controls

| Input | Action |
|-------|--------|
| `WASD` / Arrow Keys | Movement |
| `Mouse` | Look around |
| `Space` | Jump |
| `Shift` | Run |
| `Right Mouse` (Hold) | Aim / Zoom |
| `Left Click` | Shoot |

## API Reference

### Player Props

The `Player` component accepts the following props:

```typescript
interface PlayerProps {
  // Asset Paths (optional - CDN defaults provided)
  modelPath?: string
  animationPaths?: {
    idle?: string
    walkForward?: string
    walkBackward?: string
    runForward?: string
    runBackward?: string
    strafeLeft?: string
    strafeRight?: string
    jumpStart?: string
    jumpEnd?: string
  }
  audioPath?: string

  // Physics Properties
  colliderArgs?: [height: number, radius: number] // default: [0.5, 0.3]
  mass?: number           // default: 5
  restitution?: number    // default: 0.3 (bounciness)
  friction?: number       // default: 0.5
  linearDamping?: number  // default: 0.1
  angularDamping?: number // default: 0.1

  // Rendering Options
  castShadow?: boolean    // default: false
  receiveShadow?: boolean // default: false

  // Standard React Three Fiber props
  ...React.ComponentProps<'group'>
}
```

### Examples

#### Custom Model and Animations

```tsx
<Player
  modelPath="/models/my-character.glb"
  animationPaths={{
    idle: "/animations/idle.fbx",
    walkForward: "/animations/walk.fbx",
    runForward: "/animations/run.fbx",
    jumpStart: "/animations/jump-start.fbx",
    jumpEnd: "/animations/jump-end.fbx"
  }}
/>
```

#### Physics Configuration

```tsx
<Player
  colliderArgs={[0.6, 0.25]}  // Taller, narrower collider
  mass={10}                    // Heavier character
  friction={0.8}               // More grip
  linearDamping={0.05}         // Less slide
/>
```

#### Enable Shadows

```tsx
<Player
  castShadow={true}
  receiveShadow={true}
/>
```

## Module Structure

The package is built with a modular architecture. Each system can be imported separately:

```tsx
// Individual modules
import { useCamera } from 'tps-controls/modules/player/camera'
import { useMovement } from 'tps-controls/modules/player/movement'
import { useShooting } from 'tps-controls/modules/player/shooting'
import { useJump } from 'tps-controls/modules/player/jump'
import { useRecoil } from 'tps-controls/modules/player/recoil'
import { useMuzzleFlash } from 'tps-controls/modules/player/muzzleFlash'
import { useAnimationSetup } from 'tps-controls/modules/player/useAnimationSetup'
import { usePhysics } from 'tps-controls/modules/player/physics'

// Utilities
import { preloadAssets } from 'tps-controls/utils/preload'
import { defaultAssetPaths } from 'tps-controls/modules/player/assetPaths'
```

## Customization

### Movement Speed

Edit the constants in your local copy or create a wrapper:

```tsx
// Default: MOVE_SPEED = 2, RUN_MULTIPLIER = 2
// You can modify these by forking the package or
// adjusting the physics velocity in your own implementation
```

### Camera Settings

Camera behavior is controlled by:
- `DEFAULT_CAMERA_FOV = 75` - Normal field of view
- `ZOOM_CAMERA_FOV = 50` - Aim-down-sights FOV
- Distance and collision rays in `camera.ts`

### Recoil and Shooting

```tsx
// RECOIL_STRENGTH = 0.1
// RECOIL_DURATION = 150ms
// MUZZLE_FLASH_DURATION = 50ms
```

## Demo

Run the demo to see TPS-Controls in action:

```bash
git clone https://github.com/Soham1803/third-person-shooter-controls.git
cd third-person-shooter-controls
pnpm install
pnpm run dev
```

The demo includes:
- Moving platforms
- Swinging targets
- Physics-based obstacles
- Destructible objects
- Distance markers

## Asset Requirements

### Default Assets (CDN-Hosted)

The package includes default assets hosted on CDN:

- **Model**: Character with rigged skeleton
- **Animations**: 9 FBX animations (idle, walk, run, strafe, jump)
- **Audio**: Pistol gunshot sound
- **Textures**: Muzzle flash, bullet hole

### Custom Asset Requirements

If providing custom assets:

#### 3D Model
- Format: `.glb` (GLTF binary)
- Must have a rigged skeleton with these bones:
  - `mixamorigHips`
  - `mixamorigSpine`
  - `mixamorigSpine1`
  - `mixamorigSpine2`
  - `mixamorigNeck`
  - `mixamorigHead`
  - `mixamorigLeftShoulder`, `mixamorigLeftArm`, `mixamorigLeftForeArm`, `mixamorigLeftHand`
  - `mixamorigRightShoulder`, `mixamorigRightArm`, `mixamorigRightForeArm`, `mixamorigRightHand`
  - `mixamorigLeftUpLeg`, `mixamorigLeftLeg`, `mixamorigLeftFoot`
  - `mixamorigRightUpLeg`, `mixamorigRightLeg`, `mixamorigRightFoot`

#### Animations
- Format: `.fbx` animations
- Named animations: `Idle`, `WalkForward`, `RunForward`, etc.

#### Audio
- Format: `.mp3` or `.wav`
- Recommended: Short, looped gunshot sound

## Development

### Project Structure

```
TPS-Controls/
├── package/              # NPM package source
│   ├── src/
│   │   ├── Player.tsx   # Main Player component
│   │   ├── index.ts     # Package exports
│   │   └── modules/     # Modular systems
│   └── dist/            # Built output
├── demo/                # Demo application
│   ├── src/
│   │   ├── App.tsx
│   │   └── Environment.tsx
│   └── public/          # Assets
└── scripts/             # Build utilities
```

### Building

```bash
# Build the package
pnpm --filter tps-controls run build

# Watch mode for development
pnpm run dev:watch
```

## Technical Details

### Physics Integration

Uses **Rapier Physics** for:
- Velocity-based movement
- Ground detection via raycasting
- Collision response with environment
- Jump impulse application
- Shooting hit detection with impulse

### Animation System

Built on **Three.js AnimationMixer**:
- Smooth blending between animations
- Priority-based action transitions
- Animation duration tracking
- Jump animation synchronization

### Camera System

- Third-person follow camera
- Multi-ray collision detection
- Dynamic FOV adjustment (ADS)
- Conservative clipping prevention

## Troubleshooting

### Player not visible
- Check that your `<Physics>` component wraps the `<Player>`
- Verify `modelPath` is correct or use CDN default
- Check browser console for asset loading errors

### Animations not playing
- Ensure animation paths are correct
- Check that model bones match expected names
- Verify animations load in Network tab

### Camera clipping through walls
- Adjust collision ray distances in `camera.ts`
- Ensure environment has colliders

### Poor performance
- Disable shadows: `castShadow={false}`
- Reduce physics debug visualization
- Optimize model geometry

## License

MIT © [Soham1803](https://github.com/Soham1803)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

Built with:
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [React Three Rapier](https://pmndrs.github.io/react-three-rapier/)
- [Drei](https://github.com/pmndrs/drei)
- [Three.js](https://threejs.org/)
