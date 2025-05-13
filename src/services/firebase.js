import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB6IPzAMa9FoJ2EQtHbAGMdx5Xo5UTFZWQ",
  authDomain: "smartgarden-c29d2.firebaseapp.com",
  databaseURL: "https://smartgarden-c29d2-default-rtdb.firebaseio.com",
  projectId: "smartgarden-c29d2",
  storageBucket: "smartgarden-c29d2.appspot.com",
  messagingSenderId: "668266828289",
  appId: "1:668266828289:web:d347e6b07cb9d18a876600",
  measurementId: "G-4P0ZVYY4E2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const storage = getStorage(app); // 🆕

export { auth, db, realtimeDb, storage };
