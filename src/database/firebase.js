import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDhc4k4BvErkFIsT_IfwQu_cUjmVuTBUDY",
    authDomain: "react-notes-a7261.firebaseapp.com",
    projectId: "react-notes-a7261",
    storageBucket: "react-notes-a7261.appspot.com",
    messagingSenderId: "535571339961",
    appId: "1:535571339961:web:c2f80a0fa7e53d5f9ed968",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const notesCollection = collection(db, "notes");