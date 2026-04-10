"use client";

import React, { useEffect, useState } from "react";
import { useCurrentUser } from "./UserContext";
import { getUserStats } from "@/lib/firebase-helpers";
import DailyUsageBar from "./DailyUsageBar";

const DashboardScreen: React.FC = () => {
  const { userId } = useCurrentUser();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getUserStats(userId).then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <p className="text-center py-12 text-gray-500">Loading dashboard...</p>;

  return (
    <div className="space-y-10">
      {userId && <DailyUsageBar userId={userId} />}
      {/* rest of your dashboard grid stays exactly the same */}
      <div>
        <h2 className="text-lg font-medium mb-6">YOUR PERFORMANCE</h2>
        <div className="grid grid-cols-3 gap-6">
          {/* ... your existing stat cards */}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;