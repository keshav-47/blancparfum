import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRAW66Lg2nE_6HMDezMtA9sIJ3FUQ2Btg",
  authDomain: "blancparfum-755d5.firebaseapp.com",
  projectId: "blancparfum-755d5",
  storageBucket: "blancparfum-755d5.firebasestorage.app",
  messagingSenderId: "712438020441",
  appId: "1:712438020441:web:4e0d5ac6d655d77de43448",
  measurementId: "G-901KBNP3YP",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
