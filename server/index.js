import express from "express";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { computeScore, SCORED_IDS } from "./scoring.js";
import { getPublicConfig, getTiersForScoring, pillarLabels, profileQuestions } from "./surveyConfig.js";
import { saveSubmission, listSubmissions, storageMode } from "./storage.js";
import { notifyLead, sendReportEmail } from "./notifications.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
/** 0.0.0.0 = localhost + LAN IP; 127.0.0.1 = local only. Use LISTEN_HOST — not HOST (macOS shells often set HOST to the machine name). */
const LISTEN_HOST =
  process.env.LISTEN_HOST ||
  (process.env.HOST === "0.0.0.0" || process.env.HOST === "127.0.0.1" ? process.env.HOST : "0.0.0.0");
const ADMIN_KEY = process.env.ADMIN_KEY || "demo-admin-key";

function lanUrls(port) {
  const urls = [];
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces || []) {
      if (iface.family === "IPv4" && !iface.internal && !iface.address.startsWith("169.254.")) {
        urls.push(`http://${iface.address}:${port}`);
      }
    }
  }
  return urls;
}

app.use(express.json({ limit: "256kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "business-aiq-health-check" });
});

app.get("/api/config", (req, res) => {
  const lang = req.query.lang === "zh-Hant" ? "zh-Hant" : "en";
  res.json(getPublicConfig(lang));
});

app.get("/api/config/bilingual", (_req, res) => {
  res.json({ en: getPublicConfig("en"), "zh-Hant": getPublicConfig("zh-Hant") });
});

function validateContact(contact, errors) {
  const out = {};
  for (const [key, val] of Object.entries(contact || {})) {
    out[key] = String(val ?? "").trim();
  }
  const required = ["company_name", "full_name", "job_title", "company_email", "company_phone"];
  for (const k of required) {
    if (!out[k]) return { error: `${k} required`, code: "required" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.company_email)) {
    return { error: errors.email, code: "email" };
  }
  const phoneDigits = out.company_phone.replace(/\D/g, "");
  const hk = phoneDigits.length === 8 ? phoneDigits : phoneDigits.replace(/^852/, "");
  if (!/^[2-9]\d{7}$/.test(hk)) {
    return { error: errors.phone, code: "phone" };
  }
  out.company_phone = hk;
  if (contact.consent !== true && contact.consent !== "true" && contact.consent !== "on") {
    return { error: errors.consentRequired || "Consent required", code: "consent" };
  }
  return { contact: out };
}

app.post("/api/submit", async (req, res) => {
  try {
    const { answers = {}, contact = {}, lang = "en", industry_other: industryOther } = req.body;
    const L = lang === "zh-Hant" ? "zh-Hant" : "en";
    const cfg = getPublicConfig(L);
    const v = validateContact(contact, {
      email: cfg.ui.errors.email,
      phone: cfg.ui.errors.phone,
      consentRequired: cfg.ui.contact.consentRequired,
    });
    if (v.error) return res.status(400).json({ error: v.error, code: v.code });

    const q13 = profileQuestions.find((q) => q.id === "q13");
    if (answers.q13 === q13?.othersOptionId && !(industryOther || answers.industry_other || "").trim()) {
      return res.status(400).json({ error: cfg.ui.errors.others, code: "others" });
    }

    const missingScored = SCORED_IDS.filter((id) => !answers[id]);
    if (missingScored.length) {
      return res.status(400).json({
        error: L === "zh-Hant" ? "請完成所有評分題目" : "Please complete all scored assessment questions",
        code: "incomplete",
      });
    }

    const tiers = getTiersForScoring();
    const scored = computeScore(answers, tiers, L, pillarLabels);
    const now = new Date().toISOString();

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: now,
      lang: L,
      survey_id: cfg.meta.surveyId,
      answers,
      industry_other: (industryOther || answers.industry_other || "").trim(),
      company_name: v.contact.company_name,
      full_name: v.contact.full_name,
      job_title: v.contact.job_title,
      company_email: v.contact.company_email,
      company_phone: v.contact.company_phone,
      consent: true,
      raw_score: scored.rawScore,
      max_raw: scored.maxRaw,
      score_pct: scored.scorePct,
      result_type: scored.resultType.code,
      result_label: scored.resultType.label,
      result_description: scored.resultType.description,
      breakdown: scored.breakdown,
    };

    await saveSubmission(record);
    await notifyLead(record);
    await sendReportEmail(record);

    res.json({
      ok: true,
      rawScore: scored.rawScore,
      maxRaw: scored.maxRaw,
      scorePct: scored.scorePct,
      resultType: scored.resultType,
      breakdown: scored.breakdown,
      highlights: scored.highlights,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/results", async (req, res) => {
  const key = req.get("x-admin-key");
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  try {
    const rows = await listSubmissions();
    res.json({ rows, storageMode: storageMode() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load results" });
  }
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin.html"));
});

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, LISTEN_HOST, () => {
    console.log("Business AIQ Health Check");
    console.log(`  Localhost → http://127.0.0.1:${PORT}`);
    console.log(`  Localhost → http://localhost:${PORT}`);
    const lan = lanUrls(PORT);
    if (lan.length) {
      lan.forEach((u) => console.log(`  LAN IP    → ${u}`));
    } else if (LISTEN_HOST === "0.0.0.0") {
      console.log("  LAN IP    → (no Wi‑Fi/Ethernet IPv4 found; check network settings)");
    }
    console.log(`Admin → http://127.0.0.1:${PORT}/admin (key: ${ADMIN_KEY})`);
    if (lan[0]) console.log(`Admin → ${lan[0]}/admin`);
  });
}
