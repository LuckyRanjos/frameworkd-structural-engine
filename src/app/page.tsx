"use client";

import { useState } from "react";
import { UserProvider } from "@/components/UserContext";
import Navbar from "@/components/Navbar";
import Tabs from "@/components/Tabs";
import CheckScreen from "@/components/CheckScreen";
import HistoryScreen from "@/components/HistoryScreen";
import DashboardScreen from "@/components/DashboardScreen";

export default function Home() {
  const [tab, setTab] = useState<"check" | "history" | "dashboard">("check");

  return (
    <UserProvider>
      <div className="min-h-screen bg-[#f8f4ed]">
        <Navbar />
        <Tabs tab={tab} setTab={setTab} />

        <main className="max-w-4xl mx-auto px-6 py-8">
          {tab === "check" && <CheckScreen />}
          {tab === "history" && <HistoryScreen />}
          {tab === "dashboard" && <DashboardScreen />}
        </main>
      </div>
    </UserProvider>
  );
}