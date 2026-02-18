/**
 * ColorPicker component
 * Allows users to select voxel colors from presets or custom input
 */
const ColorPicker = ({ currentColor, onColorChange }) => {
  const PRESET_COLORS = [
    '#4F46E5', // Indigo
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Violet
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">Color</h3>
      
      {/* Preset Colors Grid */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
              currentColor === color ? 'border-white scale-110' : 'border-gray-600'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">Custom:</label>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-12 h-8 rounded cursor-pointer bg-gray-700 border border-gray-600"
        />
        <input
          type="text"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="flex-1 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white font-mono"
          placeholder="#4F46E5"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
