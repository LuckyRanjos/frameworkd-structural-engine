// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firestore
import { getFirestore } from "firebase/firestore";

// Your Firebase config (paste yours here)
const firebaseConfig = {
  apiKey: "AIzaSyC9fSGLIVl4F4_P1BkmO47CMWWgHIUH-s8",
  authDomain: "frameworkd-structural-engine.firebaseapp.com",
  projectId: "frameworkd-structural-engine",
  storageBucket: "frameworkd-structural-engine.firebasestorage.app",
  messagingSenderId: "136988123624",
  appId: "1:136988123624:web:21a8ad978622749fd9845d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);