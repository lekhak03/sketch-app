import { deduplicatePaths, appendToLS, isCircle } from '../src/hooks/utils';
import { Point } from '../src/hooks/types';

describe('deduplicatePaths', () => {
  it('removes duplicate paths', () => {
    const path1: Point[] = [{ x: 1, y: 2, tool: 'pen' }];
    const path2: Point[] = [{ x: 3, y: 4, tool: 'pen' }];
    const paths = [path1, path2];
    const existing = [path1];
    const result = deduplicatePaths(paths, existing);
    expect(JSON.parse(result)).toEqual([path1, path2]);
  });

  it('handles stringified input', () => {
    const path: Point[] = [{ x: 1, y: 2, tool: 'pen' }];
    const paths = JSON.stringify([path]);
    const existing = JSON.stringify([]);
    const result = deduplicatePaths(paths, existing);
    expect(JSON.parse(result)).toEqual([path]);
  });
});

describe('appendToLS', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('appends a path to localStorage', () => {
    const path: Point[] = [{ x: 1, y: 2, tool: 'pen' }];
    appendToLS('drawPaths', path);
    const stored = JSON.parse(localStorage.getItem('drawPaths') || '[]');
    expect(stored).toEqual([path]);
  });
});

describe('isCircle', () => {
  it('calculates centroid and radius', () => {
    const circle: Point[] = [
      { x: 0, y: 1, tool: 'pen' },
      { x: 1, y: 0, tool: 'pen' },
      { x: 0, y: -1, tool: 'pen' },
      { x: -1, y: 0, tool: 'pen' }
    ];
    // Should not throw
    expect(() => isCircle(circle)).not.toThrow();
  });
});
