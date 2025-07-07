import { getDatabase, ref, set } from 'firebase/database';
import { Point } from './useCanvas'
import { initializeApp } from "firebase/app";
import { firebaseConfig } from './databaseConfig';

// intiliaze the app, doesnt work without it
initializeApp(firebaseConfig);

// write paths to the DB
export function writeData(paths: Point[][]) {
  const db = getDatabase();
  const reference = ref(db, 'paths/');

  set(reference, {
    drawpaths: paths
  });
}

// write paths to the DB
export function writeDataPaths(paths: Point[][]) {
  const db = getDatabase();
  const reference = ref(db, 'currentPaths/');

  set(reference, {
    drawpaths: paths
  });
}