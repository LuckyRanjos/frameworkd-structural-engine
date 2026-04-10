"use client";

import React, { useEffect, useState } from "react";
import { useCurrentUser } from "./UserContext";
import { getUserDecisions } from "@/lib/firebase-helpers";

const RecentChecks: React.FC = () => {
  const { userId } = useCurrentUser();
  const [checks, setChecks] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    getUserDecisions(userId, 3).then(setChecks);
  }, [userId]);

  // ... (rest of the component stays exactly the same as before)
  const getBadge = (verdict: string) => {
    if (verdict === "PASS") return "bg-green-100 text-green-700";
    if (verdict === "CONDITIONAL") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-5">RECENT CHECKS</h2>
      <div className="space-y-4">
        {checks.map((check) => (
          <div key={check.id} className="card p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1 text-xs font-semibold rounded-3xl ${getBadge(check.verdict)}`}>
                {check.verdict}
              </span>
              <p className="font-medium text-gray-800 line-clamp-2">{check.decisionText}</p>
            </div>
            <span className="text-sm text-gray-400">
              {check.createdAt
                ? new Date(check.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "just now"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentChecks;