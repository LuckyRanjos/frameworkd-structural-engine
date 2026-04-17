"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import CheckScreen from "@/components/CheckScreen";
import HistoryScreen from "@/components/HistoryScreen";
import DashboardScreen from "@/components/DashboardScreen";
import BillingScreen from "@/components/BillingScreen";
import AdminScreen from "@/components/AdminScreen";
import { useCurrentUser } from "@/components/UserContext";
import { sendVerificationEmail, logout } from "@/lib/auth";
import { Button, Card } from "@/components/design-system";
import OTPVerification from "@/components/OTPVerification";
import { saveOTP, sendOTPEmail } from "@/lib/otp";

export default function AppPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, emailVerified, requiresOTP, completeOTPVerification, email, userId } = useCurrentUser();
  const [resendLoading, setResendLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleResend = async () => {
    setStatusMessage(null);
    setStatusError(null);
    setResendLoading(true);
    try {
      await sendVerificationEmail();
      setStatusMessage("Verification email resent. Check your inbox.");
    } catch (error: any) {
      setStatusError(error.message || "Unable to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-6">
        <Card className="max-w-md p-10 text-center animate-fade-in">
          <div className="space-y-4">
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-amber-400 animate-pulse" />
            </div>
            <p className="text-neutral-600">Loading your workspace…</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-6 py-12">
        <Card className="max-w-xl p-10 text-center animate-fade-in">
          <div className="space-y-6">
            <div className="text-3xl font-bold text-foreground">Sign in to continue</div>
            <p className="text-neutral-600 leading-relaxed">
              Your structural analysis workspace is protected. Sign in to access diagnostics, history, and billing.
            </p>
            <Button variant="primary" onClick={() => router.push('/signin')} fullWidth>
              Go to Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (requiresOTP) {
    return (
      <OTPVerification
        email={email || ""}
        userId={userId || ""}
        onSuccess={() => completeOTPVerification()}
        onCancel={async () => {
          try {
            await logout();
          } catch (err: any) {
            console.error("Logout failed:", err);
          }
        }}
        onResend={async () => {
          if (email && userId) {
            const code = await saveOTP(email, userId);
            await sendOTPEmail(email, code);
          }
        }}
      />
    );
  }

  if (!emailVerified) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-6 py-12">
        <Card className="max-w-2xl p-10 text-center animate-fade-in">
          <div className="space-y-6">
            <div className="text-3xl font-bold text-foreground">
              Verify your email to continue
            </div>
            <p className="text-neutral-600 leading-relaxed">
              Your account is signed in, but email verification is required before you can access the app.
              Check your inbox for the verification message, then return here.
            </p>
            {statusMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                {statusMessage}
              </div>
            )}
            {statusError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {statusError}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="primary"
                onClick={handleResend}
                loading={resendLoading}
                fullWidth
              >
                Resend verification email
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                fullWidth
              >
                Refresh after verifying
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const getCurrentScreen = () => {
    if (pathname === '/' || pathname === '/dashboard') {
      return <DashboardScreen />;
    }
    if (pathname === '/diagnostic') {
      return <CheckScreen />;
    }
    if (pathname === '/history') {
      return <HistoryScreen />;
    }
    if (pathname === '/billing') {
      return <BillingScreen />;
    }
    if (pathname === '/admin') {
      return <AdminScreen />;
    }
    return <DashboardScreen />;
  };

  return (
    <div className="min-h-screen bg-[#f8f4ed] flex">
      <Sidebar className="w-80 flex-shrink-0" />
      <main className="flex-1 overflow-auto py-8">
        <div className="max-w-6xl mx-auto px-8">
          {getCurrentScreen()}
        </div>
      </main>
    </div>
  );
}
