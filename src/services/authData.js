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

const buildDefaultShopId = (uid) => `shop-${uid}`;

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
    currentShopId: buildDefaultShopId(user.uid),
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
  const user = result.user;

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email || "",
      name: user.displayName || "",
      role: "shop_owner",
      currentShopId: buildDefaultShopId(user.uid),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return result.user;
};

export const getUserProfile = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
};

const clearSessionLocalState = () => {
  const keysToDelete = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;

    if (
      key.startsWith("savedBills-") ||
      key.startsWith("dashboard-show-stats-") ||
      key.startsWith("active-shop-id-")
    ) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => localStorage.removeItem(key));
};

export const logoutUser = async () => {
  await signOut(auth);
  clearSessionLocalState();
};
