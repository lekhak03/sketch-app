export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingState {
  isDrawing: boolean;
  currentPath: Point[];
  brushType: BrushType;
  strokeWidth: number;
  color: string;
  backgroundColor: string;
  tool: Tool;
}

export type BrushType = 'pen' | 'marker' | 'calligraphy' | 'pencil';
export type Tool = 'brush' | 'eraser';

export interface CanvasState {
  imageData: ImageData | null;
  width: number;
  height: number;
}