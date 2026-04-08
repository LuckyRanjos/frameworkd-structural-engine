import {
  SYSTEM_PROMPT,
  buildUserMessage,
  SYNTHESIS_SYSTEM_PROMPT,
  buildSynthesisMessage,
} from "@/lib/checker-prompt";

// Anthropic SDK for Claude
// The '@anthropic-ai/sdk' package lets you talk to Claude's API
import Anthropic from "@anthropic-ai/sdk";

// OpenAI SDK — used for GPT-4
import OpenAI from "openai";

// Firebase — for saving results to your database
// We'll set up the firebase config in the next step (Step 6)
// For now, import it so the structure is ready
import { checkPlanLimit, saveDecision } from "@/lib/firebase-helpers";


// ============================================================
// HELPER FUNCTIONS
// These are small functions that do one specific job each.
// Breaking the logic into helpers makes the main function
// easier to read and easier to debug if something breaks.
// ============================================================


// --- callClaude() --- (now receives the client as a parameter)
async function callClaude(anthropicClient, systemPrompt, userMessage, label = "Claude") {
  console.log(`[${label}] Sending request to Claude...`);

  try {
    const response = await anthropicClient.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].text;
    console.log(`[${label}] Response received.`);
    return text;

  } catch (error) {
    console.error(`[${label}] Error:`, error.message);
    return JSON.stringify({
      error: true,
      message: `${label} analysis failed: ${error.message}`,
    });
  }
}

// --- callGPT4() --- (now receives the client)
async function callGPT4(openaiClient, systemPrompt, userMessage) {
  console.log("[GPT-4] Sending request to OpenAI...");

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;
    console.log("[GPT-4] Response received.");
    return text;

  } catch (error) {
    console.error("[GPT-4] Error:", error.message);
    return JSON.stringify({
      error: true,
      message: `GPT-4 analysis failed: ${error.message}`,
    });
  }
}


// --- safeParseJSON() ---
// Each AI should return JSON, but sometimes they add extra
// text before or after it (e.g. "Here is the analysis: {...}")
// This function tries its best to extract valid JSON even
// from a slightly messy response.
//
// It first tries a direct parse. If that fails, it looks for
// the first { and last } and tries to parse just that part.
// If that also fails, it returns the raw text so you can
// at least display something to the user.

function safeParseJSON(text) {
  // Attempt 1: direct parse (works if response is clean JSON)
  try {
    return JSON.parse(text);
  } catch {
    // Attempt 2: find the JSON block inside the text
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        return JSON.parse(text.slice(start, end + 1));
      }
    } catch {
      // Both attempts failed — return a structured error object
      // so the frontend still gets something it can display
      return {
        error: true,
        raw: text,
        message: "Could not parse response as JSON",
      };
    }
  }
}


export async function POST(request) {


  let decisionText, mode, userId;

  try {
    const body = await request.json();
    decisionText = body.decisionText;
    mode = body.mode || "Business";
    userId = body.userId || "anonymous";
  } catch {
    // If the request body is malformed, return an error immediately
    return Response.json(
      { error: "Invalid request body. Expected JSON with decisionText and mode." },
      { status: 400 }
    );
  }

  const limitCheck = await checkPlanLimit(userId);
  if (!limitCheck.allowed) {
    return Response.json({ error: limitCheck.reason }, { status: 403 });
  }


  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });


  // Basic validation — make sure there's actually something to analyze
  if (!decisionText || decisionText.trim().length < 20) {
    return Response.json(
      { error: "Decision text is too short. Please provide more detail." },
      { status: 400 }
    );
  }


  // --- STEP 2: BUILD THE MESSAGES ---
  // Use your helper functions from checker-prompt.js to
  // build the formatted messages you'll send to the AIs

  const userMessage = buildUserMessage(decisionText, mode);

  console.log("Starting parallel LLM calls...");

  let claudeRaw, gptRaw;

   try {
    [claudeRaw, gptRaw] = await Promise.all([
      callClaude(anthropic, SYSTEM_PROMPT, userMessage, "Claude Auditor"),
      callGPT4(openai, SYSTEM_PROMPT, userMessage),
    ]);
  } catch (error) {
    console.error("Parallel call failure:", error.message);
    return Response.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }

  console.log("Both auditors responded. Running synthesis...");


  // --- STEP 4: THE SYNTHESIS CALL ---
  //
  // Now you feed both auditor outputs to Claude for arbitration.
  //
  // Why Claude for synthesis and not GPT-4?
  // Claude is your primary model — it's the one most familiar
  // with the exact Structural Unlock framework since you wrote
  // SYNTHESIS_SYSTEM_PROMPT with Claude in mind. You could
  // use either, but pick one and be consistent.
  //
  // buildSynthesisMessage() combines the original decision
  // and both outputs into one message Claude can read.

  const synthesisUserMessage = buildSynthesisMessage(
    decisionText,
    claudeRaw,
    gptRaw
  );

  let synthesisRaw;

  try {
    synthesisRaw = await callClaude(
      anthropic,                    // ← pass the client
      SYNTHESIS_SYSTEM_PROMPT,
      synthesisUserMessage,
      "Claude Synthesizer"
    );
  } catch (error) {
    console.error("Synthesis failed:", error.message);
    return Response.json({ error: "Synthesis step failed. Please try again." }, { status: 500 });
  }


  // --- STEP 5: PARSE ALL OUTPUTS ---
  // Convert the raw text strings from each AI into JavaScript
  // objects so you can work with them and save them properly.

  const claudeParsed = safeParseJSON(claudeRaw);
  const gptParsed = safeParseJSON(gptRaw);
  const synthesisParsed = safeParseJSON(synthesisRaw);


  // --- STEP 6: BUILD THE FINAL RESULT OBJECT ---
  // This is what gets saved to Firebase AND sent back to
  // the frontend. Structure it so the frontend can easily
  // read each part to display in the UI.

  const result = {
    // Metadata about this check
    decisionText,
    mode,
    userId,

    // Individual model outputs (shown in the LLM Debate Panel)
    auditors: {
      claude: claudeParsed,
      gpt4: gptParsed,
    },

    // The synthesized final verdict (shown as the main result)
    synthesis: synthesisParsed,

    // Convenience fields pulled from synthesis for easy access
    // in the frontend — so you don't have to dig into nested objects
    verdict: synthesisParsed?.final_verdict?.status || "FAIL",
    score: synthesisParsed?.final_scorecard?.total || 0,
    summary: synthesisParsed?.final_verdict?.summary || "",
    requiredActions: synthesisParsed?.final_verdict?.required_actions || [],
    keyInsight: synthesisParsed?.final_verdict?.key_insight || "",
    pivotSuggestions: synthesisParsed?.final_verdict?.pivot_suggestions || [],
  };


  // --- STEP 7: SAVE TO FIREBASE ---

  const savedDocId = await saveDecision(userId, result);


  // --- STEP 8: RETURN THE RESPONSE ---
  //
  // Response.json() sends the data back to the browser as JSON.
  // The second argument { status: 200 } means "success."
  // Your frontend will receive this and use it to update the UI.
  //
  // We include the savedDocId so the frontend can use it as
  // the "Decision ID" shown in the audit trail.

  return Response.json(
    {
      success: true,
      decisionId: savedDocId,
      result,
    },
    { status: 200 }
  );
}


// ============================================================
// WHAT HAPPENS IF SOMEONE SENDS A GET REQUEST?
//
// Your endpoint only accepts POST. If someone visits
// /api/check in a browser (which sends a GET request),
// return a clear error rather than letting it hang.
// ============================================================

export async function GET() {
  return Response.json(
    { error: "This endpoint only accepts POST requests." },
    { status: 405 }
  );
}