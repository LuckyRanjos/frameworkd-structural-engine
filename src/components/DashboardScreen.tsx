"use client";

import React, { useEffect, useState } from "react";
import { useCurrentUser } from "./UserContext";
import { getUserStats } from "@/lib/firebase-helpers";
import DailyUsageBar from "./DailyUsageBar";

const DashboardScreen: React.FC = () => {
  const { userId, isAuthenticated, isLoading: userLoading, role } = useCurrentUser();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // TEST LOGIN: To test the dashboard:
  // 1. Log in with your credentials
  // 2. Navigate to the Dashboard tab
  // 3. Verify that userId is used to load user stats
  // 4. If user.role === 'admin', you should see the ADMIN badge in navbar
  // 5. Check console to verify userId is being passed to getUserStats
  // ============================================================

  useEffect(() => {
    // Only fetch stats if userId is available from authenticated context
    if (!userId || !isAuthenticated) {
      setLoading(false);
      return;
    }
    getUserStats(userId).then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, [userId, isAuthenticated]);

  // Show loading while fetching user context
  if (userLoading) {
    return <p className="text-center py-12 text-gray-500">Checking authentication...</p>;
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-10 text-center py-12">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-8 rounded-3xl">
          <p className="text-lg font-semibold mb-2">Please log in to view dashboard</p>
          <p className="text-sm text-blue-700">
            Sign in to access your performance statistics and usage data.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <p className="text-center py-12 text-gray-500">Loading dashboard...</p>;

  return (
    <div className="space-y-10">
      {/* Admin indicator in dashboard */}
      {role === 'admin' && (
        <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="text-purple-700 font-medium text-sm">👨‍💼 Admin Dashboard</span>
          <span className="text-purple-600 text-xs">User role: {role}</span>
        </div>
      )}
      
      {/* Daily usage only shown if userId exists from context */}
      {userId && <DailyUsageBar userId={userId} />}
      
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