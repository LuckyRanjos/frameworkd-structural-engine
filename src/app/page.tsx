"use client";

import React from "react";
import { UserProvider, useCurrentUser } from "@/components/UserContext";
import LandingPage from "@/components/LandingPage";
import AppPage from "@/components/AppPage";

/**
 * Root Page Component
 * 
 * This page intelligently routes between:
 * - Landing page (for unauthenticated visitors)
 * - App page (for authenticated users)
 * 
 * The UserContext handles authentication state, so we can conditionally
 * render based on isAuthenticated flag.
 */
function PageContent() {
  const { isAuthenticated, isLoading } = useCurrentUser();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="hourglass-loader w-16 h-16">
              <div className="hourglass">
                <div className="sand"></div>
                <div className="sand"></div>
                <div className="sand"></div>
                <div className="hourglass-bottom"></div>
                <div className="hourglass-frame"></div>
              </div>
            </div>
          </div>
          <p className="text-neutral-600">Preparing Frameworkd...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Show app for authenticated users
  return <AppPage />;
}

export default function Home() {
  return (
    <UserProvider>
      <PageContent />
    </UserProvider>
  );
}