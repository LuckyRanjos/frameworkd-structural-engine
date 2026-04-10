"use client";

import React from "react";
import { Card, Button } from "@/components/design-system";

const AdminScreen: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin console</h1>
          <p className="text-neutral-600 mt-2 max-w-2xl">
            This section is reserved for administrators. It includes user, plan, and system controls in a future phase.
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Refresh status
        </Button>
      </div>

      <Card className="p-8 space-y-6">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">System status</h2>
          <p className="text-neutral-600 leading-relaxed">
            Administration tools are coming soon. This page is a placeholder for user management, audit controls, and premium plan settings.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Users", value: "—" },
            { label: "Active checks", value: "—" },
            { label: "Pending upgrades", value: "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-neutral-200 bg-white p-5 text-sm">
              <p className="text-neutral-500">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminScreen;
