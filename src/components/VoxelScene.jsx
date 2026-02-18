import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import VoxelGrid from './VoxelGrid';
import ColorPicker from './ColorPicker';
import ConfirmDialog from './ConfirmDialog';
import { useVoxelEngine } from '../hooks/useVoxelEngine';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { clampToGrid } from '../utils/voxelMath';

/**
 * Inner scene component that uses Three.js hooks
 * Must be inside Canvas component
 */
const SceneContent = ({ handPosition, gesture, mode, onVoxelCountChange, voxelEngineRef }) => {
  const { camera } = useThree();
  const [cursorPosition, setCursorPosition] = useState(null);
  
  const {
    voxels,
    currentColor,
    addVoxel,
    removeVoxel,
    clearAll,
    voxelCount
  } = voxelEngineRef.current;

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

  // Gesture handling with mode support
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

    // Mode-based gesture actions
    if (mode === 'build') {
      if (gesture === 'pinch') {
        addVoxel(cursorPosition.x, cursorPosition.y, cursorPosition.z);
        lastActionTimeRef.current = now;
      } else if (gesture === 'open_palm') {
        if (voxelCount > 0) {
          clearAll();
          lastActionTimeRef.current = now;
        }
      }
    } else if (mode === 'delete') {
      if (gesture === 'pinch' || gesture === 'fist') {
        removeVoxel(cursorPosition.x, cursorPosition.y, cursorPosition.z);
        lastActionTimeRef.current = now;
      }
    }
  }, [cursorPosition, gesture, mode, addVoxel, removeVoxel, clearAll, voxelCount]);

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
        mode={mode}
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
  const [mode, setMode] = useState('build'); // 'build' or 'delete'
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null });
  const fileInputRef = useRef(null);

  const voxelEngine = useVoxelEngine(16);
  const voxelEngineRef = useRef(voxelEngine);
  voxelEngineRef.current = voxelEngine;

  const PRESET_COLORS = [
    '#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
  ];

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggleMode: () => setMode(m => m === 'build' ? 'delete' : 'build'),
    onClearAll: () => {
      setConfirmDialog({
        isOpen: true,
        action: 'clear',
        title: 'Clear All Voxels?',
        message: `This will remove all ${voxelCount} voxels.`
      });
    },
    onResetCamera: () => {
      // Camera reset handled by OrbitControls
    },
    onSelectColor: (index) => {
      if (index < PRESET_COLORS.length) {
        voxelEngine.setCurrentColor(PRESET_COLORS[index]);
      }
    },
    voxelCount
  });

  const handleConfirm = () => {
    if (confirmDialog.action === 'clear') {
      voxelEngine.clearAll();
    } else if (confirmDialog.action === 'load') {
      voxelEngine.loadFromLocalStorage();
    }
    setConfirmDialog({ isOpen: false, action: null });
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      voxelEngine.importFromFile(file);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-950">
      <Canvas camera={{ position: [12, 12, 12], fov: 50 }} shadows>
        <SceneContent 
          handPosition={handPosition} 
          gesture={gesture}
          mode={mode}
          onVoxelCountChange={setVoxelCount}
          voxelEngineRef={voxelEngineRef}
        />
      </Canvas>

      {/* Top Left - Voxel Count */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Voxels</div>
        <div className="text-2xl font-bold font-mono text-blue-400">
          {voxelCount}
        </div>
      </div>

      {/* Top Right - Mode Toggle */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg overflow-hidden flex">
        <button
          onClick={() => setMode('build')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            mode === 'build' 
              ? 'bg-blue-600 text-white' 
              : 'bg-transparent text-gray-400 hover:text-white'
          }`}
        >
          🏗️ Build
        </button>
        <button
          onClick={() => setMode('delete')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            mode === 'delete' 
              ? 'bg-red-600 text-white' 
              : 'bg-transparent text-gray-400 hover:text-white'
          }`}
        >
          🗑️ Delete
        </button>
      </div>

      {/* Bottom Left - Controls */}
      <div className="absolute bottom-4 left-4 space-y-3">
        {/* Color Picker */}
        <ColorPicker 
          currentColor={voxelEngine.currentColor}
          onColorChange={voxelEngine.setCurrentColor}
        />

        {/* Action Buttons */}
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg space-y-2">
          <button
            onClick={() => setConfirmDialog({
              isOpen: true,
              action: 'clear',
              title: 'Clear All Voxels?',
              message: `This will remove all ${voxelCount} voxels.`
            })}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
            disabled={voxelCount === 0}
          >
            🗑️ Clear All
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => voxelEngine.saveToLocalStorage()}
              className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
            >
              💾 Save
            </button>
            <button
              onClick={() => {
                if (voxelCount > 0) {
                  setConfirmDialog({
                    isOpen: true,
                    action: 'load',
                    title: 'Load Saved World?',
                    message: 'This will replace your current voxels.'
                  });
                } else {
                  voxelEngine.loadFromLocalStorage();
                }
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
            >
              📂 Load
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => voxelEngine.exportToFile()}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded transition-colors"
              disabled={voxelCount === 0}
            >
              ⬇️ Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded transition-colors"
            >
              ⬆️ Import
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Shortcuts</h4>
          <ul className="text-xs text-gray-500 space-y-1">
            <li><kbd className="text-white">M</kbd> - Toggle mode</li>
            <li><kbd className="text-white">C</kbd> - Clear all</li>
            <li><kbd className="text-white">1-9</kbd> - Quick colors</li>
          </ul>
        </div>
      </div>

      {/* Bottom Center - Gesture Hint */}
      {gesture && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="text-sm text-white">
            {mode === 'build' && gesture === 'pinch' && '👌 Pinch to place voxel'}
            {mode === 'delete' && (gesture === 'pinch' || gesture === 'fist') && '✊ Pinch/Fist to remove voxel'}
            {gesture === 'open_palm' && mode === 'build' && '✋ Open palm to clear all'}
            {gesture === 'point' && '👉 Point to preview'}
          </div>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, action: null })}
      />
    </div>
  );
};

export default VoxelScene;
