import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCCqjwY3PY_zEeF-g29E7qOjhmKjSbnSho",
  authDomain: "nerd-notes-27b4c.firebaseapp.com",
  projectId: "nerd-notes-27b4c",
  storageBucket: "nerd-notes-27b4c.firebasestorage.app",
  messagingSenderId: "942307217549",
  appId: "1:942307217549:web:af7c4273b1d426798e12c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
