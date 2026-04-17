// ============================================================
// lib/otp.ts
// OTP (One-Time Password) utilities for email verification
// ============================================================

import { collection, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// ============================================================
// TYPES
// ============================================================

export interface OTPData {
  code: string;
  email: string;
  userId: string;
  createdAt: Date | { toDate: () => Date };
  expiresAt: Date | { toDate: () => Date };
}

// ============================================================
// GENERATE OTP CODE
// ============================================================

export function generateOTP(): string {
  // Generate a 6-digit random number
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

// ============================================================
// SAVE OTP TO FIRESTORE
// ============================================================

export async function saveOTP(email: string, userId: string): Promise<string> {
  try {
    const code = generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1 * 60 * 1000); // 1 minute from now

    const otpData: OTPData = {
      code,
      email,
      userId,
      createdAt: now,
      expiresAt,
    };

    // Save to Firestore with email as document ID for easy lookup
    const otpDocRef = doc(collection(db, "otps"), email);
    await setDoc(otpDocRef, {
      ...otpData,
      createdAt: serverTimestamp(),
      expiresAt,
    });

    console.log(`OTP saved for ${email}: ${code}`);
    return code;
  } catch (error: any) {
    console.error("Error saving OTP:", error);
    throw new Error("Failed to generate OTP");
  }
}

// ============================================================
// VERIFY OTP
// ============================================================

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  try {
    const otpDocRef = doc(collection(db, "otps"), email);
    const otpDoc = await getDoc(otpDocRef);

    if (!otpDoc.exists()) {
      console.log("OTP not found for email:", email);
      return false;
    }

    const otpData = otpDoc.data() as OTPData;

    // Check if code matches
    if (otpData.code !== code) {
      console.log("OTP code mismatch for email:", email);
      return false;
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = otpData.expiresAt instanceof Date
      ? otpData.expiresAt
      : otpData.expiresAt.toDate();

    if (now > expiresAt) {
      console.log("OTP expired for email:", email);
      // Clean up expired OTP
      await deleteDoc(otpDocRef);
      return false;
    }

    // OTP is valid - clean it up
    await deleteDoc(otpDocRef);
    console.log("OTP verified successfully for email:", email);
    return true;
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return false;
  }
}

// ============================================================
// SEND OTP EMAIL
// ============================================================

export async function sendOTPEmail(email: string, code: string): Promise<void> {
  try {
    // For production, replace this with a real email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Firebase Cloud Functions with nodemailer

    // For demo purposes, we'll log the code and simulate sending
    console.log(`📧 OTP Code for ${email}: ${code}`);

    // In a real implementation, you would call an email service API:
    /*
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      throw new Error('Failed to send OTP email');
    }
    */

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send verification code");
  }
}