/** Scoring engine — PRD formula: AIQ = (raw - 10) / 30 × 100 */

const SCORED_IDS = ["q1", "q2", "q3", "q4", "q5", "q7", "q8", "q9", "q10", "q11"];

const PILLAR_BY_Q = {
  q1: "Strategy & Investment",
  q2: "Data Infrastructure & Tools",
  q3: "Data Infrastructure & Tools",
  q4: "Process Automation & Workflows",
  q5: "Process Automation & Workflows",
  q7: "Governance & Risk Management",
  q8: "Workforce AI Adoption",
  q9: "Workforce AI Adoption",
  q10: "Business Impact & Oversight",
  q11: "Business Impact & Oversight",
};

function optionPoints(optionId) {
  if (!optionId || typeof optionId !== "string") return 0;
  const m = optionId.match(/^q\d+([a-d])$/);
  if (!m) return 0;
  return { a: 1, b: 2, c: 3, d: 4 }[m[1]] || 0;
}

export function computeScore(answers, tiers, lang = "en", pillarLabels = {}) {
  let rawScore = 0;
  const pillarScores = {};

  for (const qid of SCORED_IDS) {
    const pts = optionPoints(answers[qid]);
    rawScore += pts;
    const pillarKey = PILLAR_BY_Q[qid];
    if (!pillarScores[pillarKey]) pillarScores[pillarKey] = { score: 0, max: 0 };
    pillarScores[pillarKey].score += pts;
    pillarScores[pillarKey].max += 4;
  }

  const maxRaw = 40;
  const scorePct = Math.round(((rawScore - 10) / 30) * 1000) / 10;
  const clamped = Math.max(0, Math.min(100, scorePct));

  const sortedTiers = [...tiers].sort((a, b) => b.minScore - a.minScore);
  const tier = sortedTiers.find((t) => clamped >= t.minScore) || sortedTiers[sortedTiers.length - 1];

  const breakdown = Object.entries(pillarScores).map(([pillarKey, v]) => {
    const pct = v.max ? Math.round((v.score / v.max) * 100) : 0;
    const pl = pillarLabels[pillarKey];
    const pillarLabel = pl ? pl[lang] || pl.en || pillarKey : pillarKey;
    return { pillar: pillarLabel, pillarKey, score: v.score, max: v.max, pct };
  });

  const pillarOrder = [
    "Strategy & Investment",
    "Data Infrastructure & Tools",
    "Process Automation & Workflows",
    "Governance & Risk Management",
    "Workforce AI Adoption",
    "Business Impact & Oversight",
  ];
  breakdown.sort((a, b) => pillarOrder.indexOf(a.pillarKey) - pillarOrder.indexOf(b.pillarKey));

  const { best, worst } = pillarExtremes(breakdown);

  return {
    rawScore,
    maxRaw,
    scorePct: clamped,
    resultType: {
      code: tier.code,
      label: tier.label[lang] || tier.label.en,
      description: tier.description[lang] || tier.description.en,
    },
    breakdown,
    highlights: {
      strongest: best,
      opportunity: worst,
    },
  };
}

/** PRD: AIQ = (raw − 10) / 30 × 100 — not raw/max × 100 */
export function rawToAiqPct(rawScore) {
  const scorePct = Math.round(((rawScore - 10) / 30) * 1000) / 10;
  return Math.max(0, Math.min(100, scorePct));
}

/** On equal %, first pillar in breakdown order wins (stable, matches PRD pillar list). */
export function pillarExtremes(breakdown) {
  if (!breakdown?.length) return { best: null, worst: null };
  let best = breakdown[0];
  let worst = breakdown[0];
  for (let i = 1; i < breakdown.length; i++) {
    const row = breakdown[i];
    if (row.pct > best.pct) best = row;
    if (row.pct < worst.pct) worst = row;
  }
  return { best, worst };
}

export { SCORED_IDS, PILLAR_BY_Q };
