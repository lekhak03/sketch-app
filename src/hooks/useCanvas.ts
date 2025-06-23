import { useRef, useState, useCallback } from 'react';

export type Tool = 'pen' | 'eraser';

export type Point = { x: number; y: number , tool: Tool};

export function useCanvas(backgroundColor: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const getPenColor = () =>
    backgroundColor === '#1a1a1a' ? '#ffffff' : '#000000';

  const getEventPoint = useCallback((event: MouseEvent | TouchEvent, tool: Tool): Point => {
    const canvas = canvasRef.current;
    const rect = canvas!.getBoundingClientRect();

    if ('touches' in event) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
        tool: tool
      };
    }
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      tool: tool
    };
  }, []);

//   start Drawing
  const startDrawing = useCallback((event: MouseEvent | TouchEvent,  tool: Tool) => {
    event.preventDefault();
    setIsDrawing(true);
    const point = getEventPoint(event, tool);
    setCurrentPath([point]);

    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(point.x, point.y);
  }, [getEventPoint]);


//   draw function
  const draw = useCallback(
    (event: MouseEvent | TouchEvent, tool: 'pen' | 'eraser') => {
      event.preventDefault();
      if (!isDrawing) return;

      const point = getEventPoint(event, tool);

      setCurrentPath((prev) => [...prev, point]);

      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      if (tool == 'eraser') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = backgroundColor;
        ctx.lineWidth = 300;
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
    },
    [isDrawing, getEventPoint, backgroundColor]
  );

//   stops drawing
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setPaths((prev) => [...prev, currentPath]);
    setCurrentPath([]);
  }, [currentPath]);

//   clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPaths([]);
  };

// redraw paths when background changes
  const redrawPaths = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  paths.forEach((path) => {
    if (path.length < 2) return;

    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      if (prev.tool != curr.tool) continue;

      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);

      if (curr.tool === 'pen') {
        ctx.strokeStyle = getPenColor();
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = backgroundColor;
        ctx.lineWidth = 300;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  });

};


  return {
    canvasRef,
    startDrawing,
    draw,
    paths,
    stopDrawing,
    clearCanvas,
    redrawPaths,
    setIsDrawing,
  };
}