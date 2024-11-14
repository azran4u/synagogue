import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJxoF__P-dUYSkaeglEIDgSgXfrKSbs-g",
  authDomain: "tights-app.firebaseapp.com",
  projectId: "tights-app",
  storageBucket: "tights-app.appspot.com",
  messagingSenderId: "133108001267",
  appId: "1:133108001267:web:a1ae3bce25d972702b8a86",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestoreDatabase = getFirestore(app);
