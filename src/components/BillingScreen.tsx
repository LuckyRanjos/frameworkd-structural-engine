"use client";

import React, { useState } from "react";
import { Button, Card, Input } from "@/components/design-system";

const BillingScreen: React.FC = () => {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & payment</h1>
          <p className="text-neutral-600 mt-2 max-w-2xl">
            Keep your plan information and billing flow ready for future upgrades. This placeholder is designed to be extended with payment integration later.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setShowPayment(true)}>
            Add payment method
          </Button>
          <Button variant="ghost" onClick={() => setShowPayment(false)}>
            Payment flow preview
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <Card className="space-y-6 p-8">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Subscription summary</h2>
            <p className="text-neutral-600 leading-relaxed">
              You are currently on the Free plan. When ready, payment support will allow you to upgrade and unlock premium analyses, team sharing, and usage tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
            <div className="space-y-1">
              <span className="block font-semibold text-neutral-800">Current plan</span>
              <p>Free</p>
            </div>
            <div className="space-y-1">
              <span className="block font-semibold text-neutral-800">Next invoice</span>
              <p>Not billed yet</p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4 text-amber-800 text-sm">
            This is a billing placeholder. Payment form fields, card setup, and subscription upgrades will be integrated in a later release.
          </div>
        </Card>

        <Card className="space-y-6 p-8">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Add payment method</h2>
            <p className="text-neutral-600 leading-relaxed">
              Store a card to enable premium plan checkout later. No payment details are required for the free tier today.
            </p>
          </div>

          {showPayment ? (
            <div className="space-y-4">
              <Input
                label="Card number"
                placeholder="4242 4242 4242 4242"
                disabled
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Expiry" placeholder="MM / YY" disabled />
                <Input label="CVC" placeholder="123" disabled />
              </div>
              <div className="text-sm text-neutral-500">
                This is a placeholder experience. When enabled, your card details will be securely captured and saved for future billing.
              </div>
              <Button variant="primary" fullWidth disabled>
                Save payment method
              </Button>
            </div>
          ) : (
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-neutral-600">
              <p className="font-medium text-neutral-800 mb-2">Payment integration placeholder</p>
              <p className="text-sm leading-relaxed">
                Add your payment method later when premium plan checkout is available. The design is ready, and the flow will be connected in the next development phase.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BillingScreen;
