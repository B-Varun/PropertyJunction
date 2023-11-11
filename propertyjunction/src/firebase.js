// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaDqh_vfW0b1RQtIgEZDAVtYthMp0Kius",
  authDomain: "property-junction-csc-244.firebaseapp.com",
  projectId: "property-junction-csc-244",
  storageBucket: "property-junction-csc-244.appspot.com",
  messagingSenderId: "819868120675",
  appId: "1:819868120675:web:12b849b8ca36f4524b2a56",
  measurementId: "G-6GCT4PB59E"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()
