"use client";

import React, { useState } from "react";
import { Button } from "./design-system/Button";
import { HourglassLoader } from "./design-system/HourglassLoader";

interface CheckFormProps {
  onSubmit: (payload: any) => void;
}

const CheckForm: React.FC<CheckFormProps> = ({ onSubmit }) => {
  const [decisionText, setDecisionText] = useState("");
  const [mode, setMode] = useState("Business");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modes = [
    { id: "Business", label: "Business", description: "Strategic decisions & planning" },
    { id: "Career", label: "Career", description: "Professional growth & choices" },
    { id: "Habit-Behavior", label: "Habit/Behavior", description: "Personal development & routines" },
    { id: "Social-Institutional", label: "Social/Institutional", description: "Community & organizational decisions" },
  ];

  const handleRun = async () => {
    if (!decisionText.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        decisionText: decisionText.trim(),
        mode,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Structural Decision Analysis
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Get AI-powered insights into your decision framework. Describe your decision below and let our analysis reveal hidden patterns and structural tensions.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-foreground">Analysis Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modes.map((modeOption) => (
            <button
              key={modeOption.id}
              onClick={() => setMode(modeOption.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                mode === modeOption.id
                  ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <div className="font-semibold text-base mb-1">{modeOption.label}</div>
              <div className={`text-sm ${mode === modeOption.id ? 'text-amber-700' : 'text-neutral-500'}`}>
                {modeOption.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Decision Input */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-foreground">Your Decision</h2>
        <div className="relative">
          <textarea
            value={decisionText}
            onChange={(e) => setDecisionText(e.target.value)}
            placeholder="Describe your decision in detail. Be specific about:

• Who is making this decision?
• What is the current situation or problem?
• What are the key options you're considering?
• What outcomes do you expect?
• What constraints or risks are you facing?

The more context you provide, the deeper and more actionable our analysis will be."
            className="w-full h-64 p-6 text-base leading-relaxed border-2 border-neutral-200 rounded-3xl bg-white focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all duration-200 resize-none placeholder:text-neutral-400"
            disabled={isSubmitting}
          />
          <div className="absolute bottom-4 right-4 text-xs text-neutral-400">
            {decisionText.length} characters
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleRun}
          disabled={!decisionText.trim() || isSubmitting}
          loading={isSubmitting}
          className="px-12 py-4 text-lg font-semibold"
          icon={isSubmitting ? null : "🎯"}
          iconPosition="left"
        >
          {isSubmitting ? "Analyzing Structure..." : "Run Structural Check"}
        </Button>
      </div>

      {/* Loading State */}
      {isSubmitting && (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <HourglassLoader size="lg" text="Frameworkd is analyzing your decision structure..." centerText />
          <div className="text-center space-y-2 max-w-md">
            <p className="text-sm text-neutral-600">
              This may take a moment as we perform multi-step structural analysis using advanced AI models.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckForm;