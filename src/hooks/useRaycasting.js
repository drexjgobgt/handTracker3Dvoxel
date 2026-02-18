import { useState, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { clampToGrid } from '../utils/voxelMath';

/**
 * Custom hook for raycasting from hand position to 3D grid
 * Converts 2D hand coordinates to 3D voxel grid position
 */
export const useRaycasting = (handPosition, gridSize = 16) => {
  const { camera } = useThree();
  const [cursorPosition, setCursorPosition] = useState(null);
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Ground plane at y=0

  const updateCursorPosition = useCallback(() => {
    if (!handPosition) {
      setCursorPosition(null);
      return;
    }

    // Convert hand position (0-1) to NDC (-1 to 1)
    const mouse = new THREE.Vector2();
    mouse.x = handPosition.x * 2 - 1;
    mouse.y = -(handPosition.y * 2 - 1); // Invert Y axis

    // Set raycaster from camera through mouse position
    raycaster.setFromCamera(mouse, camera);

    // Intersect with ground plane
    const intersection = new THREE.Vector3();
    const intersects = raycaster.ray.intersectPlane(plane, intersection);

    if (intersects) {
      // Snap to grid
      const gridX = clampToGrid(Math.floor(intersection.x + gridSize / 2), gridSize);
      const gridZ = clampToGrid(Math.floor(intersection.z + gridSize / 2), gridSize);
      const gridY = 0; // Place on ground level

      setCursorPosition({ x: gridX, y: gridY, z: gridZ });
    } else {
      setCursorPosition(null);
    }
  }, [handPosition, camera, gridSize]);

  useEffect(() => {
    updateCursorPosition();
  }, [updateCursorPosition]);

  return cursorPosition;
};
