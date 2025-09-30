import { Point } from "./types";

function deepEqualPath(a: any[], b: any[]) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;

    return a.every((point, i) => {
        const other = b[i];
        return (
            point.x === other.x &&
            point.y === other.y &&
            point.tool === other.tool
        );
    });
}

// Deduplicate paths by concatenating existing and new, removing duplicates
export function deduplicatePaths(paths: any, existingDataParsed: any) {
    // Defensive parsing
    if (typeof paths === "string") {
        try {
            paths = JSON.parse(paths);
        } catch {
            paths = [];
        }
    }

    if (typeof existingDataParsed === "string") {
        try {
            existingDataParsed = JSON.parse(existingDataParsed);
        } catch {
            existingDataParsed = [];
        }
    }

    // Ensure parsing worked
    if (!Array.isArray(paths)) paths = [];
    if (!Array.isArray(existingDataParsed)) existingDataParsed = [];

    // Combine old paths first, then new paths appended
    const combined = existingDataParsed.concat(paths);

    const deduped = [];

    for (const path of combined) {
        if (!Array.isArray(path)) continue;

        if (path.length === 0) {
            // preserve gaps
            deduped.push([]);
            continue;
        }

        // Find last non-empty path in deduped
        let lastNonEmpty = null;
        for (let i = deduped.length - 1; i >= 0; i--) {
            if (deduped[i].length > 0) {
                lastNonEmpty = deduped[i];
                break;
            }
        }

        if (!lastNonEmpty || !deepEqualPath(path, lastNonEmpty)) {
            deduped.push(path);
        }
    }

    return JSON.stringify(deduped);
}


export const exportPng = (dataUrl: string) => {

    // Create a temporary anchor element
    const link = document.createElement('a');
    document.body.appendChild(link);

    link.href = dataUrl;
    link.download = 'canvas-image.png';
    link.click();

    document.body.removeChild(link);
};

export const appendToLS = (key: string, newPath: Point[]) => {
  const existing: Point[][] = JSON.parse(localStorage.getItem(key) || '[]');

  const updated = [...existing, newPath];

  localStorage.setItem(key, JSON.stringify(updated));
}

const averageOfAllPoints = (paths: Point[]) => {
    let centroidX = 0, centroidY = 0;
    const pathLength = paths.length
    for (let index = 0; index < pathLength; index++) {
        centroidX += paths[index].x != undefined ? paths[index].x : 0;
        centroidY += paths[index].y != undefined ? paths[index].y : 0;
    }
    const centroid: Point = {  
        x: Math.round(centroidX / pathLength),
        y: Math.round(centroidY / pathLength),
        tool: paths[0].tool
    }
    
    return centroid
}



// Check if two line segments intersect
function doLinesIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
    // Helper function to find orientation of ordered triplet (p, q, r)
    // Returns 0 if collinear, 1 if clockwise, 2 if counterclockwise
    const orientation = (p: Point, q: Point, r: Point): number => {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0; // collinear
        return val > 0 ? 1 : 2; // clockwise or counterclockwise
    };

    // Check if point q lies on segment pr
    const onSegment = (p: Point, q: Point, r: Point): boolean => {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
               q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    };

    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    // General case
    if (o1 !== o2 && o3 !== o4) return true;

    // Special cases
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
}

// Check if the path crosses itself
function pathCrossesItself(paths: Point[]): boolean {
    if (paths.length < 4) return false; // Need at least 4 points to form crossing lines

    // Check every line segment against every other non-adjacent line segment
    for (let i = 0; i < paths.length - 1; i++) {
        for (let j = i + 2; j < paths.length - 1; j++) {
            // Skip adjacent segments (they naturally connect)
            if (j === i + 1) continue;
            
            const line1Start = paths[i];
            const line1End = paths[i + 1];
            const line2Start = paths[j];
            const line2End = paths[j + 1];

            if (doLinesIntersect(line1Start, line1End, line2Start, line2End)) {
                return true;
            }
        }
    }
    return false;
}


// check whether a shape is a circle or not
export const isCircle = (paths: Point[]) => {
    if (paths.length < 10) return false; // Need minimum points for reliable detection
    
    // NECESSARY CONDITION: Path must cross itself for it to be a closed circle
    if (!pathCrossesItself(paths)) {
        return false;
    }
    
    // find the center of all points
    const centroid = averageOfAllPoints(paths);
    
    // Sample points in criss-cross pattern - take 10 evenly distributed points
    const samplePoints: Point[] = [];
    const totalPoints = paths.length;
    
    for (let i = 0; i < 20; i++) {
        const index = Math.floor((i * totalPoints) / 10);
        if (index < totalPoints) {
            samplePoints.push(paths[index]);
        }
    }
    // Calculate distances from centroid to each sampled point
    const distances = samplePoints.map(point => 
        Math.sqrt(Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2))
    );
    
    // Calculate average radius
    const avgRadius = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
    
    // Check if all distances are within tolerance of average radius (±20% tolerance)
    const tolerance = avgRadius * 10;
    const isCircular = distances.every(dist => Math.abs(dist - avgRadius) <= tolerance);
        
    return { isCircular, avgRadius };
}