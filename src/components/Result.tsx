"use client";

import React from "react";

interface ResultProps {
  data: any;
  onBack: () => void;
}

const Result: React.FC<ResultProps> = ({ data, onBack }) => {
  if (!data) return null;

  const verdictColor =
    data.verdict === "PASS"
      ? "bg-green-100 text-green-700"
      : data.verdict === "CONDITIONAL"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black"
      >
        ← BACK TO INPUT
      </button>

      {/* Verdict Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-3xl text-sm font-semibold ${verdictColor}`}>
          {data.verdict}
        </div>
        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-7xl font-semibold">{data.score}</span>
          <span className="text-gray-400 text-2xl">/ 5</span>
        </div>
        <p className="mt-2 text-gray-600">{data.summary}</p>
      </div>

      {/* Key Insight */}
      {data.keyInsight && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <h3 className="font-medium mb-3">KEY INSIGHT</h3>
          <p className="text-gray-700 leading-relaxed">{data.keyInsight}</p>
        </div>
      )}

      {/* Required Actions */}
      {data.requiredActions?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <h3 className="font-medium mb-4">REQUIRED ACTIONS</h3>
          <ul className="space-y-4">
            {data.requiredActions.map((action: string, i: number) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-sm text-gray-400">{(i + 1).toString().padStart(2, "0")}</span>
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pivot Suggestions */}
      {data.pivotSuggestions?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <h3 className="font-medium mb-4">PIVOT SUGGESTIONS</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {data.pivotSuggestions.map((suggestion: string, i: number) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Result;