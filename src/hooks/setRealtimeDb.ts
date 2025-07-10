import { getDatabase, ref, set } from 'firebase/database';
import { Stroke } from './types'
import { initializeApp } from "firebase/app";
import { firebaseConfig } from './databaseConfig';

// intiliaze the app, doesnt work without it
export const broadcastDb = initializeApp(firebaseConfig, "tempDb");
// export const persistentDb = initializeApp(firebasePersistentConfig);


// write paths to the DB
export function writeData(paths: Stroke) {
  const db = getDatabase(broadcastDb);
  const reference = ref(db, 'paths/');

  set(reference, {
    drawPaths: paths
  });
}

// // write paths to the DB
// export function writePersistentData(paths: Point[][]) {
//   const db = getDatabase(persistentDb);
//   const reference = ref(db, 'persistentPaths/');

//   set(reference, {
//     drawPaths: paths
//   });
// }