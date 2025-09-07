# Sketch App

This repository is of a collaborative sketch/drawing application. It provides hooks and utilities for managing canvas drawing, local storage, real-time database sync (Firebase), and basic shape detection.

## Features

- **Canvas Drawing Hook**: React hook (`useCanvas`) for handling drawing, erasing, and path management on an HTML canvas.
- **Local Storage Sync**: Automatically saves and deduplicates drawn paths in browser local storage.
- **Firebase Realtime Database Sync**: Broadcasts and receives drawing data for collaboration.
- **Shape Detection Utility**: Includes a basic function for detecting circles from drawn points.
- **Export Functionality**: Export the canvas as a PNG image.

## File Structure

```
src/
  hooks/
    useCanvas.ts      # Main React hook for canvas logic
    utils.ts          # Utility functions for paths, local storage, export, and shape detection
    types.ts          # Type definitions for Point, Tool, Stroke, etc.
    setRealtimeDb.js  # JS module for writing data to Firebase
    writeData.d.ts    # TypeScript declaration for writeData
    databaseConfig.ts # Firebase config
  constants.ts        # Drawing constants (e.g., eraser width)
```

## Key Modules

### `useCanvas.ts`

- Provides the `useCanvas` hook for React components.
- Handles mouse/touch events for drawing and erasing.
- Manages state for paths and current drawing.
- Syncs paths to local storage and Firebase.
- Redraws canvas on state changes.

### `utils.ts`

- `deduplicatePaths`: Removes duplicate paths when saving to local storage.
- `appendToLS`: Appends new paths to local storage.
- `exportPng`: Exports the canvas as a PNG image.
- `isCircle`: Attempts to detect if a drawn path is a circle.

### `setRealtimeDb.js`

- Handles writing drawing data to Firebase Realtime Database.

### `types.ts`

- Defines TypeScript types for points, tools, strokes, etc.

## Getting Started

1. **Install dependencies**  
   ```bash
   npm install
   ```

2. **Configure Firebase**  
   Update `databaseConfig.ts` with your Firebase project credentials.

3. **Usage in React**  
   Import and use the `useCanvas` hook in your component:
   ```typescript
   import { useCanvas } from './hooks/useCanvas';

   const { ...canvasMethods } = useCanvas('#ffffff');
   ```

## Development

- Written in TypeScript (except for Firebase write logic, which is in JS).
- Designed for use in React projects.
- Tested on Mac (VS Code recommended).

## License

MIT

## Author

[Your Name]
