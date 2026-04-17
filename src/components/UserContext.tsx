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
          // No user authenticated
          setUserId(null);
          setEmail(null);
          setEmailVerified(false);
          setPlan("free");
          setRole("user");
          setError(null);
        } else {
          // User is authenticated
          const uid = firebaseUser.uid;
          setUserId(uid);
          setEmail(firebaseUser.email || null);
          
          // IMPORTANT: Check emailVerified status immediately
          // Then re-check after a short delay to catch any updates
          setEmailVerified(firebaseUser.emailVerified);
          
          // Fetch user document from Firestore to get role and plan
          const userDocRef = doc(db, "users", uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role || "user");
            setPlan(userData.plan || "free");
          } else {
            setRole("user");
            setPlan("free");
          }

          setError(null);
          
          // Poll verification status for 30 seconds after auth state change
          // This catches the case where verification is applied via email link
          const pollInterval = setInterval(async () => {
            try {
              await firebaseUser.reload();
              setEmailVerified(firebaseUser.emailVerified);
              // Stop polling if verified
              if (firebaseUser.emailVerified) {
                clearInterval(pollInterval);
              }
            } catch (err: any) {
              console.error("Error polling verification status:", err);
            }
          }, 1000); // Check every second
          
          // Clear polling after 30 seconds
          const timeout = setTimeout(() => clearInterval(pollInterval), 30000);
          
          return () => {
            clearInterval(pollInterval);
            clearTimeout(timeout);
          };
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