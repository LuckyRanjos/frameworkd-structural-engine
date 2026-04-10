"use client";

import React from "react";
import { Button } from "./design-system/Button";

interface ResultProps {
  data: any;
  onBack: () => void;
}

const Result: React.FC<ResultProps> = ({ data, onBack }) => {
  if (!data) return null;

  const scorecard = data.scorecard || {};
  const verdict = data.verdict || {};

  // Get verdict styling
  const getVerdictStyle = (status: string) => {
    if (!status) return { bg: "bg-neutral-100", text: "text-neutral-700", border: "border-neutral-300" };
    if (status === "PASS" || status === "STRUCTURAL POTENTIAL") return { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" };
    if (status === "CONDITIONAL" || status === "YELLOW") return { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" };
    return { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" };
  };

  const verdictStyle = getVerdictStyle(verdict.status);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          icon="←"
          className="text-neutral-600 hover:text-neutral-900"
        >
          Back to Analysis
        </Button>
        <div className="text-sm text-neutral-500">
          Structural Decision Analysis Report
        </div>
      </div>

      {/* Main Verdict Section */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Verdict Header */}
        <div className={`${verdictStyle.bg} ${verdictStyle.border} border-b px-8 py-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Structural Analysis Complete
              </h1>
              <p className="text-lg text-neutral-700">
                {verdict.summary || "Analysis completed successfully"}
              </p>
            </div>
            {scorecard.total !== undefined && (
              <div className="text-right">
                <div className={`text-6xl font-bold ${getScoreColor(scorecard.total)}`}>
                  {scorecard.total}
                </div>
                <div className="text-sm text-neutral-600">out of 5</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Summary Section */}
          {verdict.summary && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Executive Summary</h2>
              <div className="bg-neutral-50 rounded-2xl p-6">
                <p className="text-neutral-700 leading-relaxed">
                  {verdict.summary}
                </p>
              </div>
            </div>
          )}

          {/* Key Insight - Highlighted */}
          {data.step4_insight?.key_insight && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Key Strategic Insight</h2>
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1">
                    <p className="text-amber-900 font-medium leading-relaxed italic">
                      {data.step4_insight.key_insight}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scorecard */}
          {scorecard.total !== undefined && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Structural Integrity Scorecard</h2>
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                <div className="p-6 space-y-4">
                  {[
                    { label: "Choice removed from stakeholders", value: scorecard.choice_removed },
                    { label: "Default flow routes through system", value: scorecard.default_flow },
                    { label: "Enforcement exists (independent of motivation)", value: scorecard.enforcement_exists },
                    { label: "External penalty for non-use (immediate)", value: scorecard.external_penalty },
                    { label: "Reversal causes systemic scream", value: scorecard.reversal_screams },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
                      <span className="text-neutral-700 flex-1 pr-4">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                          <span className={`text-sm font-bold ${item.value ? 'text-green-600' : 'text-neutral-400'}`}>
                            {item.value ? '✓' : '○'}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-neutral-600 w-8 text-center">
                          {item.value ? '1' : '0'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Score */}
                <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total Structural Score</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-3xl font-bold ${getScoreColor(scorecard.total)}`}>
                        {scorecard.total}/5
                      </span>
                    </div>
                  </div>
                  {scorecard.result && (
                    <p className="text-sm text-neutral-600 mt-2">
                      {scorecard.result}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Required Actions */}
          {verdict.required_actions?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Recommended Actions</h2>
              <div className="space-y-3">
                {verdict.required_actions.map((action: string, index: number) => (
                  <div key={index} className="flex gap-4 p-4 bg-neutral-50 rounded-2xl">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-neutral-700 leading-relaxed flex-1">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Path to Unlock (if available) */}
          {data.step5_path && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Implementation Roadmap</h2>
              <div className="grid gap-4">
                {[
                  { phase: "Phase 1", title: "Entry Wedge", content: data.step5_path.phase1_wedge },
                  { phase: "Phase 2", title: "Structural Integration", content: data.step5_path.phase2_integration },
                  { phase: "Phase 3", title: "Ecosystem Lock-in", content: data.step5_path.phase3_lockin },
                ].map((phase, index) => (
                  <div key={index} className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-amber-800">{phase.phase}</div>
                        <div className="font-semibold text-foreground">{phase.title}</div>
                      </div>
                    </div>
                    <p className="text-neutral-700 leading-relaxed ml-11">
                      {phase.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Flags */}
          {(data.precondition?.risk_flag || data.step5_path?.risk_flag) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Risk Considerations</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="text-xl">⚠️</div>
                  <div className="space-y-2">
                    {data.precondition?.risk_flag && (
                      <p className="text-amber-800">{data.precondition.risk_flag}</p>
                    )}
                    {data.step5_path?.risk_flag && (
                      <p className="text-amber-800">{data.step5_path.risk_flag}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-8"
        >
          Run Another Analysis
        </Button>
        <Button
          variant="primary"
          onClick={() => window.print()}
          className="px-8"
        >
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default Result;