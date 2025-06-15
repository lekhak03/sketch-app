import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Brush, Eraser, Trash2 } from 'lucide-react';

const footerHeight = 40; 

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const backgroundColors = [
    { color: '#ffffff', name: 'White' }, // white
    { color: '#1a1a1a', name: 'Black' }, // black
    { color: '#ef4444', name: 'Red' }, // red (changed from gray)
    { color: '#3b82f6', name: 'Blue' }, // blue
    { color: '#f59e0b', name: 'Yellow' }, // yellow
  ];

  // Get pen color based on background
  const getPenColor = () => {
    return backgroundColor === '#1a1a1a' ? '#ffffff' : '#000000';
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - footerHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [backgroundColor]);

  // Update background color
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [backgroundColor]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getEventPoint = useCallback((event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in event) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    setIsDrawing(true);
    
    const point = getEventPoint(event);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [getEventPoint]);

  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    
    if (!isDrawing) return;

    const point = getEventPoint(event);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 40; // Much larger eraser
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = getPenColor();
      ctx.lineWidth = 3;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [isDrawing, tool, getEventPoint, backgroundColor]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

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