import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase/firebase";
import {
  loginWithGoogle,
  logoutUser,
  getUserProfile,
} from "../services/authData";

// 1. Initialize the Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 2. Listen for Auth Changes
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      setAuthLoading(true);
      if (!firebaseUser) {
        if (!isMounted) return;
        setUser(null);
        setProfile(null);
      } else {
        if (!isMounted) return;
        setUser(firebaseUser);
        try {
          const nextProfile = await getUserProfile(firebaseUser.uid);
          if (!isMounted) return;
          setProfile(nextProfile);
        } catch (err) {
          console.error("Failed to fetch profile:", err);
          if (!isMounted) return;
          setProfile(null);
        }
      }
      if (!isMounted) return;
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 3. Memoize the value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      profile,
      authLoading,
      loginWithGoogle,
      logoutUser,
      refreshProfile: async () => {
        if (!auth.currentUser) return null;
        try {
          const nextProfile = await getUserProfile(auth.currentUser.uid);
          setProfile(nextProfile);
          return nextProfile;
        } catch (error) {
          console.error("Failed to refresh profile:", error);
          return null;
        }
      },
    }),
    [user, profile, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Export the Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
