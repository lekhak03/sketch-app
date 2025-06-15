import { useRef, useCallback, useState } from 'react';
import { Point, DrawingState, BrushType, Tool, CanvasState } from '../types/drawing';

export const useDrawing = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    currentPath: [],
    brushType: 'pen',
    strokeWidth: 3,
    color: '#000000',
    backgroundColor: '#ffffff',
    tool: 'brush'
  });

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newState: CanvasState = {
      imageData,
      width: canvas.width,
      height: canvas.height
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const prevState = history[historyIndex - 1];
      if (prevState.imageData) {
        ctx.putImageData(prevState.imageData, 0, 0);
      }
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const nextState = history[historyIndex + 1];
      if (nextState.imageData) {
        ctx.putImageData(nextState.imageData, 0, 0);
      }
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = drawingState.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, [drawingState.backgroundColor, saveState]);

  const getEventPoint = useCallback((event: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY
      };
    }

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }, []);

  const applyBrushStyle = useCallback((ctx: CanvasRenderingContext2D, brushType: BrushType, strokeWidth: number) => {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    switch (brushType) {
      case 'pen':
        ctx.lineWidth = strokeWidth;
        ctx.globalAlpha = 1;
        break;
      case 'marker':
        ctx.lineWidth = strokeWidth * 1.5;
        ctx.globalAlpha = 0.7;
        break;
      case 'calligraphy':
        ctx.lineWidth = strokeWidth;
        ctx.globalAlpha = 0.9;
        break;
      case 'pencil':
        ctx.lineWidth = strokeWidth * 0.8;
        ctx.globalAlpha = 0.6;
        break;
    }
  }, []);

  const drawLine = useCallback((from: Point, to: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();

    if (drawingState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = drawingState.strokeWidth * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawingState.color;
      applyBrushStyle(ctx, drawingState.brushType, drawingState.strokeWidth);
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.restore();
  }, [drawingState, applyBrushStyle]);

  return {
    canvasRef,
    drawingState,
    setDrawingState,
    getEventPoint,
    drawLine,
    saveState,
    undo,
    redo,
    clearCanvas,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
};