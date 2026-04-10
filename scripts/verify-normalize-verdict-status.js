const assert = require("assert");

function normalizeVerdictStatus(verdict) {
  if (!verdict) return "FAIL";
  if (typeof verdict === "string") return verdict;
  if (typeof verdict === "object") {
    return (
      verdict.status ||
      verdict.final_verdict?.status ||
      verdict?.verdict ||
      "FAIL"
    );
  }
  return "FAIL";
}

const cases = [
  { input: null, expected: "FAIL" },
  { input: undefined, expected: "FAIL" },
  { input: "PASS", expected: "PASS" },
  { input: "CONDITIONAL", expected: "CONDITIONAL" },
  { input: { status: "PASS" }, expected: "PASS" },
  { input: { status: "CONDITIONAL" }, expected: "CONDITIONAL" },
  { input: { final_verdict: { status: "PASS" } }, expected: "PASS" },
  { input: { verdict: "FAIL" }, expected: "FAIL" },
  { input: { other: "value" }, expected: "FAIL" },
];

for (const { input, expected } of cases) {
  const actual = normalizeVerdictStatus(input);
  assert.strictEqual(actual, expected, `Expected ${JSON.stringify(input)} -> ${expected}, got ${actual}`);
}

console.log("✅ normalizeVerdictStatus sanity check passed for all cases.");
