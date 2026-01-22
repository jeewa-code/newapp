// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC22s773hz2L1VYJaVpNYlXFcHfWf9ntQw", // Get this from Project Settings > General > Your apps
    authDomain: "phi-office.firebaseapp.com",
    projectId: "phi-office",
    storageBucket: "phi-office.appspot.com",
    messagingSenderId: "1034869853368", // This mimics the numeric part of the appId often, but not always.
    appId: "1:1034869853368:web:e7aea4610c0c2fcca8f84d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, db, googleProvider, facebookProvider };
