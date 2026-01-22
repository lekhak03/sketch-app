// types.ts
export type Tool = 'pen' | 'eraser' | 'circle' | 'rectangle';

export interface Point {
  x: number;
  y: number;
  tool: Tool;
}

export interface Stroke {
  points: Point[];
  clientId: string;
}

export interface Shape {
  type: 'circle' | 'rectangle';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export interface DrawingState {
  paths: Point[][];
  shapes: Shape[];
}