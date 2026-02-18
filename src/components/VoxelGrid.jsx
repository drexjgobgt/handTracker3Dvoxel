import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { parseVoxelKey } from '../utils/voxelMath';

/**
 * VoxelGrid component
 * Renders all placed voxels using instanced mesh for performance
 */
const VoxelGrid = ({ voxels, cursorPosition, gridSize = 16, currentColor, mode = 'build' }) => {
  const meshRef = useRef();
  const cursorRef = useRef();
  const tempMatrix = new THREE.Matrix4();
  const tempColor = new THREE.Color();

  // Update instanced mesh with voxel positions and colors
  useEffect(() => {
    if (!meshRef.current || voxels.size === 0) return;

    let index = 0;
    voxels.forEach((voxel, key) => {
      const { x, y, z } = parseVoxelKey(key);
      
      // Set position (center grid at origin)
      const worldX = x - gridSize / 2 + 0.5;
      const worldY = y + 0.5;
      const worldZ = z - gridSize / 2 + 0.5;
      
      tempMatrix.setPosition(worldX, worldY, worldZ);
      meshRef.current.setMatrixAt(index, tempMatrix);
      
      // Set color
      tempColor.set(voxel.color);
      meshRef.current.setColorAt(index, tempColor);
      
      index++;
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [voxels, gridSize]);

  // Update cursor position
  useEffect(() => {
    if (!cursorRef.current || !cursorPosition) return;

    const worldX = cursorPosition.x - gridSize / 2 + 0.5;
    const worldY = cursorPosition.y + 0.5;
    const worldZ = cursorPosition.z - gridSize / 2 + 0.5;

    cursorRef.current.position.set(worldX, worldY, worldZ);
  }, [cursorPosition, gridSize]);

  return (
    <group>
      {/* Grid helper */}
      <gridHelper args={[gridSize, gridSize]} position={[0, 0, 0]} />
      
      {/* Instanced mesh for voxels */}
      {voxels.size > 0 && (
        <instancedMesh ref={meshRef} args={[null, null, voxels.size]}>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshStandardMaterial />
        </instancedMesh>
      )}
      
      {/* Cursor preview - different styles for build/delete modes */}
      {cursorPosition && (
        <mesh ref={cursorRef}>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          {mode === 'build' ? (
            <meshStandardMaterial 
              color={currentColor} 
              transparent 
              opacity={0.5}
              wireframe={false}
            />
          ) : (
            <meshStandardMaterial 
              color="#EF4444" 
              transparent 
              opacity={0.7}
              wireframe={true}
            />
          )}
        </mesh>
      )}
    </group>
  );
};

export default VoxelGrid;
