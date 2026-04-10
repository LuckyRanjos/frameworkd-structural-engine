"use client";

import React, { useState } from 'react';
import { logout } from '@/lib/auth';
import { useCurrentUser } from './UserContext';

const Navbar: React.FC = () => {
  const { email, plan, isAuthenticated, role } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ============================================================
  // TEST LOGIN: To test the logout button:
  // 1. Log in to the app
  // 2. Click the logout button (appears next to plan badge)
  // 3. You should be redirected and see "Not signed in" text
  // 4. Check that userId in context becomes null
  // ============================================================

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Firebase onAuthStateChanged listener will automatically update context
      // User will be redirected by page refresh or navigation
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  // Extract user initials from email
  const getInitials = (emailStr: string | null) => {
    if (!emailStr) return "?";
    const name = emailStr.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xl font-semibold">
        FRAMEWORKD <span className="text-gray-400">/</span> STRUCTURAL ENGINE
      </div>
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {/* Show admin badge if user has admin role */}
            {role === 'admin' && (
              <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                ADMIN
              </span>
            )}
            <span className="px-4 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
              {plan ? plan.toUpperCase() : "FREE"} PLAN
            </span>
            <div className="w-8 h-8 bg-gray-800 text-white text-sm font-medium flex items-center justify-center rounded-full">
              {getInitials(email)}
            </div>
            {/* Logout button - requires authentication to use context */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="ml-4 px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50 transition-colors"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </>
        ) : (
          <span className="text-sm text-gray-600">Not signed in</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;