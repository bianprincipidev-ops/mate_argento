import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0OUa9FJ92jmBfR5eY7iZVOK8WbaWqpCs",
  authDomain: "mate-argento.firebaseapp.com",
  projectId: "mate-argento",
  storageBucket: "mate-argento.firebasestorage.app",
  messagingSenderId: "999155963386",
  appId: "1:999155963386:web:f4d3d2c890611835e5c043",
  measurementId: "G-22GPJFMQZD"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
};