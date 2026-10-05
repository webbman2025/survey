# Business AIQ Health Check

Interactive **5-minute AI readiness self-assessment** for the **3Business × AWS Seminar (10 Nov)**. Cloned from the [AI Maturity Assessment POC](https://c2tw935h.qwenwork.host/) and extended per the AWS Seminar PRD.

## Features

- **Bilingual** EN / 繁體中文 with in-session language switch (answers preserved)
- **3-step flow**: 10 scored maturity questions → Q6 & Q12 insights → company profile (Q13–16) + lead form (Q17–21)
- **AIQ scoring**: `(raw − 10) / 30 × 100` with Tier 1–4 diagnosis and 6-pillar breakdown
- **Lead capture**: PDPO consent, HK 8-digit phone validation, email validation
- **Admin dashboard** at `/admin` (protected by `ADMIN_KEY`)
- **Analytics hooks**: `survey_start`, `survey_step_complete`, `survey_submission`, `cta_consultation_click` via `dataLayer`

## Quick start

```bash
npm install
npm start
# Localhost: http://127.0.0.1:3000 or http://localhost:3000
# Same Wi‑Fi: use the LAN IP printed in the terminal (e.g. http://192.168.x.x:3000)
```

Optional environment variables (`.env` or shell):

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `3000`) |
| `LISTEN_HOST` | Bind address: `0.0.0.0` (default) for localhost + LAN; `127.0.0.1` for local only |
| `ADMIN_KEY` | Admin API key (default `demo-admin-key`) |
| `CONSULTATION_URL` | CTA link on results page |
| `LEAD_WEBHOOK_URL` | POST JSON payload on each submission |
| `EMAIL_API_KEY` / `EMAIL_FROM` | Placeholder for report email integration |

Question copy and tiers live in **`server/surveyConfig.js`** (single replaceable data module).

## Project layout

```
public/          Static UI (index, app.js, styles, admin)
server/          Express API, scoring, storage, notifications
data/            submissions.json (gitignored; created at runtime)
```

## Acceptance checks

- All-min / all-max answers yield **0** and **100** AIQ with correct tiers
- Language toggle mid-flow keeps selected options
- Mobile-friendly layout (same theme as POC)
