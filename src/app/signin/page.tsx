"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth";
import { Card, Button, Input } from "@/components/design-system";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }

      // On success, redirect to home page
      // The UserContext will automatically update and show the app
      router.push("/");
    } catch (err: any) {
      console.error(`${mode} error:`, err);
      setError(err.message || `${mode === "signin" ? "Sign in" : "Sign up"} failed`);
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
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
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
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
    </div>
  );
}
