"use client";

import React, { useState } from "react";

interface CheckFormProps {
  onSubmit: (payload: any) => void;
}

const CheckForm: React.FC<CheckFormProps> = ({ onSubmit }) => {
  const [decisionText, setDecisionText] = useState("");
  const [mode, setMode] = useState("Business");

  const handleRun = () => {
    onSubmit({
      decisionText,
      mode,
      userId: "test-user",   // ← replace with real auth userId later
    });
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">SUBMIT DECISION FOR STRUCTURAL ANALYSIS</h2>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="flex gap-4 mb-6">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-white border border-gray-300 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none"
          >
            <option value="Business">MODE: BUSINESS</option>
            <option value="Career">MODE: CAREER</option>
            <option value="Habit-Behavior">MODE: HABIT / BEHAVIOR</option>
            <option value="Social-Institutional">MODE: SOCIAL / INSTITUTIONAL</option>
          </select>

          <button className="border border-gray-300 hover:border-gray-400 px-6 rounded-2xl text-sm font-medium flex items-center gap-2">
            ↑ UPLOAD FILE
          </button>
        </div>

        <textarea
          value={decisionText}
          onChange={(e) => setDecisionText(e.target.value)}
          placeholder="Describe your decision, idea, or proposed strategy. Be specific: who is the actor, what is the system, what is your execution plan, what is the expected outcome?"
          className="w-full h-48 border border-gray-200 rounded-3xl p-6 text-sm leading-relaxed focus:outline-none resize-none"
        />

        <button
          onClick={handleRun}
          className="mt-8 w-full bg-black text-white py-5 rounded-3xl text-base font-semibold tracking-widest hover:bg-gray-800 transition"
        >
          RUN STRUCTURAL CHECK →
        </button>
      </div>
    </div>
  );
};

export default CheckForm;