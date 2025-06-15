import React from 'react';
import { Pen, Highlighter, Type, Pencil } from 'lucide-react';
import { BrushType } from '../types/drawing';

interface BrushSelectorProps {
  selectedBrush: BrushType;
  onBrushChange: (brush: BrushType) => void;
}

const brushes = [
  { type: 'pen' as BrushType, icon: Pen, name: 'Pen' },
  { type: 'marker' as BrushType, icon: Highlighter, name: 'Marker' },
  { type: 'calligraphy' as BrushType, icon: Type, name: 'Calligraphy' },
  { type: 'pencil' as BrushType, icon: Pencil, name: 'Pencil' },
];

export const BrushSelector: React.FC<BrushSelectorProps> = ({
  selectedBrush,
  onBrushChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Brush Style</label>
      <div className="flex gap-2">
        {brushes.map((brush) => {
          const Icon = brush.icon;
          return (
            <button
              key={brush.type}
              onClick={() => onBrushChange(brush.type)}
              className={`p-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 ${
                selectedBrush === brush.type
                  ? 'border-blue-300 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-600'
              }`}
              title={brush.name}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
};