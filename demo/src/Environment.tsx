import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import ProceduralFlower from './components/ProceduralFlower';
import TailPlant from './components/ProceduralTailPlant';
import { useInfluenceZones } from './context/InfluenceZoneContext';
import { InfluenceZoneVisualizer } from './components/InfluenceZoneVisualizer';
import { PlayerPositionTracker } from './hooks/usePlayerPositionTracking';
import { getLeafPropertiesFromZone } from './systems/LeafGeometrySystem';

// Map zone type to plant type and color
const zonePlantMap: Record<string, { plant: 'flower' | 'tail'; color: string }> = {
  'ice': { plant: 'flower', color: '#A8D8EA' },
  'jump_boost': { plant: 'flower', color: '#FFE066' },
  'damage': { plant: 'tail', color: '#E85D75' },
  'slow': { plant: 'tail', color: '#9B8B7D' },
  'speed_boost': { plant: 'flower', color: '#7FD8BE' },
};

// Helper: render plants for each zone
function ZonePlants({ zones }: { zones: any[] }) {
  return (
    <group>
      {zones.map((zone, i) => {
        const map = zonePlantMap[zone.type] || { plant: 'flower', color: '#7FD8BE' };
        const leafProps = getLeafPropertiesFromZone(zone.type);
        const pos = zone.position;
        // Place several plants per zone in a circle
        const count = 5;
        const radius = Math.max(1, zone.radius * 0.7);
        return Array.from({ length: count }).map((_, j) => {
          const angle = (j / count) * Math.PI * 2;
          const px = pos.x + Math.cos(angle) * radius;
          const pz = pos.z + Math.sin(angle) * radius;
          const py = pos.y;
          if (map.plant === 'flower') {
            return (
              <ProceduralFlower
                key={zone.id + '-f' + j}
                seed={i * 10 + j}
                position={[px, py + 0.1, pz]}
                color={map.color}
                petals={Math.round(4 + leafProps.width * 8)}
                radius={0.2 + leafProps.width * 0.15}
                height={0.5 + leafProps.length * 0.5}
              />
            );
          } else {
            return (
              <TailPlant
                key={zone.id + '-t' + j}
                segments={Math.round(8 + leafProps.surface * 8)}
                length={0.8 + leafProps.length * 0.8}
                color={new THREE.Color(map.color)}
                position={[px, py + 0.1, pz]}
              />
            );
          }
        });
      })}
    </group>
  );
}

// Moving Platform Component with Player Carrying
function MovingPlatform({ position, color = '#38a169' }: { position: [number, number, number], color?: string }) {
  const rigidBodyRef = useRef<any>();
  const timeRef = useRef(0);
  const previousPositionRef = useRef({ x: position[0], y: position[1], z: position[2] });
  const [playersOnPlatform, setPlayersOnPlatform] = useState<Set<any>>(new Set());

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (rigidBodyRef.current) {
      // Calculate new position
      const x = position[0] + Math.sin(timeRef.current * 2) * 2; // Reduced to 2 units
      const y = position[1];
      const z = position[2];
      
      // Calculate movement delta
      const deltaX = x - previousPositionRef.current.x;
      const deltaZ = z - previousPositionRef.current.z;
      
      // Move any players that are on this platform
      playersOnPlatform.forEach(playerBody => {
        if (playerBody && playerBody.translation) {
          const currentPos = playerBody.translation();
          playerBody.setTranslation({
            x: currentPos.x + deltaX,
            y: currentPos.y,
            z: currentPos.z + deltaZ
          }, true);
        }
      });
      
      // Update platform position
      rigidBodyRef.current.setNextKinematicTranslation({ x, y, z });
      
      // Store previous position
      previousPositionRef.current = { x, y, z };
    }
  });

  const handleCollisionEnter = (payload: any) => {
    // Check if it's the player (you might need to adjust this check based on your player setup)
    if (payload.other.rigidBodyObject?.name === 'player' || 
        payload.other.rigidBody?.userData?.isPlayer) {
      setPlayersOnPlatform(prev => new Set(prev).add(payload.other.rigidBody));
    }
  };

  const handleCollisionExit = (payload: any) => {
    if (payload.other.rigidBodyObject?.name === 'player' || 
        payload.other.rigidBody?.userData?.isPlayer) {
      setPlayersOnPlatform(prev => {
        const newSet = new Set(prev);
        newSet.delete(payload.other.rigidBody);
        return newSet;
      });
    }
  };

  return (
    <RigidBody 
      ref={rigidBodyRef} 
      position={position} 
      type="kinematicPosition" 
      colliders="cuboid"
      onCollisionEnter={handleCollisionEnter}
      onCollisionExit={handleCollisionExit}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 0.5, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        MOVING
      </Text>
    </RigidBody>
  );
}

// Swinging Target Component
function SwingingTarget({ position }: { position: [number, number, number] }) {
  const rigidBodyRef = useRef<any>();
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (rigidBodyRef.current) {
      const swingAngle = Math.sin(timeRef.current * 1.5) * 0.5; // Swing back and forth
      const radius = 3;
      const x = position[0] + Math.sin(swingAngle) * radius;
      const y = position[1] - Math.cos(swingAngle) * radius + radius;
      const z = position[2];
      rigidBodyRef.current.setNextKinematicTranslation({ x, y, z });
    }
  });

  return (
    <RigidBody friction={0.5} ref={rigidBodyRef} position={position} type="kinematicPosition" colliders="cuboid">
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color={'#e53e3e'} />
      </mesh>
      <Text
        position={[0, 0, 0.9]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        SWING
      </Text>
    </RigidBody>
  );
}

// Component to track player position and update zone state
function PlayerZoneTracker() {
  return <PlayerPositionTracker />;
}

// Component to initialize and manage influence zones
function ZoneManager() {
  const { addZone, zones } = useInfluenceZones();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Initialize zones with environmental parameters
    addZone({
      id: 'ice_zone_1',
      type: 'ice',
      position: new THREE.Vector3(15, 1.5, 10),
      radius: 4,
      color: '#87CEEB',
      intensity: 0.8,
      description: 'Cold alpine zone - compact leaves',
      environment: {
        humidity: 0.3,      // Low humidity (cold air doesn't hold water)
        altitude: 3500,     // High altitude
        pressure: 1000,     // Low pressure
        temperature: -5,    // Freezing
        toxicity: 0.2,
      },
    });

    addZone({
      id: 'speed_boost_1',
      type: 'speed_boost',
      position: new THREE.Vector3(-12, 1.5, -8),
      radius: 3.5,
      color: '#00FF00',
      intensity: 1.0,
      description: 'Tropical zone - broad leaves',
      environment: {
        humidity: 0.95,     // Very high humidity
        altitude: 100,      // Low altitude
        pressure: 1013,     // Sea level
        temperature: 28,    // Warm tropical
        toxicity: 0.0,      // No stress
      },
    });

    addZone({
      id: 'jump_boost_1',
      type: 'jump_boost',
      position: new THREE.Vector3(0, 2, -30),
      radius: 4,
      color: '#FFD700',
      intensity: 0.9,
      description: 'Mountain peak - narrow leaves',
      environment: {
        humidity: 0.4,      // Moderate-low humidity
        altitude: 4000,     // Very high altitude
        pressure: 900,      // Very low pressure
        temperature: -10,   // Cold
        toxicity: 0.1,
      },
    });

    addZone({
      id: 'damage_zone_1',
      type: 'damage',
      position: new THREE.Vector3(25, 1.5, -15),
      radius: 5,
      color: '#FF6B6B',
      intensity: 0.7,
      description: 'High pressure zone - stunted growth',
      environment: {
        humidity: 0.5,
        altitude: 200,
        pressure: 1500,     // Very high pressure (crushing)
        temperature: 15,
        toxicity: 0.9,      // High toxicity/stress
      },
    });

    addZone({
      id: 'slow_zone_1',
      type: 'slow',
      position: new THREE.Vector3(-25, 1.5, -15),
      radius: 4.5,
      color: '#8B4513',
      intensity: 0.8,
      description: 'Desert zone - thick waxy leaves',
      environment: {
        humidity: 0.1,      // Extremely low humidity
        altitude: 500,      // Mid altitude
        pressure: 1010,     // Normal
        temperature: 38,    // Hot
        toxicity: 0.3,
      },
    });

    // Additional zones closer to spawn for easier testing
    addZone({
      id: 'speed_boost_test',
      type: 'speed_boost',
      position: new THREE.Vector3(5, 1.5, -3),
      radius: 3,
      color: '#00FF00',
      intensity: 1.0,
      description: 'Speed boost - testing zone',
      environment: {
        humidity: 0.9,
        altitude: 150,
        pressure: 1012,
        temperature: 25,
        toxicity: 0.0,
      },
    });

    addZone({
      id: 'jump_boost_test',
      type: 'jump_boost',
      position: new THREE.Vector3(-5, 1.5, 5),
      radius: 3,
      color: '#FFD700',
      intensity: 0.9,
      description: 'Jump boost - testing zone',
      environment: {
        humidity: 0.3,
        altitude: 3800,
        pressure: 950,
        temperature: -8,
        toxicity: 0.1,
      },
    });

    addZone({
      id: 'ice_zone_test',
      type: 'ice',
      position: new THREE.Vector3(0, 1.5, -8),
      radius: 3,
      color: '#87CEEB',
      intensity: 0.8,
      description: 'Ice zone - testing',
      environment: {
        humidity: 0.35,
        altitude: 3200,
        pressure: 1005,
        temperature: -3,
        toxicity: 0.15,
      },
    });
  }, [addZone]);

  return null;
}

export function Environment() {
  const { zones } = useInfluenceZones();

  return (
    <>
      <ZoneManager />
      <PlayerZoneTracker />

      {/* Render zone visualizers */}
      {zones.map(zone => (
        <InfluenceZoneVisualizer key={zone.id} zone={zone} />
      ))}

      {/* Render plants for each zone */}
      <ZonePlants zones={zones} />

      {/* Ground */}
      <RigidBody position={[0, 0, 0]} type="fixed" colliders="cuboid">
        <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color={'#4a5568'} />
        </mesh>
      </RigidBody> 
     

      {/* Target 2 - Moving Target */}
      <MovingPlatform position={[8, 0, -15]} color="brown" />


      {/* Platforms and Obstacles - Adjusted for 0.5 unit jump height */}
      
      {/* Platform 1 - Low platform (jumpable) */}
      <RigidBody position={[15, 0.4, 10]} type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 0.3, 6]} />
          <meshStandardMaterial color={'#2d3748'} />
        </mesh>
      </RigidBody>
      
      {/* Platform 1 Low Wall for cover */}
      <RigidBody position={[15, 1, 7]} type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 1, 0.5]} />
          <meshStandardMaterial color={'#4a5568'} />
        </mesh>
      </RigidBody>

      {/* Platform 2 - Step platform (0.3 units high - easily jumpable) */}
      <RigidBody position={[-12, 0.3, -8]} type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 0.3, 8]} />
          <meshStandardMaterial color={'#2d3748'} />
        </mesh>
      </RigidBody>

      {/* Cover Boxes */}
      <RigidBody position={[5, 1, 0]} type="dynamic" friction={0.8} colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color={'#8b4513'} />
        </mesh>
      </RigidBody>

      <RigidBody position={[-5, 0.75, 5]} type="dynamic" friction={0.8} colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 1.5, 1]} />
          <meshStandardMaterial color={'#8b4513'} />
        </mesh>
      </RigidBody>

      <RigidBody position={[10, 0.5, -5]} type="dynamic" friction={0.8} colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1, 3]} />
          <meshStandardMaterial color={'#8b4513'} />
        </mesh>
      </RigidBody>


      {/* Walls for Cover */}
      <RigidBody position={[0, 1.5, -30]} type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[20, 3, 1]} />
          <meshStandardMaterial color={'#718096'} />
        </mesh>
      </RigidBody>

      <RigidBody position={[25, 1.5, -15]} type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 3, 20]} />
          <meshStandardMaterial color={'#718096'} />
        </mesh>
      </RigidBody>

      <RigidBody position={[-25, 1.5, -15]} type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 3, 20]} />
          <meshStandardMaterial color={'#718096'} />
        </mesh>
      </RigidBody>

      {/* Ramps for Parkour - Lower angle for easier access */}
      <RigidBody position={[12, 0.2, 2]} type="fixed" colliders="trimesh">
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI/12]}>
          <boxGeometry args={[4, 0.2, 3]} />
          <meshStandardMaterial color={'#2d3748'} />
        </mesh>
      </RigidBody>

      <RigidBody position={[-12, 0.2, 2]} type="fixed" colliders="trimesh">
        <mesh castShadow receiveShadow rotation={[0, 0, -Math.PI/12]}>
          <boxGeometry args={[4, 0.2, 3]} />
          <meshStandardMaterial color={'#2d3748'} />
        </mesh>
      </RigidBody>

      {/* Low Platforms - All within jump reach */}
      <RigidBody position={[0, 0.4, -5]} type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 0.3, 3]} />
          <meshStandardMaterial color={'#2d3748'} />
        </mesh>
      </RigidBody>

      <RigidBody position={[2, 0.9, -2]} type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.3, 2]} />
          <meshStandardMaterial color={'#2d3748'} />
        </mesh>
      </RigidBody>

      <RigidBody position={[-3, 1.4, -1]} type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.3, 2]} />
          <meshStandardMaterial color={'#2d3748'} />
        </mesh>
      </RigidBody>

      {/* Destructible Targets - More responsive to hits */}
      <RigidBody position={[-3, 1.9, 1]} type="dynamic" friction={0.3} colliders="cuboid" mass={0.1}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 3, 0.2]} />
          <meshStandardMaterial color={'#ed8936'} />
        </mesh>
        <Text
          position={[0, 0, 0.11]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          50pts
        </Text>
      </RigidBody>

      <RigidBody position={[-20, 1.5, -18]} type="dynamic" friction={0.3} colliders="cuboid" mass={0.1}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 3, 0.2]} />
          <meshStandardMaterial color={'brown'} />
        </mesh>
        <Text
          position={[0, 0, 0.11]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          50pts
        </Text>
      </RigidBody>


      <RigidBody position={[-6, 1.5, -7]} type="dynamic" friction={0.3} colliders="cuboid" mass={0.1}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 3, 0.2]} />
          <meshStandardMaterial color={'brown'} />
        </mesh>
        <Text
          position={[0, 0, 0.11]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          50pts
        </Text>
      </RigidBody>


      <RigidBody position={[0, 1.5, 18]} type="dynamic" friction={0.3} colliders="cuboid" mass={0.1}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 3, 0.2]} />
          <meshStandardMaterial color={'brown'} />
        </mesh>
        <Text
          position={[0, 0, 0.11]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          50pts
        </Text>
      </RigidBody>

      {/* Additional Moving Target */}
      <MovingPlatform position={[-10, 0.8, -12]} color="brown" />

      {/* Swinging Target - Now actually swings */}
      <SwingingTarget position={[0, 6, -15]} />

      {/* Range Markers */}
      <Text
        position={[0, 0.1, -10]}
        fontSize={1}
        color="#718096"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
      >
        10m
      </Text>

      <Text
        position={[0, 0.1, -20]}
        fontSize={1}
        color="#718096"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
      >
        20m
      </Text>

      <Text
        position={[0, 0.1, -30]}
        fontSize={1}
        color="#718096"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI/2, 0, 0]}
      >
        30m
      </Text>
    </>
  );
}
