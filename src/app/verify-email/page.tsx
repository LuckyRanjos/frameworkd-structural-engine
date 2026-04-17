"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { applyVerificationCode, sendVerificationEmail, refreshUserVerification } from "@/lib/auth";
import { useCurrentUser, UserProvider } from "@/components/UserContext";
import { Card, Button } from "@/components/design-system";

export const dynamic = "force-dynamic";

type VerificationStep = "applying" | "success" | "need-signin" | "verified" | "error" | "manual-check";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, emailVerified, isLoading: userLoading } = useCurrentUser();
  const [step, setStep] = useState<VerificationStep>("applying");
  const [message, setMessage] = useState<string>("Verifying your account...");
  const [resendLoading, setResendLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    const verifyEmail = async () => {
      if (!oobCode) {
        setStep("error");
        setMessage("Verification link is missing or invalid. Please request a new verification email.");
        return;
      }

      try {
        const result = await applyVerificationCode(oobCode);

        if (result.isAuthenticated && result.isDomainVerified) {
          // User is authenticated and verification succeeded
          setStep("verified");
          setMessage("Your email has been verified successfully!");
          // Small delay to ensure auth state has settled
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
          // Force redirect after 2 seconds if router.push doesn't work
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        } else if (result.isAuthenticated && !result.isDomainVerified) {
          // User is authenticated but verification didn't apply (shouldn't happen)
          setStep("error");
          setMessage("Verification could not be applied. Please try again.");
        } else if (!result.isAuthenticated) {
          // User is not authenticated - ask them to sign in
          setStep("need-signin");
          setMessage("Email verified! Sign in to access your account.");
        }
      } catch (error: any) {
        console.error("Email verification failed:", error);
        setStep("error");
        setMessage(error.message || "Email verification failed. The link may have expired.");
      }
    };

    // Only verify if we have an oobCode
    if (oobCode) {
      verifyEmail();
    } else {
      // No code - show the manual verification check interface
      setStep("manual-check");
      setMessage("Check your email verification status.");
    }
  }, [router, searchParams]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await sendVerificationEmail();
      setMessage("Verification email resent! Check your inbox.");
    } catch (error: any) {
      setMessage(error.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleRefreshVerification = async () => {
    setRefreshLoading(true);
    try {
      const isVerified = await refreshUserVerification();
      if (isVerified) {
        setStep("verified");
        setMessage("Your email has been verified!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setStep("manual-check");
        setMessage("Your email has not been verified yet. Check your inbox for the verification link.");
      }
    } catch (error: any) {
      setMessage(error.message || "Failed to check verification status.");
    } finally {
      setRefreshLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f4ed] to-[#f3f0eb] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg p-8">
        <div className="space-y-6 text-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {step === "applying"
                ? "Verifying your email..."
                : step === "verified"
                ? "Email Verified!"
                : step === "need-signin"
                ? "Email Verified"
                : step === "manual-check"
                ? "Email Verification"
                : "Verification Failed"}
            </h1>
            <p className="mt-3 text-neutral-600">{message}</p>
          </div>

          {step === "applying" && (
            <div className="inline-flex items-center justify-center rounded-full bg-amber-100 px-4 py-2 text-amber-700">
              Processing your verification link...
            </div>
          )}

          {step === "verified" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700">
              You will be redirected to your dashboard shortly.
            </div>
          )}

          {step === "need-signin" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700">
                Your email address has been verified. Please sign in to continue.
              </div>
              <Link href="/signin">
                <Button variant="primary" fullWidth>
                  Go to Sign In
                </Button>
              </Link>
            </div>
          )}

          {step === "manual-check" && isAuthenticated && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-700">
                {emailVerified
                  ? "Your email is verified!"
                  : "Your email is not verified yet. Click the button to check again after clicking the verification link in your email."}
              </div>
              {!emailVerified && (
                <Button
                  variant="primary"
                  onClick={handleRefreshVerification}
                  loading={refreshLoading}
                  fullWidth
                >
                  I've Verified My Email
                </Button>
              )}
              {!emailVerified && (
                <Button
                  variant="secondary"
                  onClick={handleResendVerification}
                  loading={resendLoading}
                  fullWidth
                >
                  Resend Verification Email
                </Button>
              )}
            </div>
          )}

          {step === "manual-check" && !isAuthenticated && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-700">
                Please sign in to check your email verification status.
              </div>
              <Link href="/signin">
                <Button variant="primary" fullWidth>
                  Go to Sign In
                </Button>
              </Link>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                {message}
              </div>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  onClick={handleResendVerification}
                  loading={resendLoading}
                  fullWidth
                >
                  Resend Verification Email
                </Button>
                <Link href="/signin">
                  <Button variant="secondary" fullWidth>
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <UserProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-6 py-12">
            <Card className="w-full max-w-lg p-8 text-center">
              <p className="text-neutral-600">Loading verification flow...</p>
            </Card>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </UserProvider>
  );
}

