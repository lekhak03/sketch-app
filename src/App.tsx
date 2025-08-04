import { useEffect, useState } from 'react';
import { Brush, Eraser, Trash2, Download, Palette, Settings, X, Check } from 'lucide-react';
import { useCanvas } from './hooks/useCanvas';
import { exportPng } from './hooks/utils'

function App() {

  const backgroundColors = [
    // Neutral colors
    { color: '#ffffff', name: 'White', category: 'neutral' },
    { color: '#1a1a1a', name: 'Black', category: 'neutral' },
    { color: '#F2F2F7', name: 'Light Gray', category: 'neutral' },
    { color: '#8E8E93', name: 'Gray', category: 'neutral' },
    
    // Vibrant colors
    { color: '#FF3B30', name: 'Red', category: 'vibrant' },
    { color: '#007AFF', name: 'Blue', category: 'vibrant' },
    { color: '#FF9500', name: 'Orange', category: 'vibrant' },
    { color: '#34C759', name: 'Green', category: 'vibrant' },
    { color: '#AF52DE', name: 'Purple', category: 'vibrant' },
    { color: '#FF2D92', name: 'Pink', category: 'vibrant' },
    { color: '#FFCC00', name: 'Yellow', category: 'vibrant' },
    { color: '#5856D6', name: 'Indigo', category: 'vibrant' },
  ];

  const currentBackgroundColor = localStorage.getItem('backgroundColor');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [backgroundColor, setBackgroundColor] = useState<string>(currentBackgroundColor || '#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const footerHeight = 40;

  const {
    canvasRef,
    startDrawing,
    draw,
    paths,
    stopDrawing,
    clearCanvas,
    handleDatabaseUpdate,
    redrawPaths,
  } = useCanvas(backgroundColor);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - footerHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      localStorage.setItem('backgroundColor', backgroundColor)
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let savedPathsString = localStorage.getItem('drawPaths');
    const savedPaths = savedPathsString ? JSON.parse(savedPathsString) : [];

    if (savedPaths.length > 0) { redrawPaths(savedPaths) }
    else redrawPaths(paths);

  }, [backgroundColor, startDrawing]);

  useEffect(() => {
    handleDatabaseUpdate();
  }, []);

  // handle the main calls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDraw = (event: MouseEvent | TouchEvent) => {
      draw(event, tool);
    };

    const handleStartDrawing = (event: MouseEvent | TouchEvent) => {
      startDrawing(event, tool);
    };

    // Mouse events
    canvas.addEventListener('mousedown', handleStartDrawing);
    canvas.addEventListener('mousemove', handleDraw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('mouseover', stopDrawing);
    canvas.addEventListener('mousedown', stopDrawing);
    canvas.addEventListener('click', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', handleStartDrawing);
    canvas.addEventListener('touchmove', handleDraw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    return () => {
      // drawing mouse
      canvas.removeEventListener('mousedown', handleStartDrawing);
      canvas.removeEventListener('mousemove', handleDraw);
      // stop drawing
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mousedown', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('mouseover', stopDrawing);
      canvas.removeEventListener('click', stopDrawing);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);

      // drawing touch
      canvas.removeEventListener('touchstart', handleStartDrawing);
      canvas.removeEventListener('touchmove', handleDraw);
    };
  }, [startDrawing, draw, stopDrawing, redrawPaths]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.color-picker') && !target.closest('.color-toggle')) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportPng(canvasRef?.current?.toDataURL('image/png') || '');
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      clearCanvas();
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsClearing(false);
    }
  };

  const neutralColors = backgroundColors.filter(color => color.category === 'neutral');
  const vibrantColors = backgroundColors.filter(color => color.category === 'vibrant');

  return (
    <div className="relative w-screen h-screen overflow-hidden"
      style={{
        backgroundColor,
        touchAction: 'none'
      }}>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          backgroundColor,
          cursor: tool === 'eraser'
            ? "url('/eraser.cur'), auto"
            : "url('/pencil.cur'), crosshair",
          touchAction: 'none'
        }}
      />

      {/* Top Toolbar - Modern iOS Style */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 animate-fade-in">
        
        {/* Tool Selection */}
        <div className="flex bg-white/80 backdrop-blur-xl rounded-2xl shadow-ios-lg border border-white/40 overflow-hidden">
          <button
            onClick={() => setTool('pen')}
            className={`px-4 py-3 transition-all duration-300 ease-out flex items-center gap-2 ${
              tool === 'pen'
                ? 'bg-ios-blue text-white shadow-lg'
                : 'text-ios-gray-700 hover:bg-ios-gray-50 active:scale-95'
            }`}
          >
            <Brush size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Pen</span>
          </button>
          <div className="w-px bg-ios-gray-200"></div>
          <button
            onClick={() => setTool('eraser')}
            className={`px-4 py-3 transition-all duration-300 ease-out flex items-center gap-2 ${
              tool === 'eraser'
                ? 'bg-ios-blue text-white shadow-lg'
                : 'text-ios-gray-700 hover:bg-ios-gray-50 active:scale-95'
            }`}
          >
            <Eraser size={20} strokeWidth={2} />
            <span className="text-sm font-medium">Eraser</span>
          </button>
        </div>

        {/* Color Picker Toggle */}
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="color-toggle p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-ios-lg border border-white/40 text-ios-gray-700 hover:bg-ios-gray-50 transition-all duration-300 ease-out hover:scale-105 active:scale-95"
        >
          <Palette size={20} strokeWidth={2} />
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-ios-lg border border-white/40 transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
            isExporting 
              ? 'text-ios-gray-400 cursor-not-allowed' 
              : 'text-ios-green hover:bg-ios-green/10'
          }`}
        >
          {isExporting ? (
            <div className="w-5 h-5 border-2 border-ios-gray-300 border-t-ios-green rounded-full animate-spin"></div>
          ) : (
            <Download size={20} strokeWidth={2} />
          )}
        </button>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          disabled={isClearing}
          className={`p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-ios-lg border border-white/40 transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
            isClearing 
              ? 'text-ios-gray-400 cursor-not-allowed' 
              : 'text-ios-red hover:bg-ios-red/10'
          }`}
        >
          {isClearing ? (
            <div className="w-5 h-5 border-2 border-ios-gray-300 border-t-ios-red rounded-full animate-spin"></div>
          ) : (
            <Trash2 size={20} strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Export Success Toast */}
      {showExportSuccess && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 animate-slide-up">
          <div className="bg-ios-green/90 backdrop-blur-xl rounded-2xl shadow-ios-lg border border-ios-green/20 px-4 py-3 flex items-center gap-2">
            <Check size={16} className="text-white" />
            <span className="text-white text-sm font-medium">Image exported successfully!</span>
          </div>
        </div>
      )}

      {/* Enhanced Color Picker Panel - Fixed Positioning */}
      {showColorPicker && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 color-picker">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-ios-xl border border-white/40 p-6 max-w-sm animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ios-gray-900">Background Color</h3>
              <button
                onClick={() => setShowColorPicker(false)}
                className="p-1 rounded-full hover:bg-ios-gray-100 transition-colors"
              >
                <X size={16} className="text-ios-gray-500" />
              </button>
            </div>

            {/* Neutral Colors */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-ios-gray-600 mb-2">Neutral</h4>
              <div className="flex flex-wrap gap-2">
                {neutralColors.map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => {
                      setBackgroundColor(color);
                      setShowColorPicker(false);
                    }}
                    className={`w-10 h-10 rounded-xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
                      backgroundColor === color
                        ? 'ring-3 ring-ios-blue ring-offset-2 shadow-lg scale-110'
                        : 'ring-1 ring-ios-gray-200 hover:ring-ios-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>
            </div>

            {/* Vibrant Colors */}
            <div>
              <h4 className="text-sm font-medium text-ios-gray-600 mb-2">Vibrant</h4>
              <div className="flex flex-wrap gap-2">
                {vibrantColors.map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => {
                      setBackgroundColor(color);
                      setShowColorPicker(false);
                    }}
                    className={`w-10 h-10 rounded-xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
                      backgroundColor === color
                        ? 'ring-3 ring-ios-blue ring-offset-2 shadow-lg scale-110'
                        : 'ring-1 ring-ios-gray-200 hover:ring-ios-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Bar - iOS Style with Dynamic Background */}
      <div 
        className="absolute bottom-0 left-0 right-0 backdrop-blur-xl"
        style={{
          backgroundColor: backgroundColor === '#1a1a1a' 
            ? 'rgba(26, 26, 26, 0.8)' 
            : backgroundColor === '#ffffff'
            ? 'rgba(255, 255, 255, 0.8)'
            : `${backgroundColor}CC`
        }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2" style={{ color: backgroundColor === '#1a1a1a' ? '#ffffff' : '#374151' }}>
            <div className={`w-2 h-2 rounded-full ${tool === 'pen' ? 'bg-ios-blue' : 'bg-ios-gray-400'}`}></div>
            <span className="text-sm font-medium">{tool === 'pen' ? 'Drawing' : 'Erasing'}</span>
          </div>
          
          <div className="text-xs font-medium" style={{ color: backgroundColor === '#1a1a1a' ? '#9CA3AF' : '#6B7280' }}>
            Made with ❤️ by Lekhak
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ios-green"></div>
            <span className="text-sm font-medium" style={{ color: backgroundColor === '#1a1a1a' ? '#ffffff' : '#374151' }}>Connected</span>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-20 right-6 md:hidden">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-14 h-14 bg-ios-blue rounded-full shadow-ios-xl text-white flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95"
        >
          <Palette size={24} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default App;