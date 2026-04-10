"use client";

import React, { useState } from "react";
import { useCurrentUser } from "./UserContext";
import CheckForm from "./CheckForm";
import Processing from "./Processing";
import Result from "./Result";
import RecentChecks from "./RecentChecks";
import DailyUsageBar from "./DailyUsageBar";

const CheckScreen: React.FC = () => {
  const { userId } = useCurrentUser();
  const [state, setState] = useState<"input" | "processing" | "result">("input");
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: { decisionText: string; mode: string }) => {
    if (!userId) {
      setError("Please log in to run a check.");
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

  return (
    <div className="space-y-10">
      <DailyUsageBar userId={userId || "test-user"} />

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