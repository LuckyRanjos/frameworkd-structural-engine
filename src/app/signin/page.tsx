"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithOTP, signUp, signInWithGoogle, getSignInMethodsForEmail, logout } from "@/lib/auth";
import { Card, Button, Input } from "@/components/design-system";
import OTPVerification from "@/components/OTPVerification";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ email: string; userId: string } | null>(null);

  const handleOTPResend = async () => {
    if (!pendingUser) return;

    // Generate and send new OTP
    const { saveOTP, sendOTPEmail } = await import("@/lib/otp");
    const code = await saveOTP(pendingUser.email, pendingUser.userId);
    await sendOTPEmail(pendingUser.email, code);
  };

  const handleOTPSuccess = () => {
    setShowOTPModal(false);
    setPendingUser(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("frameworkd-otp-pending");
    }
    router.push("/");
  };

  const handleOTPCancel = async () => {
    setShowOTPModal(false);
    setPendingUser(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("frameworkd-otp-pending");
    }
    try {
      await logout();
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // Check provider methods FIRST before attempting auth
      const methods = await getSignInMethodsForEmail(email);

      if (mode === "signin") {
        // For sign-in: check if user can sign in with password
        if (methods.length === 0) {
          // Email not found in provider methods - user doesn't exist
          throw new Error("No account found with this email. Please create an account instead.");
        } else if (!methods.includes("password")) {
          if (methods.includes("google.com")) {
            throw new Error(
              "This email is registered with Google sign-in. Please click 'Continue with Google' instead."
            );
          }
          throw new Error(
            `This email is registered with a different sign-in method. Please use the correct provider.`
          );
        } else {
          // Email exists and has password provider, attempt sign-in with OTP
          const result = await signInWithOTP(email, password);

          if (result.requiresOTP && result.otpSent) {
            // Save OTP pending state so the app stays gated until verification
            if (typeof window !== "undefined") {
              window.sessionStorage.setItem("frameworkd-otp-pending", "true");
            }
            // Show OTP verification modal
            setPendingUser({ email, userId: result.user.uid });
            setShowOTPModal(true);
            return; // Don't redirect yet
          }
        }
      } else {
        // For sign-up: check if email already exists
        if (methods.length > 0) {
          if (methods.includes("password")) {
            throw new Error(
              "This email is already registered with a password. Please sign in instead."
            );
          }
          if (methods.includes("google.com")) {
            throw new Error(
              "This email is already registered with Google sign-in. Please use 'Continue with Google' instead."
            );
          }
          throw new Error(
            "This email is already registered with a different sign-in method. Please use the correct provider."
          );
        }

        // Email doesn't exist, create new account and send verification
        const result = await signUp(email, password);
        setSuccessMessage(result.message);
        setEmail("");
        setPassword("");
      }

      if (mode === "signin") {
        router.push("/");
      }
    } catch (err: any) {
      console.error(`${mode} error:`, err);
      const message = err.message || `${mode === "signin" ? "Sign in" : "Sign up"} failed`;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f4ed] to-[#f3f0eb] flex flex-col">
      {/* Header */}
      <nav className="border-b border-neutral-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight text-amber-700 hover:text-amber-800 transition">
            FRAMEWORKD
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md animate-scale-in">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {mode === "signin" ? "Sign In" : "Create your account"}
              </h1>
              <p className="text-neutral-600">
                {mode === "signin"
                  ? "Welcome back — sign in to continue your analysis."
                  : "Create your free account and start running structural checks."}
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              <p className="font-medium text-neutral-800">Pro tip:</p>
              <p className="mt-1">Use your work or personal email to keep your analysis history in one place.</p>
            </div>

            {/* Success / Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm">
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                rightIcon={showPassword ? "🙈" : "👁"}
                onRightIconClick={() => setShowPassword((prev) => !prev)}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                className="mt-6"
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    await signInWithGoogle();
                    router.push("/");
                  } catch (err: any) {
                    console.error("Google sign-in error:", err);
                    setError(err.message || "Google sign-in failed");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="mt-3"
              >
                Continue with Google
              </Button>
            </form>

            {/* Mode Toggle */}
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 text-center">
                {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setError(null);
                  }}
                  className="text-amber-600 font-semibold hover:text-amber-700 transition"
                  disabled={loading}
                >
                  {mode === "signin" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>

            {/* Back to Landing */}
            <Link
              href="/"
              className="block text-center text-sm text-neutral-600 hover:text-foreground transition"
            >
              ← Back to landing
            </Link>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-neutral-600">
          <p>&copy; 2026 Frameworkd. All rights reserved.</p>
        </div>
      </footer>

      {/* OTP Verification Modal */}
      {showOTPModal && pendingUser && (
        <OTPVerification
          email={pendingUser.email}
          userId={pendingUser.userId}
          onSuccess={handleOTPSuccess}
          onCancel={handleOTPCancel}
          onResend={handleOTPResend}
        />
      )}
    </div>
  );
}
