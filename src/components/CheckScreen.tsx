"use client";

import React, { useState } from "react";
import { useCurrentUser } from "./UserContext";
import CheckForm from "./CheckForm";
import Processing from "./Processing";
import Result from "./Result";
import RecentChecks from "./RecentChecks";
import DailyUsageBar from "./DailyUsageBar";

const CheckScreen: React.FC = () => {
  const { userId, isAuthenticated, isLoading } = useCurrentUser();
  const [state, setState] = useState<"input" | "processing" | "result">("input");
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // TEST LOGIN: To test this component, you can:
  // 1. Open browser DevTools and check UserContext in React DevTools
  // 2. Watch the console for user state changes
  // 3. Try making a check without logging in - should see "Please log in" message
  // 4. Log in and try again - should work and call /api/check with userId
  // ============================================================

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
    return <p className="text-center py-12 text-gray-500">Checking authentication...</p>;
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-10 text-center py-12">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-8 rounded-3xl">
          <p className="text-lg font-semibold mb-2">Please log in to continue</p>
          <p className="text-sm text-blue-700">
            You need to be signed in to run structural checks. 
            Log in with your email to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Daily usage bar shows only for authenticated users */}
      {userId && <DailyUsageBar userId={userId} />}

      {error && (
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-3xl text-center">
          {error}
        </div>
      )}

      {state === "input" && <CheckForm onSubmit={handleSubmit} />}
      {state === "processing" && <Processing onBack={() => setState("input")} />}
      {state === "result" && <Result data={resultData} onBack={() => setState("input")} />}

      <RecentChecks />
    </div>
  );
};

export default CheckScreen;