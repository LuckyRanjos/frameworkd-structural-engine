"use client";

import React from "react";

interface ResultProps {
  data: any;
  onBack: () => void;
}

const Result: React.FC<ResultProps> = ({ data, onBack }) => {
  if (!data) return null;

  const getVerdictColor = (flag: string) => {
    if (!flag) return "bg-gray-100 text-gray-700";
    if (flag === "PASS" || flag === "STRUCTURAL POTENTIAL") return "bg-green-100 text-green-700";
    if (flag === "CONDITIONAL" || flag === "YELLOW") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const getFlagBadge = (flag: string) => {
    if (!flag) return "☐";
    if (flag === "PASS" || flag === "CLEAR") return "✓";
    if (flag === "CONDITIONAL" || flag === "YELLOW") return "⚠️";
    return "✗";
  };

  const scorecard = data.scorecard || {};
  const verdict = data.verdict || {};

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black"
      >
        ← BACK TO INPUT
      </button>

      {/* VERDICT BANNER */}
      <div className={`border-l-4 border-current rounded-lg p-6 ${getVerdictColor(verdict.status)}`}>
        <h2 className="text-2xl font-bold mb-2">STRUCTURAL UNLOCK VERDICT</h2>
        <p className="text-base leading-relaxed font-medium">{verdict.summary}</p>
      </div>

      {/* PRECONDITION CHECK */}
      {data.precondition && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <h3 className="font-semibold text-lg mb-4">PRE-CONDITION CHECK</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Mode:</span>
              <p className="font-medium">{data.precondition.mode}</p>
            </div>
            <div>
              <span className="text-gray-500">Actor:</span>
              <p className="font-medium">{data.precondition.actor}</p>
            </div>
            <div>
              <span className="text-gray-500">Enforcer:</span>
              <p className="font-medium">{data.precondition.enforcer}</p>
            </div>
            <div>
              <span className="text-gray-500">Penalty:</span>
              <p className="font-medium">{data.precondition.penalty}</p>
            </div>
          </div>
          {data.precondition.risk_flag && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
              🚩 {data.precondition.risk_flag}
            </div>
          )}
        </div>
      )}

      {/* STEP 0: THE ILLUSION */}
      {data.step0_illusion && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-300">0</span>
            <h3 className="font-semibold text-lg">NAME THE ILLUSION</h3>
            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${getVerdictColor(data.step0_illusion.flag)}`}>
              {data.step0_illusion.flag}
            </span>
          </div>
          <p className="text-gray-700 mb-4">{data.step0_illusion.explanation}</p>
          {data.step0_illusion.not_caused_by?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">What this is NOT caused by:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {data.step0_illusion.not_caused_by.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* STEP 1: PRE-TIPPING REALITY */}
      {data.step1_pretipping && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-300">1</span>
            <h3 className="font-semibold text-lg">PRE-TIPPING MARKET REALITY</h3>
            <span className="ml-auto px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">PASS</span>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Current Workaround:</p>
              <p className="text-gray-700">{data.step1_pretipping.current_workaround}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Why Tolerated:</p>
              <p className="text-gray-700">{data.step1_pretipping.why_tolerated}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Cost of Non-Use Today:</p>
              <p className="text-gray-700">{data.step1_pretipping.non_use_cost}</p>
            </div>
          </div>
          {data.step1_pretipping.rigor_gate_triggered && (
            <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
              ⚠️ Rigor gate triggered — requires more effort than workaround
            </div>
          )}
        </div>
      )}

      {/* STEP 2: STRUCTURAL UNLOCK */}
      {data.step2_unlock && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-300">2</span>
            <h3 className="font-semibold text-lg">CANDIDATE STRUCTURAL UNLOCK</h3>
            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${data.step2_unlock.persuasion_bound ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {data.step2_unlock.persuasion_bound ? "FAIL" : "PASS"}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Mechanism Type:</p>
              <p className="font-semibold text-gray-700">{data.step2_unlock.mechanism_type}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">How it Works:</p>
              <p className="text-gray-700">{data.step2_unlock.mechanism_description}</p>
            </div>
          </div>
          {data.step2_unlock.persuasion_bound && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
              ❌ This system is persuasion-bound (not structurally enforced)
            </div>
          )}
        </div>
      )}

      {/* STEP 2.5: ENFORCEMENT REALITY CHECK */}
      {data.step2_5_enforcement && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-300">2.5</span>
            <h3 className="font-semibold text-lg">ENFORCEMENT REALITY CHECK</h3>
            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${data.step2_5_enforcement.pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {data.step2_5_enforcement.pass ? "PASS" : "FAIL"}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Structural Owner:</p>
              <p className="font-medium text-gray-700">{data.step2_5_enforcement.structural_owner}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Penalty Type:</p>
              <p className="font-medium text-gray-700">{data.step2_5_enforcement.penalty_type}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Daily Cost of Absence:</p>
              <p className="text-gray-700 italic">{data.step2_5_enforcement.daily_cost_of_absence}</p>
            </div>
          </div>
          {!data.step2_5_enforcement.pass && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
              ❌ {data.step2_5_enforcement.reason}
            </div>
          )}
        </div>
      )}

      {/* STEP 3.5: REVERSAL TEST */}
      {data.step3_5_reversal && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-300">3.5</span>
            <h3 className="font-semibold text-lg">THE REVERSAL TEST</h3>
            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${data.step3_5_reversal.lock_in ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {data.step3_5_reversal.scream_strength}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 mb-1">If this disappeared tomorrow, who screams first?</p>
              <p className="text-gray-700">{data.step3_5_reversal.who_screams}</p>
            </div>
          </div>
          {!data.step3_5_reversal.lock_in && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
              ❌ No systemic break. This is not infrastructure.
            </div>
          )}
        </div>
      )}

      {/* STEP 4: KEY INSIGHT */}
      {data.step4_insight && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-300">4</span>
            <h3 className="font-semibold text-lg">THE KEY INSIGHT</h3>
          </div>
          <p className="text-gray-700 text-base italic border-l-4 border-gray-300 pl-4">
            {data.step4_insight.key_insight}
          </p>
        </div>
      )}

      {/* STEP 5: PATH TO UNLOCK */}
      {data.step5_path && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-300">5</span>
            <h3 className="font-semibold text-lg">PATH TO STRUCTURAL UNLOCK</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-gray-800 mb-2">Phase 1 — Entry Wedge:</p>
              <p className="text-gray-700">{data.step5_path.phase1_wedge}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Phase 2 — Structural Integration:</p>
              <p className="text-gray-700">{data.step5_path.phase2_integration}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Phase 3 — Ecosystem Lock-in:</p>
              <p className="text-gray-700">{data.step5_path.phase3_lockin}</p>
            </div>
          </div>
          {data.step5_path.risk_flag && (
            <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
              ⚠️ {data.step5_path.risk_flag}
            </div>
          )}
        </div>
      )}

      {/* FINAL SCORECARD */}
      {scorecard.total !== undefined && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <h3 className="font-semibold text-lg mb-6">FINAL SCORECARD</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-3 border-b">
              <span>Choice removed from stakeholders</span>
              <span className="font-mono font-bold">{scorecard.choice_removed}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span>Default flow routes through system</span>
              <span className="font-mono font-bold">{scorecard.default_flow}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span>Enforcement exists (independent of motivation)</span>
              <span className="font-mono font-bold">{scorecard.enforcement_exists}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span>External penalty for non-use (immediate)</span>
              <span className="font-mono font-bold">{scorecard.external_penalty}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span>Reversal causes systemic scream</span>
              <span className="font-mono font-bold">{scorecard.reversal_screams}</span>
            </div>
            <div className="flex justify-between items-center pt-3 bg-gray-50 px-4 py-3 rounded-lg">
              <span className="font-semibold">TOTAL SCORE</span>
              <span className="text-2xl font-bold">{scorecard.total} / 5</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">INTERPRETATION:</p>
            <p className="font-semibold text-gray-800">{scorecard.result}</p>
          </div>
        </div>
      )}

      {/* REQUIRED ACTIONS */}
      {verdict.required_actions?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <h3 className="font-semibold text-lg mb-4">NEXT STEPS</h3>
          <ul className="space-y-3">
            {verdict.required_actions.map((action: string, i: number) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-sm font-bold text-gray-400">{(i + 1).toString().padStart(2, "0")}</span>
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Result;