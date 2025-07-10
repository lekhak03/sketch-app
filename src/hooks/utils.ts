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

    // Ensure arrays
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
