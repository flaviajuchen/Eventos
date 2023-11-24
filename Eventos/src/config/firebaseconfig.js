import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyCrfumBUmlV6v3WdYRxx2IvhdSx2BqLusI",
  authDomain: "agenda-cacf7.firebaseapp.com",
  projectId: "agenda-cacf7",
  storageBucket: "agenda-cacf7.appspot.com",
  messagingSenderId: "833761800903",
  appId: "1:833761800903:web:642fb14e986d38131444e2",
  measurementId: "G-T8FH2WD1RD",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore, collection, getDocs, addDoc, deleteDoc, doc };
