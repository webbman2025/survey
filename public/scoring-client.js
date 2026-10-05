/** Client-side scoring fallback when /api/submit is unavailable (static hosting). */
(function (global) {
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
  const PILLAR_ORDER = [
    "Strategy & Investment",
    "Data Infrastructure & Tools",
    "Process Automation & Workflows",
    "Governance & Risk Management",
    "Workforce AI Adoption",
    "Business Impact & Oversight",
  ];

  function optionPoints(optionId) {
    const m = String(optionId || "").match(/^q\d+([a-d])$/);
    return m ? { a: 1, b: 2, c: 3, d: 4 }[m[1]] || 0 : 0;
  }

  function pillarExtremes(breakdown) {
    if (!breakdown?.length) return { strongest: null, opportunity: null };
    let best = breakdown[0];
    let worst = breakdown[0];
    for (let i = 1; i < breakdown.length; i++) {
      const row = breakdown[i];
      if (row.pct > best.pct) best = row;
      if (row.pct < worst.pct) worst = row;
    }
    return { strongest: best, opportunity: worst };
  }

  function computeScore(answers, cfgLang) {
    const tiers = [...(cfgLang.tiers || [])].sort((a, b) => b.minScore - a.minScore);
    const pillarLabel = (pillarKey) => {
      const q = cfgLang.scoredQuestions?.find((x) => PILLAR_BY_Q[x.id] === pillarKey);
      return q?.pillar || pillarKey;
    };
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
    const scorePct = Math.max(0, Math.min(100, Math.round(((rawScore - 10) / 30) * 1000) / 10));
    const tier = tiers.find((t) => scorePct >= t.minScore) || tiers[tiers.length - 1];
    const breakdown = PILLAR_ORDER.filter((k) => pillarScores[k]).map((pillarKey) => {
      const v = pillarScores[pillarKey];
      const pct = v.max ? Math.round((v.score / v.max) * 100) : 0;
      return {
        pillar: pillarLabel(pillarKey),
        pillarKey,
        score: v.score,
        max: v.max,
        pct,
      };
    });
    const highlights = pillarExtremes(breakdown);
    return {
      rawScore,
      maxRaw,
      scorePct,
      resultType: { code: tier.code, label: tier.label, description: tier.description },
      breakdown,
      highlights,
    };
  }

  global.AiqScoring = { computeScore };
})(window);
