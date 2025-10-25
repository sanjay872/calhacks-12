// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCumPXC8fxW_cy30x5eFjsZ_IOMkW89v6w",
  authDomain: "calhacks-bb6c1.firebaseapp.com",
  projectId: "calhacks-bb6c1",
  storageBucket: "calhacks-bb6c1.firebasestorage.app",
  messagingSenderId: "536521843205",
  appId: "1:536521843205:web:6e4ffde796aea0155cb26c",
  measurementId: "G-CSS94V04JN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
