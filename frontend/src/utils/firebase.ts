// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCklAR_G1rKe0D1dWtry04zLFNBgVZ9fcE",
  authDomain: "liveboard-24cba.firebaseapp.com",
  projectId: "liveboard-24cba",
  storageBucket: "liveboard-24cba.firebasestorage.app",
  messagingSenderId: "163218066176",
  appId: "1:163218066176:web:1a7ad8b4bd8f602b4b81e5",
  measurementId: "G-D2YWZZXNR2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Storage
export const storage = getStorage(app);
