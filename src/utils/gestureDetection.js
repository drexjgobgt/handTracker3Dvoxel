/**
 * Gesture detection utilities
 * Uses distance and angle thresholds to detect hand gestures
 */

// Calculate Euclidean distance between two landmarks
export const getDistance = (landmark1, landmark2) => {
  const dx = landmark1.x - landmark2.x;
  const dy = landmark1.y - landmark2.y;
  const dz = landmark1.z - landmark2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Calculate angle between three points
export const getAngle = (p1, p2, p3) => {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                  Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
};

// Detect pinch gesture (thumb and index finger close together)
export const detectPinch = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;
  
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const distance = getDistance(thumbTip, indexTip);
  
  // Threshold for pinch detection
  return distance < 0.05;
};

// Detect open palm (all fingers extended)
export const detectOpenPalm = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;
  
  const wrist = landmarks[0];
  const fingerTips = [
    landmarks[4],  // thumb
    landmarks[8],  // index
    landmarks[12], // middle
    landmarks[16], // ring
    landmarks[20]  // pinky
  ];
  
  // Check if all fingertips are far from wrist
  const allExtended = fingerTips.every(tip => {
    const distance = getDistance(wrist, tip);
    return distance > 0.15;
  });
  
  return allExtended;
};

// Detect fist (all fingers curled)
export const detectFist = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;
  
  const wrist = landmarks[0];
  const fingerTips = [
    landmarks[8],  // index
    landmarks[12], // middle
    landmarks[16], // ring
    landmarks[20]  // pinky
  ];
  
  // Check if all fingertips are close to wrist (relaxed threshold for easier detection)
  const allCurled = fingerTips.every(tip => {
    const distance = getDistance(wrist, tip);
    return distance < 0.15;  // Increased from 0.12 to 0.15
  });
  
  return allCurled;
};

// Detect point gesture (only index finger extended)
export const detectPoint = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;
  
  const wrist = landmarks[0];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  const indexExtended = getDistance(wrist, indexTip) > 0.15;
  const middleCurled = getDistance(wrist, middleTip) < 0.15;  // Consistent with fist
  const ringCurled = getDistance(wrist, ringTip) < 0.15;      // Consistent with fist
  const pinkyCurled = getDistance(wrist, pinkyTip) < 0.15;    // Consistent with fist
  
  return indexExtended && middleCurled && ringCurled && pinkyCurled;
};

// Get normalized hand position (0-1 range)
export const getNormalizedPosition = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return null;
  
  // Use index finger tip as reference point
  const indexTip = landmarks[8];
  
  return {
    x: indexTip.x,
    y: indexTip.y,
    z: indexTip.z
  };
};
