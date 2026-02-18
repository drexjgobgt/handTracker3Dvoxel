import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * Handles global keyboard events for app controls
 */
export const useKeyboardShortcuts = ({
  onToggleMode,
  onClearAll,
  onResetCamera,
  onSelectColor,
  voxelCount
}) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in input field
      if (e.target.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case 'm':
          onToggleMode?.();
          break;
        
        case 'c':
          if (voxelCount > 0) {
            if (confirm(`Clear all ${voxelCount} voxels?`)) {
              onClearAll?.();
            }
          }
          break;
        
        case 'r':
          onResetCamera?.();
          break;
        
        // Number keys 1-9 for quick color selection
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          const colorIndex = parseInt(e.key) - 1;
          onSelectColor?.(colorIndex);
          break;
        
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onToggleMode, onClearAll, onResetCamera, onSelectColor, voxelCount]);
};
