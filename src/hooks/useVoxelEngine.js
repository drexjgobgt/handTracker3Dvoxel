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

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    const data = exportVoxels();
    const saveData = {
      version: '1.0',
      gridSize,
      voxels: data,
      timestamp: Date.now()
    };
    localStorage.setItem('voxelWorld', JSON.stringify(saveData));
    return true;
  }, [exportVoxels, gridSize]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback(() => {
    const saved = localStorage.getItem('voxelWorld');
    if (!saved) return false;
    
    try {
      const saveData = JSON.parse(saved);
      if (saveData.version === '1.0') {
        importVoxels(saveData.voxels);
        return true;
      }
    } catch (error) {
      console.error('Failed to load voxel world:', error);
    }
    return false;
  }, [importVoxels]);

  // Export as JSON file
  const exportToFile = useCallback(() => {
    const data = exportVoxels();
    const saveData = {
      version: '1.0',
      gridSize,
      voxels: data,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxel-world-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportVoxels, gridSize]);

  // Import from JSON file
  const importFromFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target.result);
        if (saveData.version === '1.0') {
          importVoxels(saveData.voxels);
        }
      } catch (error) {
        console.error('Failed to import voxel world:', error);
      }
    };
    reader.readAsText(file);
  }, [importVoxels]);

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
    saveToLocalStorage,
    loadFromLocalStorage,
    exportToFile,
    importFromFile,
    voxelCount: voxels.size
  };
};
