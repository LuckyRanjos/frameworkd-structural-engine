"use client";

import React from "react";
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import CheckScreen from "@/components/CheckScreen";
import HistoryScreen from "@/components/HistoryScreen";
import DashboardScreen from "@/components/DashboardScreen";
import BillingScreen from "@/components/BillingScreen";
import AdminScreen from "@/components/AdminScreen";
import { useCurrentUser } from "@/components/UserContext";
import { Button, Card } from "@/components/design-system";

export default function AppPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-6">
        <Card className="max-w-md p-10 text-center animate-fade-in">
          <div className="space-y-4">
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-amber-400 animate-pulse" />
            </div>
            <p className="text-neutral-600">Loading your workspace…</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center px-6 py-12">
        <Card className="max-w-xl p-10 text-center animate-fade-in">
          <div className="space-y-6">
            <div className="text-3xl font-bold text-foreground">Sign in to continue</div>
            <p className="text-neutral-600 leading-relaxed">
              Your structural analysis workspace is protected. Sign in to access diagnostics, history, and billing.
            </p>
            <Button variant="primary" onClick={() => router.push('/signin')} fullWidth>
              Go to Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getCurrentScreen = () => {
    if (pathname === '/' || pathname === '/dashboard') {
      return <DashboardScreen />;
    }
    if (pathname === '/diagnostic') {
      return <CheckScreen />;
    }
    if (pathname === '/history') {
      return <HistoryScreen />;
    }
    if (pathname === '/billing') {
      return <BillingScreen />;
    }
    if (pathname === '/admin') {
      return <AdminScreen />;
    }
    return <DashboardScreen />;
  };

  return (
    <div className="min-h-screen bg-[#f8f4ed] flex">
      <Sidebar className="w-80 flex-shrink-0" />
      <main className="flex-1 overflow-auto py-8">
        <div className="max-w-6xl mx-auto px-8">
          {getCurrentScreen()}
        </div>
      </main>
    </div>
  );
}
