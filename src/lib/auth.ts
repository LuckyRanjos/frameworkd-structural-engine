// ============================================================
// src/lib/auth.ts
// Firebase Authentication helpers
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  User,
} from "firebase/auth";

import { auth } from "./firebase";

// ============================================================
// SIGN UP
// ============================================================
export async function signUp(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(`Sign up failed: ${error.message}`);
  }
}

// ============================================================
// SIGN IN
// ============================================================
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(`Sign in failed: ${error.message}`);
  }
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
}

// ============================================================
// SIGN OUT
// ============================================================
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
}

// ============================================================
// SEND VERIFICATION EMAIL
// ============================================================
export async function sendVerificationEmail(): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    await sendEmailVerification(currentUser);
  } catch (error: any) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

// ============================================================
// GET CURRENT USER
// ============================================================
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ============================================================
// FETCH SIGN-IN METHOD LIST
// ============================================================
export async function getSignInMethodsForEmail(email: string): Promise<string[]> {
  try {
    console.log("Checking sign-in methods for email:", email);
    const methods = await fetchSignInMethodsForEmail(auth, email);
    console.log("Sign-in methods found:", methods);
    return methods;
  } catch (error: any) {
    console.error("Error fetching sign-in methods:", error);
    // If we get an error, it might mean the email doesn't exist
    // But let's not throw here - return empty array instead
    return [];
  }
}

// ============================================================
// LISTEN TO AUTH STATE CHANGES
// ============================================================
export function onAuthStateChange(
  callback: (user: User | null) => void
): (() => void) {
  return onAuthStateChanged(auth, callback);
}
