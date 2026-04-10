"use client";

import React, { useEffect, useState } from "react";
import { getDailyRemaining } from "@/lib/firebase-helpers";

interface DailyUsageBarProps {
  userId: string;
}

const DailyUsageBar: React.FC<DailyUsageBarProps> = ({ userId }) => {
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    getDailyRemaining(userId).then(setUsage);
  }, [userId]);

  if (!usage) return null;

  const usedPercent = Math.round((usage.used / usage.limit) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6">
      <div className="flex justify-between text-sm mb-3">
        <span className="font-medium">Daily prompts remaining</span>
        <span className="font-semibold">
          {usage.remaining} / {usage.limit}
        </span>
      </div>

      <div className="h-3 bg-gray-100 rounded-3xl overflow-hidden">
        <div
          className={`h-3 ${usage.remaining === 0 ? "bg-red-500" : "bg-blue-600"}`}
          style={{ width: `${usedPercent}%` }}
        />
      </div>

      {usage.remaining === 0 && (
        <p className="text-red-600 text-xs mt-3 font-medium">
          Daily limit reached — come back tomorrow or upgrade your plan
        </p>
      )}
    </div>
  );
};

export default DailyUsageBar;