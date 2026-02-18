import { useState, useEffect } from 'react';
import {
  detectPinch,
  detectOpenPalm,
  detectFist,
  detectPoint,
  getNormalizedPosition
} from '../utils/gestureDetection';

/**
 * Custom hook for gesture recognition
 * Returns current gesture and hand position
 */
export const useGestureDetection = (landmarks) => {
  const [gesture, setGesture] = useState(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!landmarks) {
      setGesture(null);
      setPosition(null);
      return;
    }

    // Detect gestures in priority order
    let detectedGesture = 'none';
    
    if (detectPinch(landmarks)) {
      detectedGesture = 'pinch';
    } else if (detectPoint(landmarks)) {
      detectedGesture = 'point';
    } else if (detectFist(landmarks)) {
      detectedGesture = 'fist';
    } else if (detectOpenPalm(landmarks)) {
      detectedGesture = 'open_palm';
    }

    setGesture(detectedGesture);
    setPosition(getNormalizedPosition(landmarks));
  }, [landmarks]);

  return {
    gesture,
    position
  };
};
