/* Business AIQ Health Check — Landing → 3-step assessment → Contact → Report */

let BCFG = null;
let CFG = null;
let lang = localStorage.getItem("aiq_lang") || "en";
/** "api" = Node backend; "static" = config.bilingual.json only (submit may be client-side). */
let configMode = "api";
let QUESTIONS = [];
const answers = {};
let idx = 0;

const TIER_COLOR = {
  AI_EXPLORER: "#ef4444",
  AI_ADOPTER: "#f59e0b",
  AI_BUILDER: "#3b82f6",
  AI_ACCELERATOR: "#22c55e",
};

/** Official 3Business contact forms — used if API env still points at legacy URLs */
const CTA_LINKS = {
  en: "https://web.three.com.hk/3business/contactus-en.html",
  "zh-Hant": "https://web.three.com.hk/3business/contactus.html",
};

function consultationUrl() {
  const fromConfig = CFG?.ctaConsultationUrl || "";
  if (/web\.three\.com\.hk\/3business\/contactus/i.test(fromConfig)) return fromConfig;
  return CTA_LINKS[lang] || CTA_LINKS.en;
}

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

function track(event, params) {
  if (typeof gtagEvent === "function") gtagEvent(event, params);
}

function configJsonUrl() {
  return new URL("config.bilingual.json", window.location.href).href;
}

function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${p}`;
}

function isLocalhost() {
  return /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
}

async function loadBConfig() {
  if (window.location.protocol === "file:") {
    throw new Error(
      "Open http://127.0.0.1:3000 after running npm start in the project folder (do not open the HTML file directly)."
    );
  }
  try {
    const res = await fetch(apiUrl("/api/config/bilingual"), { cache: "no-store" });
    if (res.ok) {
      configMode = "api";
      return await res.json();
    }
  } catch {
    /* try static fallback (non-localhost hosting) */
  }
  if (isLocalhost()) {
    throw new Error(
      "Backend not running. In the project folder run: npm install && npm start — then open http://127.0.0.1:3000"
    );
  }
  const res = await fetch(configJsonUrl());
  if (!res.ok) {
    throw new Error("Cannot load survey config. Run npm start or upload config.bilingual.json.");
  }
  configMode = "static";
  return await res.json();
}

function show(screenId) {
  ["screenLanding", "screenQuiz", "screenContact", "screenResult"].forEach((s) =>
    $(s).classList.toggle("hidden", s !== screenId)
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyLang(nextLang) {
  lang = nextLang === "zh-Hant" ? "zh-Hant" : "en";
  localStorage.setItem("aiq_lang", lang);
  CFG = BCFG[lang];
  document.documentElement.lang = lang === "zh-Hant" ? "zh-Hant" : "en";
  $("langEn").classList.toggle("active", lang === "en");
  $("langZh").classList.toggle("active", lang === "zh-Hant");
  $("brandSubtitle").textContent = CFG.ui.productName;
  $("footText").textContent = CFG.ui.footer;
  $("adminLink").textContent = lang === "zh-Hant" ? "結果儀表板 →" : "Results dashboard →";
  renderLanding();
  buildSequence();
  if (!$("screenLanding").classList.contains("hidden")) return;
  if (!$("screenQuiz").classList.contains("hidden")) renderQuestion();
  if (!$("screenContact").classList.contains("hidden")) showContact();
}

function renderLanding() {
  const L = CFG.ui.landing;
  $("heroBadge").innerHTML = `<span class="dot"></span> ${esc(L.badge)}`;
  if (lang === "zh-Hant") {
    $("heroTitle").innerHTML = `${esc(L.title)}<span class="grad-text">${esc(L.titleGrad)}</span>${esc(L.titleEnd)}`;
  } else {
    $("heroTitle").innerHTML = `${esc(L.title)}<span class="grad-text">${esc(L.titleGrad)}</span>${esc(L.titleEnd)}`;
  }
  $("heroLead").textContent = L.lead;
  $("heroChips").innerHTML = L.chips.map((c) => `<span><span class="dot"></span> ${esc(c)}</span>`).join("");
  $("startBtn").innerHTML = `${esc(L.start)}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  $("heroFine").textContent = L.fine;
}

function buildSequence() {
  const scored = CFG.scoredQuestions.map((q) => ({ ...q, section: "assessment", stepKey: "assessment", scored: true }));
  const qual = CFG.qualitativeQuestions.map((q) => ({ ...q, section: "goals", stepKey: "goals", scored: false }));
  const prof = CFG.profileQuestions.map((q) => ({ ...q, section: "profile", stepKey: "profile", scored: false, type: "choice" }));
  QUESTIONS = [...scored, ...qual, ...prof];
}

function stepLabel(q) {
  if (q.stepKey === "assessment") return CFG.steps.assessment;
  if (q.stepKey === "goals") return CFG.steps.goals;
  return CFG.steps.profile;
}

function start() {
  idx = 0;
  track("survey_start", { survey_id: CFG.meta.surveyId, lang });
  show("screenQuiz");
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[idx];
  const total = QUESTIONS.length;
  const stepQs = QUESTIONS.filter((x) => x.stepKey === q.stepKey);
  const stepIdx = stepQs.indexOf(q) + 1;

  $("qSection").textContent = stepLabel(q);
  $("qCount").textContent =
    lang === "zh-Hant" ? `第 ${idx + 1} 題，共 ${total} 題` : `Question ${idx + 1} of ${total}`;
  $("qProgress").style.width = Math.round((idx / total) * 100) + "%";

  const tag = q.pillar
    ? `<span class="pillar-tag">${esc(q.pillar)}</span>`
    : q.scored === false
    ? `<span class="pillar-tag noscore">${lang === "zh-Hant" ? "不計分 · 策略洞察" : "Not scored · strategic insight"}</span>`
    : "";

  const isLast = idx === total - 1;
  const cards = q.options
    .map((o, i) => {
      const sel = answers[q.id] === o.id ? " sel" : "";
      return `
      <div class="opt${sel}" data-opt="${o.id}" role="button" tabindex="0" aria-pressed="${sel ? "true" : "false"}">
        <span class="letter">${String.fromCharCode(65 + i)}</span>
        <span class="opt-label">${esc(o.label)}</span>
        <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>`;
    })
    .join("");

  const othersBlock =
    q.othersOptionId && answers[q.id] === q.othersOptionId
      ? `<div class="field others-field">
          <label for="industry_other">${lang === "zh-Hant" ? "請註明行業" : "Please specify industry"} <span class="req">*</span></label>
          <input id="industry_other" type="text" value="${esc(answers.industry_other || "")}" />
        </div>`
      : "";

  $("quizCard").innerHTML = `
    ${tag}
    <h2 class="q-text">${esc(q.text)}</h2>
    <div class="opts">${cards}</div>
    ${othersBlock}
    <div class="err-msg" id="qErr"></div>
    <div class="q-foot">
      <button class="btn ghost" id="qBack">&larr; ${lang === "zh-Hant" ? "返回" : "Back"}</button>
      <span class="hint">${lang === "zh-Hant" ? "先選擇答案，再按 <kbd>Next</kbd> 或 <kbd>Enter</kbd> 繼續" : "Choose an answer, then tap <kbd>Next</kbd> or press <kbd>Enter</kbd>"}</span>
      <button class="btn q-next${canProceedQuestion(q) ? " is-ready" : ""}" id="qNext" type="button" ${canProceedQuestion(q) ? "" : "disabled"}>${isLast ? (lang === "zh-Hant" ? "繼續" : "Continue") : lang === "zh-Hant" ? "下一題" : "Next"} &rarr;</button>
    </div>`;

  $("quizCard").querySelectorAll(".opt").forEach((el) => {
    const pick = () => selectOption(el.dataset.opt);
    el.addEventListener("click", pick);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick();
      }
    });
  });

  const otherInput = $("industry_other");
  if (otherInput) {
    otherInput.addEventListener("input", (e) => {
      answers.industry_other = e.target.value;
      syncNextButton();
    });
  }

  $("qBack").addEventListener("click", goBack);
  $("qNext").addEventListener("click", goNext);
}

function canProceedQuestion(q) {
  if (!q || !answers[q.id]) return false;
  if (q.othersOptionId && answers[q.id] === q.othersOptionId) {
    return !!(answers.industry_other || "").trim();
  }
  return true;
}

function syncNextButton() {
  const q = QUESTIONS[idx];
  const nextBtn = $("qNext");
  if (!nextBtn || !q) return;
  const ok = canProceedQuestion(q);
  nextBtn.disabled = !ok;
  nextBtn.classList.toggle("is-ready", ok);
}

function selectOption(optId) {
  const q = QUESTIONS[idx];
  answers[q.id] = optId;
  if (q.othersOptionId && (optId === q.othersOptionId || $("industry_other"))) {
    renderQuestion();
    return;
  }
  $("quizCard").querySelectorAll(".opt").forEach((el) => {
    const on = el.dataset.opt === optId;
    el.classList.toggle("sel", on);
    el.setAttribute("aria-pressed", on ? "true" : "false");
  });
  $("qErr").textContent = "";
  syncNextButton();
}

function validateCurrentQuestion() {
  const q = QUESTIONS[idx];
  if (!answers[q.id]) return false;
  if (q.othersOptionId && answers[q.id] === q.othersOptionId && !(answers.industry_other || "").trim()) {
    const err = $("qErr");
    if (err) err.textContent = CFG.ui.errors.others;
    return false;
  }
  return true;
}

function goNext() {
  if (!validateCurrentQuestion()) return;
  track("survey_step_complete", { step_index: idx + 1, question_id: QUESTIONS[idx].id, lang });
  if (idx < QUESTIONS.length - 1) {
    idx++;
    show("screenQuiz");
    renderQuestion();
  } else showContact();
}

function goBack() {
  if (idx > 0) {
    idx--;
    renderQuestion();
  } else show("screenLanding");
}

function showContact() {
  $("contactSecureLabel").textContent = lang === "zh-Hant" ? "您的報告已準備就緒" : "Your report is ready";
  $("contactTitle").textContent = CFG.contact.title;
  $("contactIntro").textContent = CFG.contact.intro;
  const grid = document.createElement("div");
  grid.className = "grid2";
  grid.innerHTML = CFG.contact.fields
    .map(
      (f) => `
    <div class="field">
      <label for="cf_${f.key}">${esc(f.label)} ${f.required ? '<span class="req">*</span>' : ""}</label>
      <input id="cf_${f.key}" name="${f.key}" type="${f.type}" autocomplete="on" value="${esc(answers.__contact?.[f.key] || "")}" />
    </div>`
    )
    .join("");

  $("contactForm").innerHTML = "";
  $("contactForm").appendChild(grid);
  const consent = document.createElement("label");
  consent.className = "consent";
  consent.innerHTML = `<input type="checkbox" id="cf_consent" ${answers.__consent ? "checked" : ""} />
    <span>${esc(CFG.contact.consent)}</span>`;
  $("contactForm").appendChild(consent);
  $("submitBtn").textContent = `${CFG.ui.contact.submit} →`;
  show("screenContact");
  setTimeout(() => {
    const first = $("cf_" + CFG.contact.fields[0].key);
    if (first) first.focus();
  }, 60);
}

function collectContact() {
  const c = { consent: $("cf_consent")?.checked || false };
  CFG.contact.fields.forEach((f) => {
    const el = $(`cf_${f.key}`);
    if (el) c[f.key] = el.value;
  });
  return c;
}

async function submit() {
  $("contactErr").textContent = "";
  const contact = collectContact();
  answers.__contact = contact;
  answers.__consent = contact.consent;

  for (const f of CFG.contact.fields) {
    if (f.required && !(contact[f.key] || "").trim()) {
      $("contactErr").textContent = `${f.label}: ${CFG.ui.errors.required}`;
      return;
    }
    if (f.type === "email" && (contact[f.key] || "").trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact[f.key])) {
      $("contactErr").textContent = CFG.ui.errors.email;
      return;
    }
  }
  const phoneDigits = (contact.company_phone || "").replace(/\D/g, "");
  const hk = phoneDigits.length === 8 ? phoneDigits : phoneDigits.replace(/^852/, "");
  if (!/^[2-9]\d{7}$/.test(hk)) {
    $("contactErr").textContent = CFG.ui.errors.phone;
    return;
  }
  if (!contact.consent) {
    $("contactErr").textContent = CFG.ui.contact.consentRequired;
    return;
  }

  const btn = $("submitBtn");
  btn.disabled = true;
  btn.textContent = CFG.ui.contact.submitting;
  try {
    let data = null;
    if (configMode === "api") {
      try {
        const res = await fetch(apiUrl("/api/submit"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            contact,
            lang,
            industry_other: answers.industry_other || "",
          }),
        });
        data = await res.json();
        if (!res.ok) {
          $("contactErr").textContent = data.error || "Submission failed";
          return;
        }
      } catch {
        /* fall through to client scoring */
      }
    }
    if (!data) {
      if (!window.AiqScoring) {
        $("contactErr").textContent =
          lang === "zh-Hant"
            ? "無法連接伺服器。請確認已執行 npm start，或聯絡管理員。"
            : "Cannot reach the server. Run npm start on the host, or contact your administrator.";
        return;
      }
      data = window.AiqScoring.computeScore(answers, CFG);
      data._offline = true;
    }
    track("survey_submission", { survey_id: CFG.meta.surveyId, tier: data.resultType?.code, score: data.scorePct, lang });
    renderResult(data);
    show("screenResult");
  } catch (e) {
    $("contactErr").textContent = "Network error: " + e.message;
  } finally {
    btn.disabled = false;
    btn.textContent = `${CFG.ui.contact.submit} →`;
  }
}

function renderResult(data) {
  const color = TIER_COLOR[data.resultType.code] || "var(--brand)";
  const pct = data.scorePct;
  const cx = 100,
    cy = 100,
    r = 84;
  const theta = Math.PI * (1 - pct / 100);
  const nx = cx + r * Math.cos(theta),
    ny = cy - r * Math.sin(theta);

  const bd = data.breakdown || [];
  const bars = bd
    .map((b) => {
      const cls = b.pct >= 67 ? "high" : b.pct < 34 ? "low" : "";
      return `
      <div class="bd-row">
        <div class="bd-top"><span class="name">${esc(b.pillar)}</span><span class="val">${b.pct}%</span></div>
        <div class="bd-bar"><div class="bd-fill ${cls}" data-w="${b.pct}"></div></div>
      </div>`;
    })
    .join("");

  const highlights = data.highlights || {};
  const best = highlights.strongest || bd[0];
  const worst = highlights.opportunity || bd[0];
  const R = CFG.ui.result;
  const rawNote = (R.gaugeRawNote || "")
    .replace("{raw}", data.rawScore)
    .replace("{max}", data.maxRaw);

  $("resultCard").innerHTML = `
    <div class="report-head">
      <span class="report-kicker">${esc(R.kicker)}</span>
      <div class="gauge">
        <svg viewBox="0 0 200 118">
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#514899"/><stop offset="0.5" stop-color="#4f569e"/><stop offset="1" stop-color="#4baeab"/>
            </linearGradient>
          </defs>
          <path class="track" d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke-width="14" stroke-linecap="round" pathLength="100"/>
          <path class="value" id="gaugeValue" d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke-width="14" pathLength="100" stroke-dasharray="0 100"/>
          <line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
          <circle class="needle" cx="${cx}" cy="${cy}" r="6" style="fill:${color}"/>
        </svg>
        <div class="gauge-center">
          <div class="gauge-num"><span id="gaugeNum">0</span><small>%</small></div>
          <div class="gauge-cap">${esc(R.gaugeCap)}</div>
          <div class="gauge-formula muted">${esc(rawNote)}</div>
        </div>
      </div>
      <span class="tier-pill" style="color:${color};background:${hexA(color, 0.12)}"><span class="tdot"></span>${esc(data.resultType.label)}</span>
    </div>

    <h1>${esc(data.resultType.label)}</h1>
    <p class="desc">${esc(data.resultType.description)}</p>

    ${
      best && worst && best !== worst
        ? `
    <div class="callout">
      <div class="box strength"><div class="k">${esc(R.strongest)}</div><div class="v">${esc(best.pillar)} · ${best.pct}%</div></div>
      <div class="box gap"><div class="k">${esc(R.opportunity)}</div><div class="v">${esc(worst.pillar)} · ${worst.pct}%</div></div>
    </div>`
        : ""
    }

    <div class="breakdown">
      <h3>${esc(R.breakdownTitle)}</h3>
      ${bars}
    </div>

    <div class="result-foot">
      <a class="btn block" id="ctaBtn" href="${esc(consultationUrl())}" target="_blank" rel="noopener noreferrer">${esc(R.cta)}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
      <button class="btn ghost" id="restartBtn">${esc(R.restart)}</button>
      <div class="result-note">${esc(CFG.storage?.label || "")}</div>
      ${
        data._offline
          ? `<div class="result-note err-msg" style="margin-top:8px">${lang === "zh-Hant" ? "離線預覽：結果未儲存至伺服器，請使用完整後端部署以收集 leads。" : "Offline preview: result was not saved to the server. Deploy the Node backend to capture leads."}</div>`
          : ""
      }
    </div>`;

  requestAnimationFrame(() => {
    setTimeout(() => {
      $("gaugeValue").setAttribute("stroke-dasharray", `${pct} 100`);
      countUp($("gaugeNum"), pct, 1100);
      $("resultCard").querySelectorAll(".bd-fill").forEach((el) => {
        el.style.width = el.dataset.w + "%";
      });
    }, 60);
  });

  $("ctaBtn").addEventListener("click", () => {
    track("cta_consultation_click", { survey_id: CFG.meta.surveyId, tier: data.resultType.code, lang });
  });
  $("restartBtn").addEventListener("click", restart);
}

function hexA(hex, a) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${a})`;
}

function formatAiq(pct) {
  const n = Number(pct);
  return Number.isFinite(n) && n % 1 !== 0 ? n.toFixed(1) : String(Math.round(n));
}

function countUp(el, target, dur) {
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const v = target * (1 - Math.pow(1 - t, 3));
    el.textContent = formatAiq(v);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = formatAiq(target);
  };
  requestAnimationFrame(step);
}

function restart() {
  Object.keys(answers).forEach((k) => delete answers[k]);
  idx = 0;
  show("screenLanding");
}

document.addEventListener("keydown", (e) => {
  if ($("screenQuiz").classList.contains("hidden")) return;
  const q = QUESTIONS[idx];
  if (!q) return;
  if (/^[1-9]$/.test(e.key)) {
    const n = parseInt(e.key, 10) - 1;
    if (q.options[n]) selectOption(q.options[n].id);
  } else if (e.key === "Enter") goNext();
  else if (e.key === "ArrowLeft") goBack();
  else if (e.key === "ArrowRight") goNext();
});

(async function init() {
  $("startBtn").addEventListener("click", start);
  $("contactBack").addEventListener("click", () => {
    idx = QUESTIONS.length - 1;
    show("screenQuiz");
    renderQuestion();
  });
  $("submitBtn").addEventListener("click", submit);
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  try {
    BCFG = await loadBConfig();
    applyLang(lang);
    track("survey_start", { survey_id: CFG.meta.surveyId, phase: "landing_impression", lang, config_mode: configMode });
  } catch (e) {
    $("screenLanding").innerHTML = `<p class="err-msg" style="padding:24px;text-align:left;max-width:520px;margin:0 auto">${esc(e.message)}</p>`;
  }
})();
