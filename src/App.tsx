import { useEffect, useState } from 'react';
import { Brush, Eraser, Trash2 } from 'lucide-react';
import { useCanvas } from './hooks/useCanvas';

function App() {

const backgroundColors = [
  { color: '#ffffff', name: 'White' }, // white
  { color: '#1a1a1a', name: 'Black' }, // black
  { color: '#ef4444', name: 'Red' }, // red (changed from gray)
  { color: '#3b82f6', name: 'Blue' }, // blue
  { color: '#f59e0b', name: 'Yellow' }, // yellow
];

const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const footerHeight = 40;

  const {
    canvasRef,
    startDrawing,
    draw,
    paths,
    stopDrawing,
    clearCanvas,
    redrawPaths,
  } = useCanvas(backgroundColor);

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  // test
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - footerHeight;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (paths) redrawPaths();

}, [backgroundColor]);

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  
  const handleDraw = (event: MouseEvent | TouchEvent) => {
    draw(event, tool);
  };

  const handleStartDrawing = (event: MouseEvent | TouchEvent) => {
    startDrawing(event, tool);
  };

  const handleStopDrawing = () => {
    stopDrawing();
  };


  // Mouse events
  canvas.addEventListener('mousedown', handleStartDrawing);
  canvas.addEventListener('mousemove', handleDraw);
  canvas.addEventListener('mouseup', handleStopDrawing);
  canvas.addEventListener('mouseout', handleStopDrawing);

  // Touch events
  canvas.addEventListener('touchstart', handleStartDrawing);
  canvas.addEventListener('touchmove', handleDraw);
  canvas.addEventListener('touchend', handleStopDrawing);

  return () => {
    canvas.removeEventListener('mousedown', handleStartDrawing);
    canvas.removeEventListener('mousemove', handleDraw);
    canvas.removeEventListener('mouseup', handleStopDrawing);
    canvas.removeEventListener('mouseout',handleStopDrawing);
    canvas.removeEventListener('touchstart', handleStartDrawing);
    canvas.removeEventListener('touchmove', handleDraw);
    canvas.removeEventListener('touchend', handleStopDrawing);
  };
}, [startDrawing, draw, stopDrawing, redrawPaths]);

return (
  <div className="relative w-screen h-screen overflow-hidden"
  style={{ 
        backgroundColor,
        touchAction: 'none'
      }}>
    {/* Canvas */}
    <canvas
      ref={canvasRef}
      className="absolute inset-0 cursor-crosshair"
      style={{ 
        backgroundColor,
        touchAction: 'none'
      }}
    />

    {/* Top Left Controls */}
    <div className="absolute top-4 left-4 flex gap-3">
      {/* Tool Selection - Smaller iOS Style */}
      <div className="flex bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 overflow-hidden">
        <button
          onClick={() => setTool('pen')}
          className={`p-2.5 transition-all duration-300 ease-out ${
            tool === 'pen' 
              ? 'bg-blue-500 text-white shadow-lg scale-105' 
              : 'text-gray-700 hover:bg-gray-50 active:scale-95'
          }`}
        >
          <Brush size={18} strokeWidth={1.5} />
        </button>
        <div className="w-px bg-gray-200"></div>
        <button
          onClick={() => setTool('eraser')}
          className={`p-2.5 transition-all duration-300 ease-out ${
            tool === 'eraser' 
              ? 'bg-blue-500 text-white shadow-lg scale-105' 
              : 'text-gray-700 hover:bg-gray-50 active:scale-95'
          }`}
        >
          <Eraser size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Background Colors - Smaller iOS Style */}
      <div className="flex bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 p-2 gap-1.5">
        {backgroundColors.map(({ color, name }) => (
          <button
            key={color}
            onClick={() => setBackgroundColor(color)}
            className={`w-7 h-7 rounded-full transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
              backgroundColor === color 
                ? 'ring-2 ring-blue-500 ring-offset-1 shadow-lg scale-110' 
                : 'ring-1 ring-gray-200 hover:ring-gray-300'
            }`}
            style={{ backgroundColor: color }}
            title={name}
          />
        ))}
      </div>
    </div>

    {/* Top Right Clear Button - Smaller iOS Style */}
    <div className="absolute top-4 right-4">
      <button
        onClick={clearCanvas}
        className="p-2.5 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 ease-out hover:scale-105 active:scale-95"
        title="Clear All"
      >
        <Trash2 size={18} strokeWidth={1.5} />
      </button>
    </div>

  {/* Footer */}
    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 italic px-3 pointer-events-none select-none">
    Made by Deep Lekhak
    </div>
  </div>
);
}

export default App;