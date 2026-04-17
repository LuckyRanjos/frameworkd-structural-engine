"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, Button } from "@/components/design-system";

export const dynamic = "force-dynamic";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your account...");

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    const verifyEmail = async () => {
      if (!oobCode) {
        setStatus("error");
        setMessage("Verification link is missing or invalid.");
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }
        setStatus("success");
        setMessage("Account verified successfully. Redirecting to your check page...");
        setTimeout(() => {
          router.push("/diagnostic");
        }, 2500);
      } catch (error: any) {
        console.error("Email verification failed:", error);
        setStatus("error");
        setMessage(
          error?.message || "Email verification failed. Please try again or sign in."
        );
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f4ed] to-[#f3f0eb] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg p-8">
        <div className="space-y-6 text-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {status === "loading"
                ? "Verifying email..."
                : status === "success"
                ? "Verified Successfully"
                : "Verification Failed"}
            </h1>
            <p className="mt-3 text-neutral-600">{message}</p>
          </div>

          {status === "loading" ? (
            <div className="inline-flex items-center justify-center rounded-full bg-amber-100 px-4 py-2 text-amber-700">
              Processing your verification link...
            </div>
          ) : status === "success" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700">
              You will be redirected to the app shortly.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                Please try signing in again or request a new verification email.
              </div>
              <Link href="/signin">
                <Button variant="primary" fullWidth>
                  Go to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
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
  );
}
