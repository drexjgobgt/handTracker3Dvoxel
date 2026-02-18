import { useEffect, useRef, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

/**
 * Custom hook for MediaPipe hand tracking
 * Returns webcam video ref, canvas ref, and hand landmarks
 */
export const useHandTracking = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hands, setHands] = useState(null);
  const [camera, setCamera] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize MediaPipe Hands
    const handsInstance = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    handsInstance.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    handsInstance.onResults(onResults);
    setHands(handsInstance);

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (hands && videoRef.current && !camera) {
      const cameraInstance = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      cameraInstance.start();
      setCamera(cameraInstance);
      setIsReady(true);
    }
  }, [hands]);

  const onResults = (results) => {
    if (!canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);

    // Draw video frame (non-mirrored for accurate tracking)
    canvasCtx.drawImage(results.image, 0, 0, width, height);
    canvasCtx.restore();

    // Draw hand landmarks
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const handLandmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, handLandmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        drawLandmarks(canvasCtx, handLandmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        });
      }

      // Update landmarks state for gesture detection
      setLandmarks(results.multiHandLandmarks[0]);
    } else {
      setLandmarks(null);
    }
  };

  return {
    videoRef,
    canvasRef,
    landmarks,
    isReady
  };
};
