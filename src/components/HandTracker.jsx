import { useHandTracking } from '../hooks/useHandTracking';
import { useGestureDetection } from '../hooks/useGestureDetection';
import { useFPS } from '../hooks/useFPS';
import VoxelScene from './VoxelScene';

/**
 * Main hand tracking component with integrated voxel builder
 * Split view: hand tracking on left, 3D voxel scene on right
 */
const HandTracker = () => {
  const { videoRef, canvasRef, landmarks, isReady } = useHandTracking();
  const { gesture, position } = useGestureDetection(landmarks);
  const fps = useFPS();

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="py-4 px-6 bg-gray-800 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-white">
          Hand Tracking Voxel Builder
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isReady ? '✓ Tracking active' : '⏳ Initializing...'}
        </p>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Hand Tracking */}
        <div className="lg:w-1/3 flex flex-col bg-gray-900 p-4 border-r border-gray-700">
          {/* Video Canvas */}
          <div className="relative rounded-lg overflow-hidden shadow-2xl mb-4">
            <video
              ref={videoRef}
              className="hidden"
              playsInline
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="w-full border-2 border-blue-500 rounded-lg"
            />
            
            {/* FPS Counter */}
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
              <div className="text-xs text-gray-400">FPS</div>
              <div className={`text-lg font-bold font-mono ${
                fps >= 30 ? 'text-green-400' : fps >= 15 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {fps}
              </div>
            </div>
          </div>

          {/* Gesture Info */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-3">
              Gesture Detection
            </h2>
            
            <div className="space-y-2">
              {/* Current Gesture */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Current:</span>
                <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${
                  gesture && gesture !== 'none' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {gesture || 'none'}
                </span>
              </div>

              {/* Position */}
              {position && (
                <div className="text-xs text-gray-500 space-y-1">
                  <div>X: {position.x.toFixed(3)}</div>
                  <div>Y: {position.y.toFixed(3)}</div>
                  <div>Z: {position.z.toFixed(3)}</div>
                </div>
              )}
            </div>

            {/* Controls Legend */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">
                Controls:
              </h3>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>👌 <span className="text-white">Pinch</span> - Place voxel</li>
                <li>✊ <span className="text-white">Fist</span> - Remove voxel</li>
                <li>✋ <span className="text-white">Open palm</span> - Clear all</li>
                <li>👉 <span className="text-white">Point</span> - Preview</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel - 3D Voxel Scene */}
        <div className="lg:w-2/3 flex-1">
          <VoxelScene handPosition={position} gesture={gesture} />
        </div>
      </div>
    </div>
  );
};

export default HandTracker;

