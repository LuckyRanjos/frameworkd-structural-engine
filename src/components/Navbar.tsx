"use client";

import React from 'react';
import { useCurrentUser } from './UserContext';

const Navbar: React.FC = () => {
  const { email, plan, isAuthenticated } = useCurrentUser();

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
            <span className="px-4 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
              {plan ? plan.toUpperCase() : "FREE"} PLAN
            </span>
            <div className="w-8 h-8 bg-gray-800 text-white text-sm font-medium flex items-center justify-center rounded-full">
              {getInitials(email)}
            </div>
          </>
        ) : (
          <span className="text-sm text-gray-600">Not signed in</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;