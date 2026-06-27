import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Your Firebase config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAKFiWiOaAcJSq0TKVd3CuKgUFOmdFPib8",
  authDomain: "goag-erp.firebaseapp.com",
  projectId: "goag-erp",
  storageBucket: "goag-erp.firebasestorage.app",
  messagingSenderId: "368451113694",
  appId: "1:368451113694:web:0d55808aaaa7aa6db7684f",
  measurementId: "G-D6WHNCRX5X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc
};