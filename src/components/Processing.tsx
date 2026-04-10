"use client";

import React from "react";
import { HourglassLoader } from "@/components/design-system";

interface ProcessingProps {
  onBack: () => void;
}

const Processing: React.FC<ProcessingProps> = ({ onBack }) => {
  return (
    <div className="card animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-foreground mb-8 transition-colors"
      >
        ← BACK
      </button>

      <h2 className="text-center text-lg font-semibold mb-10">RUNNING STRUCTURAL ANALYSIS</h2>

      {/* Beautiful hourglass loader with label */}
      <div className="flex justify-center mb-12">
        <HourglassLoader size="lg" text="Analyzing your decision structure..." centerText />
      </div>

      {/* Auditor status indicators */}
      <div className="flex justify-center gap-16">
        {/* Claude */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl font-semibold">C</span>
          </div>
          <p className="text-sm font-medium">CLAUDE HAIKU</p>
          <p className="text-xs text-neutral-500 mt-1">Analyzing...</p>
        </div>

        {/* GPT-4o-mini */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl font-semibold">G</span>
          </div>
          <p className="text-sm font-medium">GPT-4o-mini</p>
          <p className="text-xs text-neutral-500 mt-1">Analyzing...</p>
        </div>
      </div>

      <p className="text-center text-neutral-500 mt-12 text-sm">
        Running parallel structural audit with synthesis logic...
      </p>
    </div>
  );
};

export default Processing;