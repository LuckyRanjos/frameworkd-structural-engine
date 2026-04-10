"use client";

import React from "react";

interface ProcessingProps {
  onBack: () => void;
}

const Processing: React.FC<ProcessingProps> = ({ onBack }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black mb-8"
      >
        ← BACK
      </button>

      <h2 className="text-center text-lg font-medium mb-10">RUNNING STRUCTURAL ANALYSIS</h2>

      <div className="flex justify-center gap-16">
        {/* Claude */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">C</span>
          </div>
          <p className="text-sm font-medium">CLAUDE HAIKU</p>
        </div>

        {/* GPT-4o-mini */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">G</span>
          </div>
          <p className="text-sm font-medium">GPT-4o-mini</p>
        </div>
      </div>

      <p className="text-center text-gray-500 mt-12 text-sm">
        Running parallel structural audit...
      </p>
    </div>
  );
};

export default Processing;