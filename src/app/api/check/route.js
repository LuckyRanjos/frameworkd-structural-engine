// ============================================================
// route.js
// Location: /app/api/check/route.js
//
// PURPOSE:
// This is your server-side API endpoint. When your frontend
// sends a decision to be checked, this file:
//   1. Receives the request
//   2. Calls Claude, GPT-4, and Grok simultaneously
//   3. Feeds all three outputs to Claude for synthesis
//   4. Saves everything to Firebase
//   5. Returns the final verdict to the browser
//
// HOW NEXT.JS ROUTES WORK:
// Any file named route.js inside /app/api/ automatically
// becomes an API endpoint. This file lives at /app/api/check/
// so your frontend calls it at: POST /api/check
// ============================================================


// --- IMPORTS ---
// These lines bring in the tools you need.

// Your checker prompts from Step 4
import {
  SYSTEM_PROMPT,
  buildUserMessage,
  SYNTHESIS_SYSTEM_PROMPT,
  buildSynthesisMessage,
} from "@/lib/checker-prompt";

// Anthropic SDK for Claude
// The '@anthropic-ai/sdk' package lets you talk to Claude's API
import Anthropic from "@anthropic-ai/sdk";

// OpenAI SDK — used for BOTH GPT-4 and Grok
// Grok's API is intentionally compatible with OpenAI's format
// so you can use the same SDK for both, just with different
// base URLs and API keys
import OpenAI from "openai";

// Firebase — for saving results to your database
// We'll set up the firebase config in the next step (Step 6)
// For now, import it so the structure is ready
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";


// --- CLIENT SETUP ---
// You create these "clients" once at the top of the file.
// A client is just a configured connection to each API.
// Each one reads your secret API keys from environment
// variables (the keys you added to Vercel in Phase 1).
// Never hardcode actual key values here — always use
// process.env.VARIABLE_NAME so the real keys stay secret.

// Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// GPT-4 client
// No baseURL needed — OpenAI's default URL is correct
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Grok client
// Same OpenAI SDK, but pointed at xAI's servers instead
// This works because xAI built Grok to be API-compatible
// with OpenAI — same request format, different address
const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});


// ============================================================
// HELPER FUNCTIONS
// These are small functions that do one specific job each.
// Breaking the logic into helpers makes the main function
// easier to read and easier to debug if something breaks.
// ============================================================


// --- callClaude() ---
// Sends a prompt to Claude and returns the text response.
// 
// Parameters explained:
//   systemPrompt  — the instructions (your checker framework)
//   userMessage   — the actual content to analyze
//   label         — just a name for logging, e.g. "Claude Auditor"
//
// async/await explained:
//   API calls take time (the internet is slow).
//   'async' marks this function as one that takes time.
//   'await' means "pause here until the API responds."
//   Without these, your code would run past the API call
//   before the response arrived — you'd get nothing.

async function callClaude(systemPrompt, userMessage, label = "Claude") {
  console.log(`[${label}] Sending request to Claude...`);

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,

      // The system prompt goes here — Claude reads this first
      // before looking at the user's message
      system: systemPrompt,

      // The messages array is the conversation.
      // For a single-turn analysis (no back-and-forth chat),
      // you just send one user message.
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    // Claude's response lives at response.content[0].text
    // The [0] means "first content block" — Claude can
    // technically return multiple blocks, but for text
    // responses it's always the first one
    const text = response.content[0].text;
    console.log(`[${label}] Response received.`);
    return text;

  } catch (error) {
    // If the API call fails (network error, bad API key, etc.)
    // we log the error and return a placeholder instead of
    // crashing your entire server
    console.error(`[${label}] Error:`, error.message);
    return JSON.stringify({
      error: true,
      message: `${label} analysis failed: ${error.message}`,
    });
  }
}


// --- callGPT4() ---
// Same idea as callClaude, but using OpenAI's format.
// The structure is slightly different — OpenAI puts the
// system prompt inside the messages array as a 'system' role
// rather than as a separate parameter.

async function callGPT4(systemPrompt, userMessage) {
  console.log("[GPT-4] Sending request to OpenAI...");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,

      // OpenAI's format: system message comes first in the
      // messages array, then the user message follows
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],

      // This tells GPT-4 to respond in JSON format.
      // It's an extra safety net on top of the instruction
      // in your system prompt — double enforcement.
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


// --- callGrok() ---
// Identical structure to callGPT4 because Grok uses the
// same API format. Only the model name differs.

async function callGrok(systemPrompt, userMessage) {
  console.log("[Grok] Sending request to xAI...");

  try {
    const response = await grok.chat.completions.create({
      model: "grok-3",
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const text = response.choices[0].message.content;
    console.log("[Grok] Response received.");
    return text;

  } catch (error) {
    console.error("[Grok] Error:", error.message);
    return JSON.stringify({
      error: true,
      message: `Grok analysis failed: ${error.message}`,
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


// ============================================================
// MAIN HANDLER: POST()
//
// This is the function Next.js calls when your frontend sends
// a POST request to /api/check. It's the orchestrator —
// it calls the helpers above in the right order.
//
// 'export async function POST' is the Next.js App Router
// syntax for handling POST requests. The name must match
// the HTTP method you're handling (GET, POST, etc.)
// ============================================================

export async function POST(request) {

  // --- STEP 1: READ THE REQUEST ---
  // The frontend sends JSON data in the request body.
  // request.json() reads and parses it.
  // We destructure it to get the three values we expect:
  //   decisionText — what the user typed
  //   mode         — Business / Career / Habit / Social
  //   userId       — the logged-in user's ID (from Firebase Auth)

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


  // --- STEP 3: CALL ALL THREE AIs SIMULTANEOUSLY ---
  //
  // This is the core of the multi-LLM system.
  //
  // Promise.all() explained:
  //   Normally, if you 'await' calls one by one, they run
  //   in sequence: wait for Claude → wait for GPT-4 → wait
  //   for Grok. That could take 30-60 seconds total.
  //
  //   Promise.all() runs them ALL AT THE SAME TIME and waits
  //   until ALL of them finish. If each call takes 15 seconds,
  //   Promise.all means you wait 15 seconds total — not 45.
  //
  //   The result is an array. The items come back in the same
  //   order you put them in, regardless of which API responded
  //   first. So [0] is always Claude, [1] is always GPT-4,
  //   [2] is always Grok.

  console.log("Starting parallel LLM calls...");

  let claudeRaw, gptRaw, grokRaw;

  try {
    [claudeRaw, gptRaw, grokRaw] = await Promise.all([
      callClaude(SYSTEM_PROMPT, userMessage, "Claude Auditor"),
      callGPT4(SYSTEM_PROMPT, userMessage),
      callGrok(SYSTEM_PROMPT, userMessage),
    ]);
  } catch (error) {
    // This catch handles total failures (e.g. network down)
    // Individual model failures are handled inside each helper
    console.error("Parallel call failure:", error.message);
    return Response.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }

  console.log("All three auditors responded. Running synthesis...");


  // --- STEP 4: THE SYNTHESIS CALL ---
  //
  // Now you feed all three outputs to Claude for arbitration.
  //
  // Why Claude for synthesis and not GPT-4 or Grok?
  // Claude is your primary model — it's the one most familiar
  // with the exact Structural Unlock framework since you wrote
  // SYNTHESIS_SYSTEM_PROMPT with Claude in mind. You could
  // use any of the three, but pick one and be consistent.
  //
  // buildSynthesisMessage() combines the original decision
  // and all three outputs into one message Claude can read.

  const synthesisUserMessage = buildSynthesisMessage(
    decisionText,
    claudeRaw,
    gptRaw,
    grokRaw
  );

  let synthesisRaw;

  try {
    synthesisRaw = await callClaude(
      SYNTHESIS_SYSTEM_PROMPT,
      synthesisUserMessage,
      "Claude Synthesizer"
    );
  } catch (error) {
    console.error("Synthesis failed:", error.message);
    return Response.json(
      { error: "Synthesis step failed. Please try again." },
      { status: 500 }
    );
  }


  // --- STEP 5: PARSE ALL OUTPUTS ---
  // Convert the raw text strings from each AI into JavaScript
  // objects so you can work with them and save them properly.

  const claudeParsed = safeParseJSON(claudeRaw);
  const gptParsed = safeParseJSON(gptRaw);
  const grokParsed = safeParseJSON(grokRaw);
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
      grok: grokParsed,
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
  //
  // addDoc() adds a new document to your Firestore database.
  //
  // collection(db, "decisions") means: in the 'decisions'
  // collection. Firestore is a NoSQL database — think of
  // collections like folders and documents like files inside.
  //
  // serverTimestamp() tells Firebase to record the exact
  // server time, which is more reliable than using the
  // user's device time (which could be wrong).
  //
  // This step is wrapped in try/catch so that if Firebase
  // saves fail, the user still gets their result — saving
  // is important but not worth blocking the verdict for.

  let savedDocId = null;

  try {
    const docRef = await addDoc(collection(db, "decisions"), {
      ...result,
      createdAt: serverTimestamp(),
    });
    savedDocId = docRef.id;
    console.log("Saved to Firebase with ID:", savedDocId);
  } catch (firebaseError) {
    // Log the error but don't block the response
    console.error("Firebase save failed:", firebaseError.message);
  }


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