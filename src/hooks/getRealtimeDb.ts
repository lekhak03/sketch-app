// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue} from "firebase/database";
import { firebaseConfig } from './databaseConfig';


initializeApp(firebaseConfig);

const db = getDatabase();
const starCountRef = ref(db, 'paths/');
onValue(starCountRef, (snapshot) => {
  const data = snapshot.val();
  console.log(data)
});