import { useState, useCallback } from 'react';
import { getVoxelKey, parseVoxelKey, isInBounds } from '../utils/voxelMath';

/**
 * Custom hook for voxel engine management
 * Handles voxel placement, removal, and state
 */
export const useVoxelEngine = (initialGridSize = 16) => {
  const [voxels, setVoxels] = useState(new Map());
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [currentColor, setCurrentColor] = useState('#4F46E5'); // Indigo-600

  // Add voxel at position
  const addVoxel = useCallback((x, y, z, color = currentColor) => {
    if (!isInBounds(x, y, z, gridSize)) return false;

    const key = getVoxelKey(x, y, z);
    setVoxels(prev => {
      const newVoxels = new Map(prev);
      newVoxels.set(key, {
        color,
        timestamp: Date.now()
      });
      return newVoxels;
    });
    return true;
  }, [currentColor, gridSize]);

  // Remove voxel at position
  const removeVoxel = useCallback((x, y, z) => {
    const key = getVoxelKey(x, y, z);
    setVoxels(prev => {
      const newVoxels = new Map(prev);
      newVoxels.delete(key);
      return newVoxels;
    });
    return true;
  }, []);

  // Get voxel at position
  const getVoxelAt = useCallback((x, y, z) => {
    const key = getVoxelKey(x, y, z);
    return voxels.get(key) || null;
  }, [voxels]);

  // Clear all voxels
  const clearAll = useCallback(() => {
    setVoxels(new Map());
  }, []);

  // Export voxel data
  const exportVoxels = useCallback(() => {
    const data = [];
    voxels.forEach((voxel, key) => {
      const { x, y, z } = parseVoxelKey(key);
      data.push({ x, y, z, ...voxel });
    });
    return data;
  }, [voxels]);

  // Import voxel data
  const importVoxels = useCallback((data) => {
    const newVoxels = new Map();
    data.forEach(({ x, y, z, color, timestamp }) => {
      const key = getVoxelKey(x, y, z);
      newVoxels.set(key, { color, timestamp: timestamp || Date.now() });
    });
    setVoxels(newVoxels);
  }, []);

  return {
    voxels,
    gridSize,
    currentColor,
    setCurrentColor,
    setGridSize,
    addVoxel,
    removeVoxel,
    getVoxelAt,
    clearAll,
    exportVoxels,
    importVoxels,
    voxelCount: voxels.size
  };
};
