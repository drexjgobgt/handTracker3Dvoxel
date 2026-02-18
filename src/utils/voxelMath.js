/**
 * Voxel math utilities
 * Helper functions for voxel grid calculations
 */

// Convert world position to grid coordinates
export const worldToGrid = (x, y, z, voxelSize = 1) => {
  return {
    x: Math.floor(x / voxelSize),
    y: Math.floor(y / voxelSize),
    z: Math.floor(z / voxelSize)
  };
};

// Convert grid coordinates to world position (center of voxel)
export const gridToWorld = (gridX, gridY, gridZ, voxelSize = 1) => {
  return {
    x: gridX * voxelSize + voxelSize / 2,
    y: gridY * voxelSize + voxelSize / 2,
    z: gridZ * voxelSize + voxelSize / 2
  };
};

// Generate unique key for voxel position
export const getVoxelKey = (x, y, z) => {
  return `${x},${y},${z}`;
};

// Parse voxel key back to coordinates
export const parseVoxelKey = (key) => {
  const [x, y, z] = key.split(',').map(Number);
  return { x, y, z };
};

// Check if position is within grid bounds
export const isInBounds = (x, y, z, gridSize) => {
  return (
    x >= 0 && x < gridSize &&
    y >= 0 && y < gridSize &&
    z >= 0 && z < gridSize
  );
};

// Clamp value to grid bounds
export const clampToGrid = (value, gridSize) => {
  return Math.max(0, Math.min(gridSize - 1, value));
};
