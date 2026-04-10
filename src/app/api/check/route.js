import {
  SYSTEM_PROMPT,
  buildUserMessage,
  SYNTHESIS_SYSTEM_PROMPT,
  buildSynthesisMessage,
} from "@/lib/checker-prompt";

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

import { checkPlanLimit, saveDecision } from "@/lib/firebase-helpers";

// ============================================================
// HELPER FUNCTIONS WITH COST TRACKING
// ============================================================

async function callClaude(anthropicClient, systemPrompt, userMessage, label = "Claude") {
  console.log(`[${label}] Sending request...`);

  try {
    const response = await anthropicClient.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].text;

    // Cost calculation (Claude 3.5 Haiku pricing)
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    const cost = (inputTokens * 0.0000008) + (outputTokens * 0.000004);

    console.log(`[COST] ${label}: $${cost.toFixed(6)} (in:${inputTokens} out:${outputTokens})`);

    return { text, costUSD: cost };

  } catch (error) {
    console.error(`[${label}] Error:`, error.message);
    return {
      text: JSON.stringify({ error: true, message: `${label} analysis failed: ${error.message}` }),
      costUSD: 0,
    };
  }
}

async function callGPT(openaiClient, systemPrompt, userMessage) {
  console.log("[GPT-4o-mini] Sending request...");

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;

    // Cost calculation (GPT-4o-mini pricing)
    const promptTokens = response.usage?.prompt_tokens || 0;
    const completionTokens = response.usage?.completion_tokens || 0;
    const cost = (promptTokens * 0.00000015) + (completionTokens * 0.0000006);

    console.log(`[COST] GPT-4o-mini: $${cost.toFixed(6)} (in:${promptTokens} out:${completionTokens})`);

    return { text, costUSD: cost };

  } catch (error) {
    console.error("[GPT-4o-mini] Error:", error.message);
    return {
      text: JSON.stringify({ error: true, message: `GPT-4o-mini analysis failed: ${error.message}` }),
      costUSD: 0,
    };
  }
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        return JSON.parse(text.slice(start, end + 1));
      }
    } catch {
      return { error: true, raw: text, message: "Could not parse response as JSON" };
    }
  }
}

// ============================================================
// MAIN API HANDLER
// ============================================================

export async function POST(request) {
  let decisionText, mode, userId;

  try {
    const body = await request.json();
    decisionText = body.decisionText;
    mode = body.mode || "Business";
    userId = body.userId || "anonymous";
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const limitCheck = await checkPlanLimit(userId);
  if (!limitCheck.allowed) {
    return Response.json({ error: limitCheck.reason }, { status: 403 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  if (!decisionText || decisionText.trim().length < 20) {
    return Response.json({ error: "Decision text is too short." }, { status: 400 });
  }

  const userMessage = buildUserMessage(decisionText, mode);
  console.log("Starting parallel LLM calls...");

  // === AUDITORS (always run) ===
  let claudeResult, gptResult;
  try {
    [claudeResult, gptResult] = await Promise.all([
      callClaude(anthropic, SYSTEM_PROMPT, userMessage, "Claude Auditor"),
      callGPT(openai, SYSTEM_PROMPT, userMessage),
    ]);
  } catch (error) {
    console.error("Auditor failure:", error.message);
    return Response.json({ error: "Analysis failed." }, { status: 500 });
  }

  const claudeRaw = claudeResult.text;
  const gptRaw = gptResult.text;

  // === EARLY PARSE FOR CONDITIONAL SYNTHESIS ===
  const claudeParsedEarly = safeParseJSON(claudeRaw);
  const gptParsedEarly = safeParseJSON(gptRaw);

  const claudeVerdict = claudeParsedEarly?.verdict?.status || "FAIL";
  const gptVerdict = gptParsedEarly?.verdict?.status || "FAIL";
  const claudeScore = claudeParsedEarly?.scorecard?.total || 0;
  const gptScore = gptParsedEarly?.scorecard?.total || 0;

  const shouldSynthesize = (claudeVerdict !== gptVerdict) || (Math.min(claudeScore, gptScore) < 4);

  console.log(`Auditor alignment → ${shouldSynthesize ? "DISAGREE/LOW → synthesize" : "AGREE/HIGH → SKIP synthesis"}`);

  // === SYNTHESIS (only when needed) ===
  let synthesisRaw;
  let synthesisCost = 0;

  if (shouldSynthesize) {
    console.log("Running synthesis...");
    const synthesisUserMessage = buildSynthesisMessage(decisionText, claudeRaw, gptRaw);

    const synthesisResult = await callClaude(
      anthropic,
      SYNTHESIS_SYSTEM_PROMPT,
      synthesisUserMessage,
      "Claude Synthesizer"
    );

    synthesisRaw = synthesisResult.text;
    synthesisCost = synthesisResult.costUSD;
  } else {
    console.log("✅ Skipping synthesis to save costs");
    synthesisRaw = JSON.stringify({
      agreement_points: ["Claude Haiku and GPT-4o-mini reached identical conclusions"],
      disagreement_points: [],
      arbitration_notes: "Synthesis skipped for cost efficiency",
      final_scorecard: claudeParsedEarly.scorecard || gptParsedEarly.scorecard || { total: Math.max(claudeScore, gptScore) },
      final_verdict: {
        status: claudeVerdict,
        confidence: "HIGH",
        summary: "Strong auditor agreement — synthesis step was skipped.",
        key_insight: claudeParsedEarly.step4_insight?.key_insight || gptParsedEarly.step4_insight?.key_insight || "",
        required_actions: claudeParsedEarly.verdict?.required_actions || [],
        pivot_suggestions: [],
      }
    });
  }

  // === PARSE & BUILD RESULT ===
  const claudeParsed = safeParseJSON(claudeRaw);
  const gptParsed = safeParseJSON(gptRaw);
  const synthesisParsed = safeParseJSON(synthesisRaw);

  const totalCostUSD = claudeResult.costUSD + gptResult.costUSD + synthesisCost;

  // CRITICAL: Use Claude's detailed analysis as the base (has all steps)
  // Then override only the verdict/scorecard with synthesis if it ran
  const baseAnalysis = claudeParsed || gptParsed || {};
  const verdictData = synthesisParsed?.final_verdict || baseAnalysis?.verdict || {};
  const scorecardData = synthesisParsed?.final_scorecard || baseAnalysis?.scorecard || { total: 0 };

  const result = {
    decisionText,
    mode,
    userId,

    // *** DETAILED ANALYSIS STEPS (always from auditor, never lost) ***
    precondition: baseAnalysis.precondition,
    step0_illusion: baseAnalysis.step0_illusion,
    step1_pretipping: baseAnalysis.step1_pretipping,
    step2_unlock: baseAnalysis.step2_unlock,
    step2_5_enforcement: baseAnalysis.step2_5_enforcement,
    step2_6_accelerants: baseAnalysis.step2_6_accelerants,
    step3_post_unlock: baseAnalysis.step3_post_unlock,
    step3_5_reversal: baseAnalysis.step3_5_reversal,
    step4_insight: baseAnalysis.step4_insight,
    step5_path: baseAnalysis.step5_path,
    step5_5_time: baseAnalysis.step5_5_time,

    // *** SCORECARD (from synthesis if available, else from auditor) ***
    scorecard: scorecardData,

    // *** VERDICT (from synthesis if available, else from auditor) ***
    verdict: {
      status: verdictData.status || "FAIL",
      confidence: verdictData.confidence || "MEDIUM",
      summary: verdictData.summary || "Analysis complete.",
      key_insight: verdictData.key_insight || baseAnalysis.step4_insight?.key_insight || "",
      required_actions: verdictData.required_actions || baseAnalysis.verdict?.required_actions || [],
      pivot_suggestions: verdictData.pivot_suggestions || []
    },

    // *** REFERENCE AUDIT TRAILS (for transparency) ***
    auditors: {
      claude: claudeParsed,
      gpt: gptParsed,
    },
    synthesis: synthesisParsed,

    totalCostUSD: Number(totalCostUSD.toFixed(6)),
  };

  const savedDocId = await saveDecision(userId, result);

  console.log(`✅ Decision saved. Total cost: $${result.totalCostUSD}`);

  return Response.json({
    success: true,
    decisionId: savedDocId,
    result,
    costUSD: result.totalCostUSD,
  }, { status: 200 });
}

// GET blocker stays the same
export async function GET() {
  return Response.json({ error: "This endpoint only accepts POST requests." }, { status: 405 });
}