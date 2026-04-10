"use client";

import React from "react";
import { UserProvider } from "@/components/UserContext";
import AppPage from "@/components/AppPage";

export default function HistoryPage() {
  return (
    <UserProvider>
      <AppPage />
    </UserProvider>
  );
}