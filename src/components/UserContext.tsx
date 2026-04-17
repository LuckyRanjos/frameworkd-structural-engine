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
  emailVerified: boolean;
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
  // User authentication state
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  
  // User profile state — role is the source of truth for permissions
  const [plan, setPlan] = useState<string>("free");
  const [role, setRole] = useState<string>("user");
  
  // Loading and error state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          // No user authenticated — clear all user data and leave userId null
          // SECURITY: Removed hardcoded fallback UID (no implicit authentication allowed)
          setUserId(null);
          setEmail(null);
          setEmailVerified(false);
          setPlan("free");
          setRole("user");
          setError(null);
        } else {
          // User is authenticated — use their real Firebase UID
          const uid = firebaseUser.uid;
          setUserId(uid);
          setEmail(firebaseUser.email || null);
          setEmailVerified(firebaseUser.emailVerified);

          // Fetch user document from Firestore to get role and plan
          const userDocRef = doc(db, "users", uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Role is the source of truth for permissions
            setRole(userData.role || "user");
            setPlan(userData.plan || "free");
          } else {
            // User doc doesn't exist yet, use defaults
            setRole("user");
            setPlan("free");
          }

          setError(null);
        }
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

  // Build context value with computed isAdmin from role
  const value: UserContextType = {
    userId,
    email,
    emailVerified,
    plan,
    role,
    isAdmin: role === "admin", // Computed from role, not separate state
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