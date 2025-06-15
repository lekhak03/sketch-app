import React, { useEffect, useCallback } from 'react';
import { useDrawing } from '../hooks/useDrawing';
import { Point } from '../types/drawing';

interface DrawingCanvasProps {
  className?: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ className }) => {
  const {
    canvasRef,
    drawingState,
    getEventPoint,
    drawLine,
    saveState,
    setDrawingState
  } = useDrawing();

  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    const point = getEventPoint(event);
    
    setDrawingState(prev => ({
      ...prev,
      isDrawing: true,
      currentPath: [point]
    }));
  }, [getEventPoint, setDrawingState]);

  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    
    if (!drawingState.isDrawing) return;

    const point = getEventPoint(event);
    const lastPoint = drawingState.currentPath[drawingState.currentPath.length - 1];

    if (lastPoint) {
      drawLine(lastPoint, point);
    }

    setDrawingState(prev => ({
      ...prev,
      currentPath: [...prev.currentPath, point]
    }));
  }, [drawingState.isDrawing, drawingState.currentPath, getEventPoint, drawLine, setDrawingState]);

  const stopDrawing = useCallback(() => {
    if (drawingState.isDrawing) {
      setDrawingState(prev => ({
        ...prev,
        isDrawing: false,
        currentPath: []
      }));
      saveState();
    }
  }, [drawingState.isDrawing, setDrawingState, saveState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.fillStyle = drawingState.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

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
      window.removeEventListener('resize', updateCanvasSize);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [canvasRef, drawingState.backgroundColor, startDrawing, draw, stopDrawing]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-200 rounded-lg shadow-sm cursor-crosshair"
        style={{ 
          backgroundColor: drawingState.backgroundColor,
          touchAction: 'none'
        }}
      />
    </div>
  );
};