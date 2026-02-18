import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import VoxelGrid from './VoxelGrid';
import { useVoxelEngine } from '../hooks/useVoxelEngine';
import { clampToGrid } from '../utils/voxelMath';

/**
 * Inner scene component that uses Three.js hooks
 * Must be inside Canvas component
 */
const SceneContent = ({ handPosition, gesture, onVoxelCountChange }) => {
  const { camera } = useThree();
  const [cursorPosition, setCursorPosition] = useState(null);
  const {
    voxels,
    currentColor,
    addVoxel,
    removeVoxel,
    clearAll,
    voxelCount
  } = useVoxelEngine(16);

  const lastGestureRef = useRef(null);
  const lastActionTimeRef = useRef(0);
  const gestureStartTimeRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  // Update parent with voxel count
  useEffect(() => {
    if (onVoxelCountChange) {
      onVoxelCountChange(voxelCount);
    }
  }, [voxelCount, onVoxelCountChange]);

  // Raycasting logic
  const updateCursorPosition = useCallback(() => {
    if (!handPosition) {
      setCursorPosition(null);
      return;
    }

    const mouse = new THREE.Vector2();
    mouse.x = handPosition.x * 2 - 1;
    mouse.y = -(handPosition.y * 2 - 1);

    raycaster.setFromCamera(mouse, camera);

    const intersection = new THREE.Vector3();
    const intersects = raycaster.ray.intersectPlane(plane, intersection);

    if (intersects) {
      const gridSize = 16;
      const gridX = clampToGrid(Math.floor(intersection.x + gridSize / 2), gridSize);
      const gridZ = clampToGrid(Math.floor(intersection.z + gridSize / 2), gridSize);
      const gridY = 0;

      setCursorPosition({ x: gridX, y: gridY, z: gridZ });
    } else {
      setCursorPosition(null);
    }
  }, [handPosition, camera]);

  useEffect(() => {
    updateCursorPosition();
  }, [updateCursorPosition]);

  // Gesture handling
  useEffect(() => {
    if (!cursorPosition || !gesture) return;

    const now = Date.now();
    const COOLDOWN_MS = 300;
    const HOLD_TIME_MS = 200;

    if (gesture !== lastGestureRef.current) {
      gestureStartTimeRef.current = now;
      lastGestureRef.current = gesture;
      return;
    }

    const holdTime = now - gestureStartTimeRef.current;
    if (holdTime < HOLD_TIME_MS) return;

    if (now - lastActionTimeRef.current < COOLDOWN_MS) return;

    if (gesture === 'pinch') {
      addVoxel(cursorPosition.x, cursorPosition.y, cursorPosition.z);
      lastActionTimeRef.current = now;
    } else if (gesture === 'fist') {
      removeVoxel(cursorPosition.x, cursorPosition.y, cursorPosition.z);
      lastActionTimeRef.current = now;
    } else if (gesture === 'open_palm') {
      if (voxelCount > 0) {
        clearAll();
        lastActionTimeRef.current = now;
      }
    }
  }, [cursorPosition, gesture, addVoxel, removeVoxel, clearAll, voxelCount]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.3} />

      <VoxelGrid 
        voxels={voxels}
        cursorPosition={cursorPosition}
        gridSize={16}
        currentColor={currentColor}
      />

      <OrbitControls 
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
      />
    </>
  );
};

/**
 * VoxelScene component
 * Main 3D scene with voxel grid and gesture controls
 */
const VoxelScene = ({ handPosition, gesture }) => {
  const [voxelCount, setVoxelCount] = useState(0);

  return (
    <div className="relative w-full h-full bg-gray-950">
      <Canvas camera={{ position: [12, 12, 12], fov: 50 }} shadows>
        <SceneContent 
          handPosition={handPosition} 
          gesture={gesture}
          onVoxelCountChange={setVoxelCount}
        />
      </Canvas>

      {/* Voxel count overlay */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Voxels</div>
        <div className="text-2xl font-bold font-mono text-blue-400">
          {voxelCount}
        </div>
      </div>

      {/* Gesture hint */}
      {gesture && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="text-sm text-white">
            {gesture === 'pinch' && '👌 Pinch to place voxel'}
            {gesture === 'fist' && '✊ Fist to remove voxel'}
            {gesture === 'open_palm' && '✋ Open palm to clear all'}
            {gesture === 'point' && '👉 Point to preview'}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoxelScene;
