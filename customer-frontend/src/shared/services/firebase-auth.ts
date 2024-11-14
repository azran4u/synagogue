import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebase-config";

const googleProvider = new GoogleAuthProvider();

export async function login() {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return {
      email: res.user.email!,
      name: res.user.displayName!,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function logout() {
  signOut(auth);
}
