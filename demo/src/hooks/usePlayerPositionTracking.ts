import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useInfluenceZones } from '../context/InfluenceZoneContext';

/**
 * Hook to track the player position using intelligent detection
 * Updates the influence zones based on player position
 */
export const usePlayerPositionTracking = () => {
  const { scene, camera } = useThree();
  const { updatePlayerZones } = useInfluenceZones();
  const playerPosRef = useRef(new THREE.Vector3());
  const cachedPlayerGroupRef = useRef<THREE.Group | null>(null);
  const lastFoundTimeRef = useRef(0);
  const smoothedPositionRef = useRef(new THREE.Vector3());

  // Improved player detection
  useEffect(() => {
    const findPlayerGroup = () => {
      if (cachedPlayerGroupRef.current) return;

      let candidates: { obj: THREE.Object3D; priority: number }[] = [];

      scene.traverse((object: any) => {
        // Highest priority: Objects with animations (definitely a character)
        if (object.animations && object.animations.length > 0) {
          candidates.push({ obj: object, priority: 100 });
        }

        // High priority: SkinnedMesh (character model)
        if (object.isSkinnedMesh && object.parent) {
          candidates.push({ obj: object.parent, priority: 90 });
        }

        // Medium priority: Groups with children containing visuals
        if (
          object.isGroup &&
          object.children &&
          object.children.length > 1 &&
          object.children.some((c: any) => c.isMesh || c.isSkinnedMesh)
        ) {
          // Skip if it looks like a zone or other non-player object
          if (!object.name.includes('Zone') && !object.name.includes('zone')) {
            candidates.push({ obj: object, priority: 50 });
          }
        }
      });

      if (candidates.length > 0) {
        candidates.sort((a, b) => b.priority - a.priority);
        cachedPlayerGroupRef.current = candidates[0].obj as THREE.Group;
        lastFoundTimeRef.current = Date.now();
        console.log(`Player found with priority: ${candidates[0].priority}`);
      }
    };

    findPlayerGroup();
  }, [scene]);

  useFrame((state) => {
    let playerPos = new THREE.Vector3();

    // Method 1: Try to use cached player group
    if (cachedPlayerGroupRef.current) {
      cachedPlayerGroupRef.current.updateWorldMatrix(true, false);
      cachedPlayerGroupRef.current.getWorldPosition(playerPos);
    } else {
      // Method 2: Use camera position directly
      // In this setup, the camera closely follows the player
      // The player is generally near the camera position
      playerPos.copy(camera.position);
    }

    // Apply smoothing to reduce jitter
    smoothedPositionRef.current.lerp(playerPos, 0.2);
    playerPosRef.current.copy(smoothedPositionRef.current);

    // Update zones with current player position
    updatePlayerZones(playerPosRef.current);

    // Periodically try to re-find player if not already cached
    if (!cachedPlayerGroupRef.current && Date.now() - lastFoundTimeRef.current > 2000) {
      const findAgain = () => {
        let found = false;
        scene.traverse((object: any) => {
          if (!found && object.animations && object.animations.length > 0) {
            console.log('Found player object:', object.name || 'unnamed');
            cachedPlayerGroupRef.current = object;
            found = true;
          }
        });
      };
      findAgain();
    }
  });

  return playerPosRef;
};

/**
 * Component that automatically tracks player position for zone detection
 */
export const PlayerPositionTracker = () => {
  usePlayerPositionTracking();
  return null;
};
