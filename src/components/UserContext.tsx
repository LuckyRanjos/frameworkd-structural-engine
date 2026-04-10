"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type UserContextType = {
  userId: string | null;
  email: string | null;
  plan: string;
  role: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================================
// USER PROVIDER
// ============================================================

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [role, setRole] = useState<string>("user");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // Determine UID: use Firebase user if logged in, otherwise use test UID
        // ⚠️ REPLACE 'test-uid-for-development' with your real Firebase user ID
        // Find your UID in Firebase Console → Authentication → Users → Copy UID
        const uid = firebaseUser?.uid || "test-uid-for-development";
        const userEmail = firebaseUser?.email || null;

        setUserId(uid);
        setEmail(userEmail);

        // Fetch user document from Firestore
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setPlan(userData.plan || "free");
          setRole(userData.role || "user");
          setIsAdmin(userData.isAdmin || false);
        } else {
          // User doc doesn't exist yet, use defaults
          setPlan("free");
          setRole("user");
          setIsAdmin(false);
        }

        setError(null);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value: UserContextType = {
    userId,
    email,
    plan,
    role,
    isAdmin,
    isAuthenticated: !!userId,
    isLoading,
    error,
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};

// ============================================================
// CUSTOM HOOK
// ============================================================

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within UserProvider");
  }
  return context;
};