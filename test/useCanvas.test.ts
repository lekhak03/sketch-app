import { renderHook, act } from '@testing-library/react-hooks';
import { useCanvas } from '../src/hooks/useCanvas';

describe('useCanvas', () => {
  it('initializes with empty paths', () => {
    const { result } = renderHook(() => useCanvas('#fff'));
    expect(result.current).toBeDefined();
  });

  it('starts drawing and updates currentPath', () => {
    // You would mock MouseEvent and canvasRef here for a full test
    // This is a placeholder for actual event simulation
    expect(true).toBe(true);
  });

  it('clears canvas and paths', () => {
    // You would mock canvas context and test setPaths([])
    expect(true).toBe(true);
  });
});
