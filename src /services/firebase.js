// Importuri Firebase necesare pentru funcționalități specifice
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore DB
import { getAuth } from "firebase/auth"; // Autentificare
import { getDatabase } from "firebase/database"; // Realtime Database
import { getStorage } from "firebase/storage"; // Storage (fișiere)
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Google Auth

// Configurația aplicației tale Firebase
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

// Initializează aplicația Firebase cu configurația dată
const app = initializeApp(firebaseConfig);

// Instanțe pentru serviciile Firebase folosite în aplicație
const auth = getAuth(app);         // Serviciu de autentificare
const db = getFirestore(app);      // Firestore (baza de date NoSQL)
const realtimeDb = getDatabase(app); // Realtime Database (baza de date în timp real)
const storage = getStorage(app);   // Firebase Storage (stocare fișiere)
const googleProvider = new GoogleAuthProvider(); // Provider Google pentru autentificare cu Google

// Exportă instanțele și funcțiile necesare pentru a fi folosite în alte părți ale aplicației
export { auth, db, realtimeDb, storage, googleProvider, signInWithPopup };
