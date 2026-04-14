// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5tfS9ceOknq7fRvMB__SGfMU_aUa48zA",
  authDomain: "dokan-app-56585.firebaseapp.com",
  projectId: "dokan-app-56585",
  storageBucket: "dokan-app-56585.appspot.com",
  messagingSenderId: "556501176148",
  appId: "1:556501176148:web:e6aa623394017bf34ec2c1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db };
