/**
 * Scoring acceptance checks (PRD §4).
 * Run: node server/verify-scoring.js
 */
import { computeScore, rawToAiqPct, pillarExtremes } from "./scoring.js";
import { getTiersForScoring, pillarLabels } from "./surveyConfig.js";

const tiers = getTiersForScoring();
let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  }
}

const allA = { q1: "q1a", q2: "q2a", q3: "q3a", q4: "q4a", q5: "q5a", q7: "q7a", q8: "q8a", q9: "q9a", q10: "q10a", q11: "q11a" };
const allD = { q1: "q1d", q2: "q2d", q3: "q3d", q4: "q4d", q5: "q5d", q7: "q7d", q8: "q8d", q9: "q9d", q10: "q10d", q11: "q11d" };

const min = computeScore(allA, tiers, "en", pillarLabels);
const max = computeScore(allD, tiers, "en", pillarLabels);

assert(min.rawScore === 10 && min.scorePct === 0, "min raw 10 → AIQ 0");
assert(max.rawScore === 40 && max.scorePct === 100, "max raw 40 → AIQ 100");
assert(rawToAiqPct(12) === 6.7, "raw 12 → AIQ 6.7 (not 30%)");
assert(min.resultType.code === "AI_EXPLORER", "0% is AI Explorer");
assert(max.resultType.code === "AI_ACCELERATOR", "100% is AI Accelerator");

// raw 18 → 26.7% → Adopter (≥26)
const midLow = computeScore(
  { ...allA, q1: "q1b", q2: "q2b", q3: "q3b", q4: "q4b", q5: "q5b", q7: "q7b", q8: "q8b", q9: "q9b", q10: "q10b", q11: "q11b" },
  tiers,
  "en",
  pillarLabels
);
assert(midLow.rawScore === 20 && midLow.scorePct === 33.3, "all B → raw 20, AIQ 33.3");
assert(midLow.resultType.code === "AI_ADOPTER", "33.3% is AI Adopter");

// Screenshot scenario: raw 12, pillar pattern
const sample12 = computeScore(
  {
    q1: "q1b",
    q2: "q2a",
    q3: "q3a",
    q4: "q4a",
    q5: "q5a",
    q7: "q7a",
    q8: "q8a",
    q9: "q9a",
    q10: "q10b",
    q11: "q11a",
  },
  tiers,
  "en",
  pillarLabels
);
assert(sample12.rawScore === 12 && sample12.scorePct === 6.7, "sample raw 12 → AIQ 6.7");
const byKey = Object.fromEntries(sample12.breakdown.map((r) => [r.pillarKey, r.pct]));
assert(byKey["Strategy & Investment"] === 50, "Strategy 50% when Q1=B");
assert(byKey["Data Infrastructure & Tools"] === 25, "Data 25% when Q2+Q3=1+1");
const { best, worst } = pillarExtremes(sample12.breakdown);
assert(best.pillarKey === "Strategy & Investment", "strongest Strategy on sample");
assert(worst.pillarKey === "Data Infrastructure & Tools", "opportunity Data before Gov on tie order");

if (failed) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}
console.log("All scoring checks passed.");
