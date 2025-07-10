import { useRef, useState, useCallback } from 'react';
import { writeData } from './setRealtimeDb'
import { getDatabase, ref, onValue} from "firebase/database";
import { Tool, Point, Stroke } from './types'
import { appendToLS, deduplicatePaths } from './utils';
import { firebaseConfig } from './databaseConfig';
import { initializeApp } from 'firebase/app';

const clientId = crypto.randomUUID();

const broadcastDb = initializeApp(firebaseConfig)

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
  const startDrawing = useCallback((event: MouseEvent | TouchEvent, tool: Tool) => {
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
        ctx.lineWidth = 100;
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
    [isDrawing, getEventPoint, backgroundColor]
  );

    const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setPaths((prev) => [...prev, currentPath]);
    setCurrentPath([]);
    const data = localStorage.getItem('drawPaths')
    if (data == null) {
      localStorage.setItem('drawPaths', JSON.stringify(paths));
    }
    else {
      const existingData = localStorage.getItem('drawPaths'); // get any stored data
      const existingDataParsed = existingData ? JSON.parse(existingData) : []; // parse string into array
      const dataToBeSaved = deduplicatePaths(paths, existingDataParsed); // remove any duplicates
      localStorage.setItem('drawPaths', dataToBeSaved);
      
    }
    if (currentPath.length > 0) {
      const stroke: Stroke = {
        points: currentPath,
        clientId: clientId
      }
      writeData(stroke);
    }
    // writePersistentData(paths); // writes to firebase real time server
  }, [currentPath]);


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
    localStorage.removeItem('drawPaths'); // clear drawPaths from local storage
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

  // redraw paths when state changes
  const redrawPaths = (savedPath: Point[][] = []) => {
    // copy paths
    let updatedPaths = paths
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (savedPath.length > 0) { updatedPaths = savedPath};
    updatedPaths.forEach((path) => {
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
    handleDatabaseUpdate
  };
}