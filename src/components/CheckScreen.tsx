"use client";

import React, { useState } from "react";
import { useCurrentUser } from "./UserContext";
import CheckForm from "./CheckForm";
import Processing from "./Processing";
import Result from "./Result";
import RecentChecks from "./RecentChecks";
import DailyUsageBar from "./DailyUsageBar";
import { HourglassLoader } from "./design-system/HourglassLoader";
import LoadingState from "./LoadingState";

const CheckScreen: React.FC = () => {
  const { userId, isAuthenticated, isLoading } = useCurrentUser();
  const [state, setState] = useState<"input" | "processing" | "result">("input");
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: { decisionText: string; mode: string }) => {
    // Authentication check: userId is required and must be from context
    if (!userId || !isAuthenticated) {
      setError("You must be logged in to run a structural check.");
      return;
    }

    setState("processing");
    setError(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, userId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResultData(data.result);
      setState("result");
    } catch (err: any) {
      setError(err.message);
      setState("input");
    }
  };

  // Show loading state while context is initializing
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <HourglassLoader size="lg" centerText />
          <p className="text-neutral-600 font-medium">Preparing Frameworkd...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-semibold text-foreground">Sign In Required</h1>
          <p className="text-neutral-600">
            You need to be signed in to run structural decision analysis.
            Log in with your email to get started.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 max-w-sm">
          <p className="text-sm text-amber-800">
            <strong>Why sign in?</strong> Your analysis history is saved securely,
            and you get access to advanced features like usage tracking and personalized insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Daily usage bar shows only for authenticated users */}
      {userId && <DailyUsageBar userId={userId} />}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
          <div className="text-red-800 font-medium mb-2">Analysis Failed</div>
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Main content based on state */}
      <div className="space-y-16">
        {state === "input" && (
          <div className="space-y-16">
            <CheckForm onSubmit={handleSubmit} />

            {/* Recent checks - subtle preview below */}
            <div className="border-t border-neutral-200 pt-12">
              <div className="text-center mb-8">
                <h2 className="text-xl font-medium text-neutral-700 mb-2">Recent Analyses</h2>
                <p className="text-neutral-500 text-sm">Your previous decision insights</p>
              </div>
              <RecentChecks />
            </div>
          </div>
        )}

        {state === "processing" && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingState message="Running structural analysis..." />
          </div>
        )}

        {state === "result" && (
          <Result data={resultData} onBack={() => setState("input")} />
        )}
      </div>
    </div>
  );
};

export default CheckScreen;