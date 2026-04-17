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
  applyActionCode,
} from "firebase/auth";

import { auth } from "./firebase";
import { createUserProfile } from "./firebase-helpers";
import { saveOTP, sendOTPEmail } from "./otp";

// ============================================================
// SIGN UP
// ============================================================
export async function signUp(email: string, password: string): Promise<{ user: User; message: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create user profile in Firestore
    await createUserProfile(userCredential.user.uid, email);

    await sendVerificationEmail();

    return {
      user: userCredential.user,
      message: "Account created. Please check your email to verify.",
    };
  } catch (error: any) {
    throw new Error(`Sign up failed: ${error.message}`);
  }
}

// ============================================================
// SIGN IN WITH OTP VERIFICATION
// ============================================================
export async function signInWithOTP(email: string, password: string): Promise<{
  user: User;
  requiresOTP: boolean;
  otpSent?: boolean;
}> {
  try {
    // First, authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Generate and send OTP
    const otpCode = await saveOTP(email, userCredential.user.uid);
    await sendOTPEmail(email, otpCode);

    return {
      user: userCredential.user,
      requiresOTP: true,
      otpSent: true,
    };
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
// To customize email link text (e.g., "Click to Verify Email" instead of raw URL):
// 1. Go to Firebase Console > Authentication > Templates
// 2. Click on "Email Verification" 
// 3. Customize the email template HTML
// 4. Use {{ACTION_URL}} placeholder for the verification link
export async function sendVerificationEmail(): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    const actionCodeSettings = {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: true,
    };

    await sendEmailVerification(currentUser, actionCodeSettings);
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
// APPLY VERIFICATION CODE
// ============================================================
export async function applyVerificationCode(
  oobCode: string
): Promise<{ success: boolean; isAuthenticated: boolean; isDomainVerified?: boolean }> {
  try {
    if (!oobCode) {
      throw new Error("Verification code is missing");
    }

    // Apply the verification code
    await applyActionCode(auth, oobCode);

    // Check if user is currently authenticated
    const currentUser = auth.currentUser;

    if (currentUser) {
      // User is authenticated - reload to get updated emailVerified status
      await currentUser.reload();
      return {
        success: true,
        isAuthenticated: true,
        isDomainVerified: currentUser.emailVerified,
      };
    } else {
      // User is not authenticated - verification still applied server-side
      // but user will need to sign in to see the verified status reflected
      return {
        success: true,
        isAuthenticated: false,
      };
    }
  } catch (error: any) {
    console.error("Apply verification code failed:", error);
    throw new Error(
      error?.message ||
        "Verification failed. The link may be expired or invalid."
    );
  }
}

// ============================================================
// REFRESH USER VERIFICATION STATUS
// ============================================================
export async function refreshUserVerification(): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    await currentUser.reload();
    return currentUser.emailVerified;
  } catch (error: any) {
    console.error("Refresh verification failed:", error);
    throw new Error(`Failed to refresh verification status: ${error.message}`);
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

