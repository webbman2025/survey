/** Single source of truth — questions, tiers, copy (EN + 繁體中文). */

const b = (en, zh) => ({ en, "zh-Hant": zh });

export const meta = {
  surveyId: "business-aiq-health-check",
  version: "1.0.0",
  eventTag: "aws_seminar_2026_11",
};

export const pillarLabels = {
  "Strategy & Investment": b("Strategy & Investment", "策略與投資"),
  "Data Infrastructure & Tools": b("Data Infrastructure & Tools", "數據基建與工具"),
  "Process Automation & Workflows": b("Process Automation & Workflows", "流程自動化與工作流"),
  "Governance & Risk Management": b("Governance & Risk Management", "管治與風險管理"),
  "Workforce AI Adoption": b("Workforce AI Adoption", "員工 AI 採用"),
  "Business Impact & Oversight": b("Business Impact & Oversight", "業務效益與管理監督"),
};

const opt = (id, en, zh) => ({ id, label: b(en, zh) });

export const scoredQuestions = [
  {
    id: "q1",
    pillar: "Strategy & Investment",
    text: b(
      "How does your company decide whether to invest in a new AI tool or solution?",
      "公司如何決定投資新的 AI 工具或方案？"
    ),
    options: [
      opt("q1a", "Individual staff or departments choose their own AI tools based on needs", "員工或部門按個別需要自行選用 AI 工具"),
      opt("q1b", "AI tools are adopted based on competitor practices, market trends or vendor recommendations", "主要根據同業做法、市場趨勢或供應商建議採用 AI 工具"),
      opt("q1c", "AI tools are evaluated against identified operational challenges or business opportunities before adoption", "在採用前，會因應已識別的營運挑戰或業務機遇作評估"),
      opt("q1d", "AI tools are selected according to a business roadmap with defined objectives, measures and implementation plans", "根據已制定的業務發展路線圖，按既定目標、衡量指標及推行計劃選用 AI 方案"),
    ],
  },
  {
    id: "q2",
    pillar: "Data Infrastructure & Tools",
    text: b("Where are most business data and documents stored today?", "現時公司有主要存放業務資料及文件於什麼地方？"),
    options: [
      opt("q2a", "Stored across individual devices, personal clouds or paper files", "分散存放於個人裝置、個人雲端空間或紙本文件"),
      opt("q2b", "Stored in several separate shared drives or cloud storage platforms", "分散存放於不同共用硬碟或雲端儲存平台"),
      opt("q2c", "Stored in company shared drives or cloud storage platforms", "集中存放於公司共用硬碟或雲端儲存平台"),
      opt("q2d", "Stored in different drives and cloud systems but are connected and can be accessed or used across functions without manual consolidation", "毋須人手整合，存放於已互相連接的系統及雲端平台，並可跨部門存取及使用"),
    ],
  },
  {
    id: "q3",
    pillar: "Data Infrastructure & Tools",
    text: b(
      "How would you describe the quality and consistency of business data used across your company?",
      "以下哪一項最接近公司管理業務數據的情況？"
    ),
    options: [
      opt("q3a", "Data is often incomplete, duplicated or outdated", "數據經常出現缺漏、重複或過時情況"),
      opt("q3b", "Basic records are maintained, but data varies between departments", "已建立基本紀錄，但各部門存放數據紀錄參差"),
      opt("q3c", "Most business data is systematically stored and up-to-date, and updated manually by different teams", "大部分業務數據有系統地保持更新，由不同團隊定期人手維護"),
      opt("q3d", "Business data is automatically maintained and updated using standard processes and strict controls across the company", "透過既定流程及嚴謹管理機制，自動維護及更新業務數據"),
    ],
  },
  {
    id: "q4",
    pillar: "Process Automation & Workflows",
    text: b("How widely is AI used across different parts of your business?", "以下哪一項最接近公司應用 AI 的情況？"),
    options: [
      opt("q4a", "Used mainly by individual employees", "主要由個別員工使用"),
      opt("q4b", "Used within one department or business function", "主要於單一部門或業務職能內應用"),
      opt("q4c", "Used across several departments or business functions", "已於部份部門或業務職能應用"),
      opt("q4d", "Used across most departments and business functions, including customer-facing, operational and administrative teams", "已於大部分業務及職能，包括前線營運、後勤支援及行政管理廣泛應用"),
    ],
  },
  {
    id: "q5",
    pillar: "Process Automation & Workflows",
    text: b("Which statement best reflects the role AI plays in your company today?", "以下哪一項最能反映 AI 在公司的角色？"),
    options: [
      opt("q5a", "AI mainly helps staff complete individual tasks faster (Examples: translation, drafting emails, searching information)", "主要協助員工提升個人工作效率（例如：翻譯、撰寫電郵、搜尋資料）"),
      opt("q5b", "AI helps teams produce work more efficiently (Examples: presentations, proposals, reports, marketing content)", "主要協助團隊更有效地完成工作（例如：製作簡報、建議書、報告或市場推廣內容）"),
      opt("q5c", "AI supports day-to-day business processes (Examples: customer and sales analysis, reporting & forecasting)", "支援日常業務流程（例如：客戶及銷售分析、報告製作、業務預測）"),
      opt("q5d", "AI automates workflows and helps coordinate work across people, systems and departments (Examples: customer enquiry workflows, staff onboarding processes, report compilation)", "用於自動化工作流程及協調跨部門工作（例如：客戶查詢處理流程、新員工入職流程、報告整合）"),
    ],
  },
  {
    id: "q7",
    pillar: "Governance & Risk Management",
    text: b("Which statement best describes how your company manages the use of AI tools?", "以下哪一項最能反映公司如何管理員工使用 AI 工具？"),
    options: [
      opt("q7a", "No company rules or requirements currently exist", "目前沒有任何相關規定或要求"),
      opt("q7b", "Basic guidance is provided, such as what information should or should not be entered into AI tools", "已提供基本指引，例如哪些資料適合或不適合輸入 AI 工具"),
      opt("q7c", "Written guidelines define acceptable AI usage, responsibilities and approval requirements for higher-risk tasks", "已制定書面指引，涵蓋可接受的 AI 使用方式、責任分工及較高風險工作的審批要求"),
      opt("q7d", "Formal governance framework is in place, with designated ownership, documented policies, approval processes and regular review", "已建立正式管治框架，包括專責人員、書面政策、審批程序及定期檢討機制"),
    ],
  },
  {
    id: "q8",
    pillar: "Workforce AI Adoption",
    text: b("Approximately what percentage of employees use AI tools as part of their daily work?", "在日常工作中，公司約有多少比例的員工使用 AI 工具？"),
    options: [
      opt("q8a", "Less than 10%", "少於 10%"),
      opt("q8b", "10% to 30%", "10% 至 30%"),
      opt("q8c", "31% to 60%", "31% 至 60%"),
      opt("q8d", "More than 60%", "超過 60%"),
    ],
  },
  {
    id: "q9",
    pillar: "Workforce AI Adoption",
    text: b(
      "Approximately what percentage of employees have received AI-related training or coaching in the past 12 months?",
      "過去 12 個月內，公司約有多少員工曾接受 AI 相關培訓或指導？"
    ),
    options: [
      opt("q9a", "Less than 10%", "少於 10%"),
      opt("q9b", "10% to 30%", "10% 至 30%"),
      opt("q9c", "31% to 60%", "31% 至 60%"),
      opt("q9d", "More than 60%", "超過 60%"),
    ],
  },
  {
    id: "q10",
    pillar: "Business Impact & Oversight",
    text: b("What is the most significant business benefit AI has delivered so far?", "公司由開始採用 AI 至今，AI 為公司帶來最顯著的業務效益是甚麼？"),
    options: [
      opt("q10a", "No measurable benefit yet", "暫未有實際可量度的效益"),
      opt("q10b", "Improved employee productivity (Examples: less time spent on content creation, research, reporting)", "提升員工工作效率（例如：減少內容製作、資料搜集及報告準備時間）"),
      opt("q10c", "Improved operational efficiency (Examples: faster turnaround, fewer manual processes, improved service response)", "提升營運效率（例如：縮短處理時間、減少人手工序、改善服務回應速度）"),
      opt("q10d", "Contributed to revenue growth, customer acquisition, service innovation or business expansion", "促進業務增長（例如：增加收入機會、拓展客戶、推動服務創新或業務發展）"),
    ],
  },
  {
    id: "q11",
    pillar: "Business Impact & Oversight",
    text: b("How does management currently measure the value created by AI?", "現時管理層如何評估 AI 所創造的價值？"),
    options: [
      opt("q11a", "Informal measurement", "沒有正式評估的方式"),
      opt("q11b", "Feedback is mainly based on employee observations or anecdotal examples", "主要根據員工意見或個別案例作判斷"),
      opt("q11c", "Specific fields such as productivity, turnaround time or service quality are identified and reviewed periodically", "已就生產力、處理時間或服務質素等範疇定期檢視"),
      opt("q11d", "Management tracks AI-related business outcomes using defined metrics or KPIs", "透過已制定的指標或 KPI 持續追蹤 AI 帶來的業務成果"),
    ],
  },
];

export const qualitativeQuestions = [
  {
    id: "q6",
    scored: false,
    pillar: "Process Automation & Workflows",
    text: b(
      "What is currently the biggest obstacle preventing your company from getting more value from AI?",
      "有甚麼主要因素令公司未有更廣泛地採用 AI？"
    ),
    options: [
      opt("q6a", "We are satisfied with our current level of AI adoption", "現有 AI 應用水平已符合業務需要"),
      opt("q6b", "Limited budget or internal resources", "有限預算或內部資源"),
      opt("q6c", "Lack of employee skills, expertise or implementation support", "缺乏相關技能、專業知識或推行支援"),
      opt("q6d", "Uncertain how to identify and implement the right AI solutions", "不清楚如何選擇及落實合適的 AI 方案"),
    ],
  },
  {
    id: "q12",
    scored: false,
    pillar: "Business Impact & Oversight",
    text: b(
      "Which statement best reflects your company's AI goals over the next 12 months?",
      "以未來 12 個月計，以下哪一項最能反映公司的 AI 發展目標？"
    ),
    options: [
      opt("q12a", "Maintain current AI usage levels", "維持現有 AI 應用水平"),
      opt("q12b", "Expand AI usage within selected teams or functions", "擴展 AI 應用至指定團隊或職能"),
      opt("q12c", "Deploy AI across multiple departments and business processes", "在多個部門及業務流程中推行 AI"),
      opt("q12d", "Transform key business workflows using AI", "利用 AI 改變關鍵業務流程"),
    ],
  },
];

export const profileQuestions = [
  {
    id: "q13",
    text: b("Industry Sector", "行業"),
    type: "choice",
    options: [
      opt("q13a", "Construction & Engineering", "建築及工程"),
      opt("q13b", "Education", "教育"),
      opt("q13c", "Entertainment & Media", "娛樂及媒體"),
      opt("q13d", "Financial Services & Insurance", "金融及保險"),
      opt("q13e", "Healthcare", "醫療健康"),
      opt("q13f", "Hospitality & F&B", "餐飲及酒店"),
      opt("q13g", "Logistics, Transportation & Supply Chain", "物流、運輸及供應鏈"),
      opt("q13h", "Manufacturing", "製造業"),
      opt("q13i", "Professional Services", "專業服務"),
      opt("q13j", "Property Management & Real Estate", "物業管理及地產"),
      opt("q13k", "Retail & E-commerce", "零售及電子商務"),
      opt("q13l", "Technology", "科技及資訊科技"),
      opt("q13m", "Wholesale & Trading", "批發及貿易"),
      opt("q13n", "Others (please specify)", "其他（請註明）"),
    ],
    othersOptionId: "q13n",
  },
  {
    id: "q14",
    text: b("Employee Headcount", "員工人數"),
    type: "choice",
    options: [
      opt("q14a", "1 to 4", "1 至 4 人"),
      opt("q14b", "5 to 9", "5 至 9 人"),
      opt("q14c", "10 to 19", "10 至 19 人"),
      opt("q14d", "20 to 49", "20 至 49 人"),
      opt("q14e", "50 or above", "50 人或以上"),
    ],
  },
  {
    id: "q15",
    text: b("Company spend on AI subscriptions, tools and solutions each month (HKD)", "公司每月在 AI 訂閱、工具及方案方面的支出（港幣）"),
    type: "choice",
    options: [
      opt("q15a", "Less than $1,000 per month", "每月少於 $1,000"),
      opt("q15b", "$1,000 to $4,999 per month", "每月 $1,000 至 $4,999"),
      opt("q15c", "$5,000 to $19,999 per month", "每月 $5,000 至 $19,999"),
      opt("q15d", "$20,000 or above per month", "每月 $20,000 或以上"),
    ],
  },
  {
    id: "q16",
    text: b("Annual Turnover (HKD)", "公司全年營業額（港幣）"),
    type: "choice",
    options: [
      opt("q16a", "Under $1M", "100 萬以下"),
      opt("q16b", "$1M–$9.99M", "100 萬至 999 萬"),
      opt("q16c", "$10M–$49.99M", "1,000 萬至 4,999 萬"),
      opt("q16d", "$50M or above", "5,000 萬或以上"),
    ],
  },
];

export const contactFields = [
  { key: "company_name", label: b("Company name", "公司名稱"), type: "text", required: true },
  { key: "full_name", label: b("Your name", "姓名"), type: "text", required: true },
  { key: "job_title", label: b("Job title", "職位"), type: "text", required: true },
  { key: "company_email", label: b("Company email address", "公司電郵地址"), type: "email", required: true },
  { key: "company_phone", label: b("Company phone number", "公司聯絡電話"), type: "tel", required: true },
];

export const tiers = [
  {
    code: "AI_ACCELERATOR",
    minScore: 76,
    label: b("AI Accelerator", "AI 加速者"),
    description: b(
      "Your company demonstrates a mature and structured approach to AI adoption, with AI supporting both operational performance and business objectives. The next step is to accelerate innovation, automate higher-value workflows and explore new growth opportunities enabled by AI.",
      "公司已具備成熟及有系統的 AI 應用能力，並有效支援業務營運及發展目標。下一步可聚焦於推動創新、自動化更高價值的工作流程，以及發掘新的業務增長機會。"
    ),
  },
  {
    code: "AI_BUILDER",
    minScore: 51,
    label: b("AI Builder", "AI 建設者"),
    description: b(
      "Your company has established a solid AI foundation, supported by growing adoption and business improvements. Focus can now shift towards connecting processes, scaling successful use cases and driving more consistent business outcomes.",
      "公司已建立穩健的 AI 應用基礎，並在業務運作上取得實際成果。未來可進一步透過 AI 整合不同流程、擴展成功應用案例及提升自動化水平，以推動更一致及可持續的業務效益。"
    ),
  },
  {
    code: "AI_ADOPTER",
    minScore: 26,
    label: b("AI Adopter", "AI 採用者"),
    description: b(
      "Your company has started applying AI in selected areas and is seeing initial benefits. The next opportunity is to expand adoption across teams, strengthen governance and align AI initiatives more closely with business priorities to unlock greater value.",
      "公司已開始於部分範疇應用 AI，並看見初步成效。下一步可考慮將 AI 應用擴展至更多團隊及業務流程，同時加強管治及協作機制，以釋放 AI 可帶來更大的業務價值。"
    ),
  },
  {
    code: "AI_EXPLORER",
    minScore: 0,
    label: b("AI Explorer", "AI 探索者"),
    description: b(
      "Your company is at the early stage of its AI journey, with AI usage largely driven by individual initiatives and limited integration into business operations. Building a clearer adoption strategy and identifying practical use cases can help create a stronger foundation for future growth.",
      "公司正處於 AI 應用的起步階段，現有應用主要集中於個別員工應用層面，有空間將 AI 應用整合至業務流程。透過建立更清晰的應用方向及發掘合適的業務場景，可為未來擴展 AI 應用帶來更穩固基礎。"
    ),
  },
];

export const ui = {
  productName: b("Business AIQ Health Check", "企業 AIQ 健康掃描"),
  landing: {
    badge: b("3Business x Free Business AIQ Health Check", "3Business x 免費企業 AIQ 健康掃描"),
    title: b("How ", "您的企業"),
    titleGrad: b("AI-ready", "AI 成熟度"),
    titleEnd: b(" is your business?", "如何？"),
    lead: b(
      "Answer 16 quick questions across six dimensions of your operation. We'll score your AI maturity out of 100 and show you exactly where you stand — and what to focus on next.",
      "只需約 5 分鐘，回答涵蓋六大維度的 16 題問題。我們會為您的 AI 成熟度評分（滿分 100），並指出下一步應聚焦的方向。"
    ),
    chips: [
      b("6 pillars assessed", "6 大維度評估"),
      b("16 questions", "16 題問題"),
      b("~5 minutes", "約 5 分鐘"),
    ],
    start: b("Start the assessment", "開始評估"),
    fine: b("No sign-up needed to begin · You'll see your result at the end", "無需註冊即可開始 · 完成後即時查看結果"),
    langPrompt: b("Choose your language", "選擇語言"),
  },
  steps: {
    assessment: b("Step 1/3: Assessment", "步驟 1/3：成熟度評估"),
    goals: b("Step 2/3: Business Goals", "步驟 2/3：業務目標"),
    profile: b("Step 3/3: Profile & Contact", "步驟 3/3：公司資料及聯絡"),
  },
  contact: {
    title: b("Almost there — unlock your AIQ report", "即將完成 — 取得您的 AIQ 報告"),
    intro: b(
      "Enter your business contact details to receive your personalised score, tier diagnosis and pillar breakdown.",
      "請提供公司聯絡資料，以取得個人化的 AIQ 分數、成熟度等級及六大維度分析。"
    ),
    consent: b(
      "I agree that 3Business (HTHK) may use my personal data provided above to follow up on enterprise AI solutions, in accordance with the Personal Data (Privacy) Ordinance (PDPO). I understand I may request access to or correction of my data.",
      "本人同意 3Business（HTHK）可根據《個人資料（私隱）條例》（PDPO）使用以上提供的個人資料，以便就企業 AI 方案作出跟進。本人知悉可要求查閱或更正相關個人資料。"
    ),
    consentRequired: b("Please confirm the privacy statement to continue.", "請確認私隱聲明以繼續。"),
    submit: b("See my result", "查看我的結果"),
    submitting: b("Preparing your report…", "正在生成報告…"),
  },
  result: {
    kicker: b("Your Business AIQ Report", "您的企業 AIQ 報告"),
    breakdownTitle: b("Pillar breakdown", "六大維度分析"),
    strongest: b("Strongest pillar", "最強維度"),
    opportunity: b("Biggest opportunity", "最大提升空間"),
    cta: b("Book Free Business AIQ Health Check", "預約免費企業 AIQ 健康掃描"),
    restart: b("Retake assessment", "重新評估"),
    gaugeCap: b("AIQ score (0–100)", "AIQ 分數（0–100）"),
    gaugeRawNote: b(
      "Answer total {raw}/{max} pts · AIQ = (points − 10) ÷ 30 × 100",
      "答題總分 {raw}/{max} 分 · AIQ =（總分 − 10）÷ 30 × 100"
    ),
  },
  errors: {
    required: b("This field is required", "此欄為必填"),
    email: b("Please enter a valid email address", "請輸入有效的電郵地址"),
    phone: b("Please enter a valid 8-digit Hong Kong phone number", "請輸入有效的 8 位香港電話號碼"),
    others: b("Please specify your industry", "請註明您的行業"),
  },
  footer: b(
    "© 2026 3Business · HK Telecommunications International (HTHK). AWS Seminar (10 Nov).",
    "© 2026 3Business · 香港電訊國際（HTHK）· AWS 研討會（11 月 10 日）"
  ),
};

const ctaConsultationUrlByLang = {
  en: process.env.CONSULTATION_URL_EN || process.env.CONSULTATION_URL || "https://web.three.com.hk/3business/contactus-en.html",
  "zh-Hant":
    process.env.CONSULTATION_URL_ZH ||
    process.env.CONSULTATION_URL ||
    "https://web.three.com.hk/3business/contactus.html",
};

function localizeQuestion(q, lang) {
  return {
    ...q,
    text: q.text[lang] || q.text.en,
    pillar: q.pillar ? (pillarLabels[q.pillar]?.[lang] || q.pillar) : "",
    options: q.options.map((o) => ({ id: o.id, label: o.label[lang] || o.label.en })),
  };
}

const pick = (obj, L) => (obj && obj[L]) || obj?.en || "";

export function getPublicConfig(lang = "en") {
  const L = lang === "zh-Hant" ? "zh-Hant" : "en";
  return {
    meta,
    lang: L,
    ui: {
      productName: pick(ui.productName, L),
      landing: {
        badge: pick(ui.landing.badge, L),
        title: pick(ui.landing.title, L),
        titleGrad: pick(ui.landing.titleGrad, L),
        titleEnd: pick(ui.landing.titleEnd, L),
        lead: pick(ui.landing.lead, L),
        chips: ui.landing.chips.map((c) => pick(c, L)),
        start: pick(ui.landing.start, L),
        fine: pick(ui.landing.fine, L),
        langPrompt: pick(ui.landing.langPrompt, L),
      },
      steps: {
        assessment: pick(ui.steps.assessment, L),
        goals: pick(ui.steps.goals, L),
        profile: pick(ui.steps.profile, L),
      },
      contact: {
        title: pick(ui.contact.title, L),
        intro: pick(ui.contact.intro, L),
        consent: pick(ui.contact.consent, L),
        consentRequired: pick(ui.contact.consentRequired, L),
        submit: pick(ui.contact.submit, L),
        submitting: pick(ui.contact.submitting, L),
      },
      result: {
        kicker: pick(ui.result.kicker, L),
        breakdownTitle: pick(ui.result.breakdownTitle, L),
        strongest: pick(ui.result.strongest, L),
        opportunity: pick(ui.result.opportunity, L),
        cta: pick(ui.result.cta, L),
        restart: pick(ui.result.restart, L),
        gaugeCap: pick(ui.result.gaugeCap, L),
        gaugeRawNote: pick(ui.result.gaugeRawNote, L),
      },
      errors: {
        required: pick(ui.errors.required, L),
        email: pick(ui.errors.email, L),
        phone: pick(ui.errors.phone, L),
        others: pick(ui.errors.others, L),
      },
      footer: pick(ui.footer, L),
    },
    steps: {
      assessment: pick(ui.steps.assessment, L),
      goals: pick(ui.steps.goals, L),
      profile: pick(ui.steps.profile, L),
    },
    scoredQuestions: scoredQuestions.map((q) => localizeQuestion(q, L)),
    qualitativeQuestions: qualitativeQuestions.map((q) => localizeQuestion({ ...q, scored: false }, L)),
    profileQuestions: profileQuestions.map((q) => ({
      id: q.id,
      text: q.text[L],
      type: q.type,
      othersOptionId: q.othersOptionId,
      options: q.options.map((o) => ({ id: o.id, label: o.label[L] })),
    })),
    contact: {
      title: ui.contact.title[L],
      intro: ui.contact.intro[L],
      consent: ui.contact.consent[L],
      fields: contactFields.map((f) => ({
        key: f.key,
        label: f.label[L],
        type: f.type,
        required: f.required,
      })),
    },
    tiers: tiers.map((t) => ({
      code: t.code,
      minScore: t.minScore,
      label: t.label[L],
      description: t.description[L],
    })),
    ctaConsultationUrl: ctaConsultationUrlByLang[L],
    storage: {
      mode: "file",
      label: L === "zh-Hant" ? "安全儲存於 3Business 伺服器" : "Stored securely on 3Business servers",
    },
  };
}

export function getTiersForScoring() {
  return tiers;
}
