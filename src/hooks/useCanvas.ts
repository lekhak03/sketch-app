import { useRef, useState, useCallback } from 'react';
import { writeData } from './setRealtimeDb'
import { getDatabase, ref, onValue} from "firebase/database";
import { Tool, Point, Stroke, Shape } from './types'
import { appendToLS, deduplicatePaths, isCircle } from './utils';
import { firebaseConfig } from './databaseConfig';
import { initializeApp } from 'firebase/app';
import { ERASER_WIDTH } from '../constants';

const clientId = crypto.randomUUID();

const broadcastDb = initializeApp(firebaseConfig)

export function useCanvas(backgroundColor: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Point[][]>(() => {
    const saved = localStorage.getItem('drawPaths');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [shapes, setShapes] = useState<Shape[]>(() => {
    const saved = localStorage.getItem('drawShapes');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [shapeStartPoint, setShapeStartPoint] = useState<{ x: number; y: number } | null>(null);

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
  const startDrawing = useCallback((event: MouseEvent | TouchEvent, tool: Tool) => {
    event.preventDefault();
    setIsDrawing(true);
    const point = getEventPoint(event, tool);

    // Handle shape drawing
    if (tool === 'circle' || tool === 'rectangle') {
      setShapeStartPoint({ x: point.x, y: point.y });
      return;
    }

    setCurrentPath([point]);

    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(point.x, point.y);
  }, [getEventPoint]);

  // Check if a point intersects with a shape
  const pointIntersectsShape = (x: number, y: number, shape: Shape, tolerance: number = ERASER_WIDTH / 2): boolean => {
    if (shape.type === 'circle') {
      const centerX = (shape.startX + shape.endX) / 2;
      const centerY = (shape.startY + shape.endY) / 2;
      const radiusX = Math.abs(shape.endX - shape.startX) / 2;
      const radiusY = Math.abs(shape.endY - shape.startY) / 2;
      
      // Check if point is near the ellipse perimeter
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
      
      // Check if within tolerance of the perimeter (between inner and outer radius)
      return Math.abs(distance - 1) <= tolerance / Math.min(radiusX, radiusY);
    } else if (shape.type === 'rectangle') {
      const minX = Math.min(shape.startX, shape.endX);
      const maxX = Math.max(shape.startX, shape.endX);
      const minY = Math.min(shape.startY, shape.endY);
      const maxY = Math.max(shape.startY, shape.endY);
      
      // Check if point is near any of the four edges
      const nearLeft = Math.abs(x - minX) <= tolerance && y >= minY - tolerance && y <= maxY + tolerance;
      const nearRight = Math.abs(x - maxX) <= tolerance && y >= minY - tolerance && y <= maxY + tolerance;
      const nearTop = Math.abs(y - minY) <= tolerance && x >= minX - tolerance && x <= maxX + tolerance;
      const nearBottom = Math.abs(y - maxY) <= tolerance && x >= minX - tolerance && x <= maxX + tolerance;
      
      return nearLeft || nearRight || nearTop || nearBottom;
    }
    return false;
  };

  //   draw function
  const draw = useCallback(
    (event: MouseEvent | TouchEvent, tool: Tool) => {
      event.preventDefault();
      if (!isDrawing) return;

      const point = getEventPoint(event, tool);

      // Handle shape preview
      if ((tool === 'circle' || tool === 'rectangle') && shapeStartPoint) {
        const shape: Shape = {
          type: tool,
          startX: shapeStartPoint.x,
          startY: shapeStartPoint.y,
          endX: point.x,
          endY: point.y,
          color: getPenColor()
        };
        setCurrentShape(shape);
        
        // Redraw everything including the preview
        redrawAll(paths, shapes, shape);
        return;
      }

      setCurrentPath((prev) => [...prev, point]);

      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      if (tool == 'eraser') {
        // Check if eraser intersects with any shape
        const shapesToRemove: number[] = [];
        shapes.forEach((shape, index) => {
          if (pointIntersectsShape(point.x, point.y, shape)) {
            shapesToRemove.push(index);
          }
        });

        // Remove intersected shapes
        if (shapesToRemove.length > 0) {
          const newShapes = shapes.filter((_, index) => !shapesToRemove.includes(index));
          setShapes(newShapes);
          localStorage.setItem('drawShapes', JSON.stringify(newShapes));
          
          // Redraw everything without the removed shapes
          redrawAll(paths, newShapes);
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = backgroundColor;
        ctx.lineWidth = ERASER_WIDTH;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = getPenColor();
        ctx.lineWidth = 2;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    },
    [isDrawing, getEventPoint, backgroundColor, shapeStartPoint, paths, shapes]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    
    // Save completed shape
    if (currentShape && shapeStartPoint) {
      setShapes((prev) => [...prev, currentShape]);
      
      // Save to localStorage
      const existingShapes = localStorage.getItem('drawShapes');
      const shapesArray = existingShapes ? JSON.parse(existingShapes) : [];
      shapesArray.push(currentShape);
      localStorage.setItem('drawShapes', JSON.stringify(shapesArray));
      
      setCurrentShape(null);
      setShapeStartPoint(null);
      return;
    }

    setPaths((prev) => [...prev, currentPath]);
    setCurrentPath([]);
    const data = localStorage.getItem('drawPaths')
    if (data == null) {
      localStorage.setItem('drawPaths', JSON.stringify(paths));
    }
    else {
      const existingData = localStorage.getItem('drawPaths');
      const existingDataParsed = existingData ? JSON.parse(existingData) : [];
      const dataToBeSaved = deduplicatePaths(paths, existingDataParsed);
      localStorage.setItem('drawPaths', dataToBeSaved);
    }
    if (currentPath.length > 0) {
      const stroke: Stroke = {
        points: currentPath,
        clientId: clientId
      }
      writeData(stroke);
    }
    redrawAsShape();
  }, [currentPath, currentShape, shapeStartPoint, paths]);

  //   clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentBackgroundColor = localStorage.getItem('backgroundColor');
    ctx.fillStyle = currentBackgroundColor ? currentBackgroundColor : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPaths([]);
    setShapes([]);
    localStorage.removeItem('drawPaths');
    localStorage.removeItem('drawShapes');
  };

  const handleDatabaseUpdate = () => {
    const db = getDatabase(broadcastDb);
    const dbRef = ref(db, 'paths/');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const databaseClientId = data['drawPaths']['clientId'];
        if (clientId !== databaseClientId) {
          const points = data['drawPaths']['points'];
          appendToLS('drawPaths' , points)
          const pointArray: Point[] = points;
          const pathsToBeDrawn: Point[][] = [pointArray];
          redrawPaths(pathsToBeDrawn)
        }
      }
    });
  }

  // Draw a single shape
  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (shape.type === 'circle') {
      const centerX = (shape.startX + shape.endX) / 2;
      const centerY = (shape.startY + shape.endY) / 2;
      const radiusX = Math.abs(shape.endX - shape.startX) / 2;
      const radiusY = Math.abs(shape.endY - shape.startY) / 2;
      
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (shape.type === 'rectangle') {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      
      ctx.beginPath();
      ctx.rect(shape.startX, shape.startY, width, height);
      ctx.stroke();
    }
  };

  // Redraw everything (paths and shapes)
  const redrawAll = (pathsToRedraw: Point[][] = paths, shapesToRedraw: Shape[] = shapes, previewShape?: Shape) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw paths
    pathsToRedraw.forEach((path) => {
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
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = backgroundColor;
          ctx.lineWidth = 100;
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    });

    // Redraw saved shapes
    shapesToRedraw.forEach(shape => drawShape(ctx, shape));

    // Draw preview shape
    if (previewShape) {
      drawShape(ctx, previewShape);
    }
  };

  // redraw paths when state changes
  const redrawPaths = (savedPath: Point[][] = []) => {
    let updatedPaths = paths
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (savedPath.length > 0) { updatedPaths = savedPath};
    
    // Clear and redraw everything
    redrawAll(updatedPaths, shapes);
  };

  const redrawAsShape = () => {
    const pathShape = currentPath;
    if (pathShape.length > 0) {isCircle(currentPath); console.log("YES")};
  }

  return {
    canvasRef,
    startDrawing,
    draw,
    paths,
    shapes,
    stopDrawing,
    clearCanvas,
    redrawPaths,
    redrawAll,
    setIsDrawing,
    handleDatabaseUpdate
  };
}