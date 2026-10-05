/** Optional email / webhook hooks — configure via environment variables. */

export async function notifyLead(record) {
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
    } catch (e) {
      console.error("[notifyLead] webhook failed:", e.message);
    }
  }

  if (process.env.SMTP_LOG === "1") {
    console.log("[notifyLead] new submission:", record.company_email, record.score_pct, record.result_type);
  }
}

export function buildReportEmailHtml(record, lang) {
  const isZh = lang === "zh-Hant";
  const title = isZh ? "您的企業 AIQ 健康掃描報告" : "Your Business AIQ Health Check Report";
  return `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;color:#0f172a">
<h1>${title}</h1>
<p><strong>AIQ:</strong> ${record.score_pct}/100 — ${record.result_label}</p>
<p>${record.result_description}</p>
<p style="color:#64748b;font-size:13px">3Business × AWS</p>
</body></html>`;
}

export async function sendReportEmail(record) {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM || "noreply@3business.com.hk";
  if (!apiKey || !record.company_email) return;

  // Placeholder: integrate SendGrid/SES/etc. when credentials are available.
  console.log("[sendReportEmail] would send to", record.company_email, "from", from);
  void buildReportEmailHtml(record, record.lang);
}
