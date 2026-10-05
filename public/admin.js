const $ = (id) => document.getElementById(id);
let currentRows = [];
let adminKey = "";

function authHeaders() {
  return { "x-admin-key": adminKey };
}

async function load() {
  $("err").textContent = "";
  adminKey = $("keyInput").value.trim();
  if (!adminKey) {
    $("err").textContent = "Admin key required";
    return;
  }
  try {
    const res = await fetch("/api/results", { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) {
      $("err").textContent = data.error || "Failed to load";
      return;
    }
    currentRows = data.rows || [];
    if (data.storageMode === "vercel-ephemeral") {
      $("err").textContent =
        "Warning: Vercel storage is temporary until Blob is connected. Leads may not appear after redeploys. Connect Vercel Blob (see IT spec).";
      $("err").style.color = "#b45309";
    }
    renderSummary(currentRows);
    renderTable(currentRows);
  } catch (e) {
    $("err").textContent = "Network error: " + e.message;
  }
}

function renderSummary(rows) {
  const buckets = {};
  let sum = 0;
  rows.forEach((r) => {
    buckets[r.result_type] = (buckets[r.result_type] || 0) + 1;
    sum += Number(r.score_pct) || 0;
  });
  const order = ["AI_ACCELERATOR", "AI_BUILDER", "AI_ADOPTER", "AI_EXPLORER"];
  const grid = $("summary");
  grid.innerHTML = "";
  const avg = rows.length ? (sum / rows.length).toFixed(0) : "0";
  addStat(grid, "Total", rows.length);
  order.forEach((k) => addStat(grid, k.replace("AI_", ""), buckets[k] || 0));
  addStat(grid, "Avg AIQ", avg);
  grid.classList.remove("hidden");
}

function addStat(grid, label, n) {
  const d = document.createElement("div");
  d.className = "stat";
  d.innerHTML = `<div class="n">${n}</div><div class="l">${label}</div>`;
  grid.appendChild(d);
}

function renderTable(rows) {
  const tb = $("tbody");
  tb.innerHTML = "";
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td>${fmtDate(r.created_at)}</td>` +
      `<td>${esc(r.company_name)}</td>` +
      `<td>${esc(r.full_name)}</td>` +
      `<td>${esc(r.job_title)}</td>` +
      `<td>${esc(r.company_email)}</td>` +
      `<td>${esc(r.company_phone)}</td>` +
      `<td>${r.raw_score}/${r.max_raw}</td>` +
      `<td>${r.score_pct}%</td>` +
      `<td><span class="pill ${esc(r.result_type)}">${esc(r.result_label)}</span></td>` +
      `<td>${esc(r.lang)}</td>`;
    tb.appendChild(tr);
  });
  $("table").classList.remove("hidden");
  $("empty").classList.toggle("hidden", rows.length > 0);
  if (!rows.length) $("empty").classList.remove("hidden");
}

function fmtDate(s) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d)) return s;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

$("loadBtn").addEventListener("click", load);
$("filterInput").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) return renderTable(currentRows);
  renderTable(
    currentRows.filter(
      (r) =>
        (r.company_name || "").toLowerCase().includes(q) ||
        (r.company_email || "").toLowerCase().includes(q) ||
        (r.full_name || "").toLowerCase().includes(q)
    )
  );
});
