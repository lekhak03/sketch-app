import { getDatabase, ref, set } from 'firebase/database';
import { Point } from './useCanvas'
import { initializeApp } from "firebase/app";
import { firebaseConfig, firebasePersistentConfig } from './databaseConfig';

// intiliaze the app, doesnt work without it
const tempDb = initializeApp(firebaseConfig, "tempDb");
const persistentDb = initializeApp(firebasePersistentConfig);


// write paths to the DB
export function writeData(paths: Point[][]) {
  const db = getDatabase(tempDb);
  const reference = ref(db, 'paths/');

  set(reference, {
    drawpaths: paths
  });
}

// write paths to the DB
export function writePersistentData(paths: Point[][]) {
  const db = getDatabase(persistentDb);
  const reference = ref(db, 'persistentPaths/');

  set(reference, {
    drawpaths: paths
  });
}