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

  const getVerdictText = (verdict: any) => {
    if (!verdict) return "FAIL";
    if (typeof verdict === "string") return verdict;
    return verdict.status || verdict.final_verdict?.status || "FAIL";
  };

  const getBadge = (verdict: string) => {
    if (verdict === "PASS") return "bg-green-100 text-green-700";
    if (verdict === "CONDITIONAL") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-4">
      {checks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4 opacity-50">📊</div>
          <p className="text-neutral-500 text-sm">No recent analyses yet</p>
          <p className="text-neutral-400 text-xs mt-1">Your first analysis will appear here</p>
        </div>
      ) : (
        checks.map((check) => (
          <div key={check.id} className="bg-white border border-neutral-200 rounded-2xl p-4 hover:shadow-sm transition-shadow duration-200">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                {(() => {
                  const verdictText = getVerdictText(check.verdict);
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadge(verdictText)}`}>
                          {verdictText}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {check.createdAt
                            ? new Date(check.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "just now"}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 line-clamp-2 leading-relaxed">
                        {check.decisionText}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentChecks;