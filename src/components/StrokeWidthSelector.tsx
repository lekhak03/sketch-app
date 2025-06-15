import React from 'react';

interface StrokeWidthSelectorProps {
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

export const StrokeWidthSelector: React.FC<StrokeWidthSelectorProps> = ({
  strokeWidth,
  onStrokeWidthChange
}) => {
  const widths = [1, 2, 3, 5, 8, 12, 16];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Stroke Width</label>
      <div className="flex gap-2 items-end">
        {widths.map((width) => (
          <button
            key={width}onClick
            ={() => onStrokeWidthChange(width)}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 hover:bg-gray-50 ${
              strokeWidth === width
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200'
            }`}
            title={`${width}px`}
          >
            <div
              className={`rounded-full ${
                strokeWidth === width ? 'bg-blue-600' : 'bg-gray-600'
              }`}
              style={{
                width: Math.max(2, width / 2),
                height: Math.max(2, width / 2)
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};