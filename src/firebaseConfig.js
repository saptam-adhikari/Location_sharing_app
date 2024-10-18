
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyByesraefeJnuIY6_C1DqQP1Q-agSb98Tk",
    authDomain: "location-59852.firebaseapp.com",
    projectId: "location-59852",
    storageBucket: "location-59852.appspot.com",
    messagingSenderId: "1051640599385",
    appId: "1:1051640599385:web:d513a6a552b1d039ae7248",
    measurementId: "G-8RSSR0LN4J"
  };


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
