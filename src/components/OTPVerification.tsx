// ============================================================
// components/OTPVerification.tsx
// OTP verification modal for 2FA
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import { verifyOTP } from "@/lib/otp";
import { Card, Button, Input } from "@/components/design-system";

interface OTPVerificationProps {
  email: string;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
  onResend: () => Promise<void>;
}

export default function OTPVerification({
  email,
  userId,
  onSuccess,
  onCancel,
  onResend,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (otp.length !== 6) {
        throw new Error("Please enter a 6-digit code");
      }

      const isValid = await verifyOTP(email, otp);

      if (isValid) {
        onSuccess();
      } else {
        throw new Error("Invalid or expired code. Please try again.");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);

    try {
      await onResend();
      setCountdown(60); // 60 second cooldown
      setOtp(""); // Clear the input
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md animate-scale-in">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Verify Your Email
            </h2>
            <p className="text-neutral-600">
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Enter 6-digit code"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                // Only allow digits and limit to 6 characters
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
              }}
              required
              disabled={loading}
              autoFocus
              className="text-center text-2xl tracking-widest font-mono"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={otp.length !== 6}
            >
              Verify Code
            </Button>
          </form>

          {/* Resend Code */}
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 text-center">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={resendLoading || countdown > 0}
                className="text-amber-600 font-semibold hover:text-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend Code"}
              </button>
            </p>
          </div>

          {/* Cancel */}
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}