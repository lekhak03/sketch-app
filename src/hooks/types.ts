export type Tool = 'pen' | 'eraser';

export type Point = { x: number; y: number, tool: Tool };

export type Stroke = {
  points: Point[],
  clientId: string
};

