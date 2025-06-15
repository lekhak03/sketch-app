import React from 'react';
import { Eraser, Undo, Redo, Trash2, Brush } from 'lucide-react';
import { BrushSelector } from './BrushSelector';
import { ColorPicker } from './ColorPicker';
import { StrokeWidthSelector } from './StrokeWidthSelector';
import { BrushType, Tool } from '../types/drawing';

interface ToolbarProps {
  brushType: BrushType;
  strokeWidth: number;
  color: string;
  backgroundColor: string;
  tool: Tool;
  onBrushChange: (brush: BrushType) => void;
  onStrokeWidthChange: (width: number) => void;
  onColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const strokeColors = [
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
];

const backgroundColors = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#1F2937' },
  { name: 'Warm Yellow', value: '#FEF3C7' },
  { name: 'Soft Orange', value: '#FFEDD5' },
  { name: 'Calm Blue', value: '#DBEAFE' },
  { name: 'Muted Gray', value: '#F3F4F6' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  brushType,
  strokeWidth,
  color,
  backgroundColor,
  tool,
  onBrushChange,
  onStrokeWidthChange,
  onColorChange,
  onBackgroundColorChange,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-6">
      {/* Tool Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Tool</label>
        <div className="flex gap-2">
          <button
            onClick={() => onToolChange('brush')}
            className={`p-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 ${
              tool === 'brush'
                ? 'border-blue-300 bg-blue-50 text-blue-600'
                : 'border-gray-200 text-gray-600'
            }`}
            title="Brush"
          >
            <Brush size={18} />
          </button>
          <button
            onClick={() => onToolChange('eraser')}
            className={`p-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 ${
              tool === 'eraser'
                ? 'border-blue-300 bg-blue-50 text-blue-600'
                : 'border-gray-200 text-gray-600'
            }`}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>
        </div>
      </div>

      {/* Brush Selector - only show when brush tool is selected */}
      {tool === 'brush' && (
        <BrushSelector
          selectedBrush={brushType}
          onBrushChange={onBrushChange}
        />
      )}

      {/* Stroke Width */}
      <StrokeWidthSelector
        strokeWidth={strokeWidth}
        onStrokeWidthChange={onStrokeWidthChange}
      />

      {/* Stroke Color - only show when brush tool is selected */}
      {tool === 'brush' && (
        <ColorPicker
          selectedColor={color}
          onColorChange={onColorChange}
          colors={strokeColors}
          label="Stroke Color"
        />
      )}

      {/* Background Color */}
      <ColorPicker
        selectedColor={backgroundColor}
        onColorChange={onBackgroundColorChange}
        colors={backgroundColors}
        label="Background"
      />

      {/* Actions */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Actions</label>
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              canUndo
                ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                : 'border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              canRedo
                ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                : 'border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <Redo size={18} />
          </button>
          <button
            onClick={onClear}
            className="p-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
            title="Clear Canvas"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};