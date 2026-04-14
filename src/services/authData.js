import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../Firebase/firebase";

const googleProvider = new GoogleAuthProvider();

// 1. Email/Password Signup
export const registerWithEmail = async (email, password, userData) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  // Create profile in Firestore
  await setDoc(doc(db, "users", user.uid), {
    ...userData,
    email: user.email,
    uid: user.uid,
    role: "shop_owner",
    createdAt: serverTimestamp(),
  });
  return user;
};

// 2. Email/Password Login
export const loginWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return userCredential.user;
};

// 3. Google Login
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const getUserProfile = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
};

export const logoutUser = () => signOut(auth);
