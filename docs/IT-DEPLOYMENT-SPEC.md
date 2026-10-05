# Business AIQ Health Check — IT Deployment Specification

**Document version:** 1.2  
**Application ID:** `business-aiq-health-check`  
**Purpose:** AWS Seminar / 3Business lead-generation survey (bilingual EN + 繁體中文)  
**Source repository:** https://github.com/webbman2025/survey  

---

## 1. Executive summary

This application is a **single Node.js service** that:

1. Serves the survey **frontend** (static files under `public/`).
2. Exposes a **JSON API** for questionnaire config, scoring, lead submission, and admin export.
3. Persists leads as **JSON** (no SQL database in this application).

**Critical:** Uploading only HTML/CSS/JS to Apache/IIS **without** running the Node process will **not** work for production (users will see “Failed to fetch” or results without saved leads). IT must deploy **Node 18+** with a **reverse proxy** and **HTTPS**.

**Database:** A separate MySQL/PostgreSQL/MongoDB instance is **not required** for seminar-scale traffic on a single Node server. Production on-prem uses **`data/submissions.json`** with filesystem backup. Optional **`LEAD_WEBHOOK_URL`** can mirror each lead to CRM. Add a database only if IT needs multi-server writes, complex querying, or long-term enterprise retention beyond file + CRM.

---

## 2. Architecture

```mermaid
flowchart LR
  User["Browser / QR code"] -->|HTTPS| RP["Nginx or Apache"]
  RP -->|"HTTP localhost:PORT"| Node["Node.js Express"]
  Node --> Static["public UI"]
  Node --> API["JSON API routes"]
  Node --> Data[("submissions.json")]
  Node -->|optional| Webhook["LEAD_WEBHOOK_URL"]
  Node -->|optional| Email["Email API"]
  Admin["Sales / Marketing"] -->|"HTTPS + ADMIN_KEY"| AdminUI["Admin dashboard"]
```

### 2.1 User flow

| Step | UI label | Content |
|------|----------|---------|
| 1/3 | Assessment | 10 scored questions (Q1–5, Q7–11) |
| 2/3 | Business goals | Q6, Q12 (not scored) |
| 3/3 | Profile & contact | Q13–16 + contact form (Q17–21) + PDPO consent |
| Result | AIQ report | Score 0–100, tier, pillar breakdown, CTA |

### 2.2 Technology stack

| Layer | Technology |
|-------|------------|
| Runtime | **Node.js ≥ 18** (LTS 20 recommended) |
| Web framework | Express 4.x |
| Frontend | Vanilla HTML/CSS/JS (no build step required) |
| Config / copy | `server/surveyConfig.js` (single source of truth) |
| Lead storage | JSON (file, Vercel Blob, or ephemeral `/tmp` — see §2.3) |
| Package manager | npm (`package-lock.json` committed) |

### 2.3 Lead persistence (no database)

Implementation: **`server/storage.js`**. Each submission is one JSON object (contact, answers, score, tier, timestamp). The admin API returns all records; there is no SQL query layer.

| Mode | When | Where leads live | Durable? |
|------|------|------------------|----------|
| **`file`** | On-prem / VM / local `npm start` (default) | `data/submissions.json` (array, newest first) | **Yes** — backup this file |
| **`vercel-blob`** | Vercel with `BLOB_READ_WRITE_TOKEN` | Private objects `leads/<submission-id>.json` ([Vercel Blob](https://vercel.com/docs/storage/vercel-blob)) | **Yes** for serverless |
| **`vercel-ephemeral`** | Vercel without Blob token | `/tmp/survey-submissions.json` | **No** — do not use for production leads |

The admin dashboard (`GET /api/results`) includes **`storageMode`** (`file` \| `vercel-blob` \| `vercel-ephemeral`) for verification.

**When JSON file storage is appropriate (recommended for 3Business on-prem):**

- Single Node process behind reverse proxy
- Campaign volume (hundreds–low thousands of submissions)
- Daily backup of `data/` during the event
- Optional webhook to CRM as system of record

**When IT should add a database or CRM-only storage:**

- Multiple app instances writing concurrently to the same host
- Ad-hoc reporting (filters, date ranges) without exporting JSON
- Strict retention, deletion workflows, or audit requirements beyond file backup + PDPO process

Question copy and tiers remain in **`server/surveyConfig.js`** — not in any database.

---

## 3. Repository layout

```
survey/
├── public/                 # Web UI (served at /)
│   ├── index.html          # Survey entry (USE THIS as web root content)
│   ├── app.js              # Client application
│   ├── styles.css
│   ├── admin.html          # Lead dashboard UI
│   ├── admin.js
│   ├── config.bilingual.json  # Static fallback config (regenerated on start)
│   └── assets/
├── server/
│   ├── index.js            # HTTP server + API routes
│   ├── surveyConfig.js     # Questions, tiers, copy (EN/zh-Hant)
│   ├── scoring.js          # AIQ algorithm
│   ├── storage.js          # Lead persistence
│   ├── notifications.js    # Webhook / email hooks
│   └── exportStaticConfig.js
├── data/                   # Writable at runtime (submissions.json)
├── package.json
├── .env.example            # Environment variable template
└── docs/IT-DEPLOYMENT-SPEC.md
```

**Do not** point the public document root only at the repo root `index.html` (legacy helper). Production document root should be served by **Node**, which serves `public/index.html` at `/`.

---

## 4. Infrastructure requirements

### 4.1 Minimum server spec (seminar traffic)

| Resource | Recommendation |
|----------|----------------|
| OS | Linux (Ubuntu 22.04+ / RHEL 8+) or Windows Server with Node support |
| CPU / RAM | 1 vCPU, 512 MB–1 GB RAM |
| Disk | 1 GB+ (logs + `data/` growth) |
| Network | Inbound **443** (HTTPS); outbound HTTPS for webhooks/email |

### 4.2 Required software

- Node.js **18.x or 20.x** (`node -v`)
- npm **9+**
- Reverse proxy: **Nginx** or **Apache** (TLS termination)
- Process supervisor: **systemd**, **PM2**, or equivalent

### 4.3 Not supported (without rework)

- PHP-only / static-only shared hosting with no Node
- FTP upload of `public/` only
- Vercel deploy **without** `BLOB_READ_WRITE_TOKEN` (leads land in ephemeral `/tmp` only)
- Expecting PHP/phpMyAdmin-only hosting with no Node (no DB schema is provided — persistence is JSON files or Blob)

---

## 5. Installation procedure

### 5.1 Deploy code

```bash
# Example path on server
sudo mkdir -p /var/www/business-aiq
sudo chown deploy:deploy /var/www/business-aiq

cd /var/www/business-aiq
git clone https://github.com/webbman2025/survey.git .
# OR rsync/scp from release artifact

npm ci --omit=dev
```

### 5.2 Environment variables

Create `/var/www/business-aiq/.env` (permissions **600**, owner = service user):

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Listen port (default **3000**) |
| `LISTEN_HOST` | No | Bind address (default **`0.0.0.0`**). **Production (behind reverse proxy):** set **`127.0.0.1`** so only the local proxy can reach Node. **Local rehearsal / LAN QR testing:** keep **`0.0.0.0`** for `http://127.0.0.1:PORT`, `http://localhost:PORT`, and `http://<LAN-IP>:PORT`. Do **not** rely on the shell variable `HOST` (macOS often sets `HOST` to the computer name); the app reads **`LISTEN_HOST`** only. |
| `ADMIN_KEY` | **Yes (prod)** | Secret for `/admin` and `GET /api/results` (`x-admin-key` header) |
| `CONSULTATION_URL` | No | Overrides CTA for all languages if set |
| `CONSULTATION_URL_EN` | No | Result CTA (English) — default: 3Business contact EN |
| `CONSULTATION_URL_ZH` | No | Result CTA (繁中) — default: 3Business contact TC |
| `LEAD_WEBHOOK_URL` | No | POST JSON body on each successful submit (recommended if CRM is system of record) |
| `BLOB_READ_WRITE_TOKEN` | Vercel only | Enables durable lead storage on Vercel (`vercel-blob` mode). Create a Blob store in the Vercel project and link the token. **Not used on on-prem** (uses `data/submissions.json` instead). |
| `EMAIL_API_KEY` | No | Placeholder for transactional email integration |
| `EMAIL_FROM` | No | Sender address for report email |

See `.env.example` in the repository.

**Production `.env` example:**

```bash
PORT=3000
LISTEN_HOST=127.0.0.1
ADMIN_KEY=<strong-secret>
```

**Local / seminar rehearsal (same Wi‑Fi, no public internet):**

```bash
LISTEN_HOST=0.0.0.0
npm start
```

On start, the process logs **localhost** URLs and any detected **LAN IPv4** addresses. Do not expose port `3000` on the public internet; use HTTPS reverse proxy for production.

Load env in systemd (below) or export before `npm start`.

### 5.3 Writable data directory (on-prem / VM)

**Skip this section on Vercel** — use **`BLOB_READ_WRITE_TOKEN`** instead (§2.3).

```bash
mkdir -p /var/www/business-aiq/data
chown deploy:deploy /var/www/business-aiq/data
chmod 750 /var/www/business-aiq/data
```

Leads are appended to **`data/submissions.json`**. Schedule **backup** (daily during campaign) and restrict filesystem ACLs. No database install or migration is required.

### 5.4 Start command

```bash
cd /var/www/business-aiq
npm start
```

This runs `prestart` (regenerates `public/config.bilingual.json`) then `node server/index.js`.

**Health check:** `curl -s http://127.0.0.1:3000/api/health`  
Expected: `{"ok":true,"service":"business-aiq-health-check"}`

### 5.5 systemd unit (recommended)

`/etc/systemd/system/business-aiq.service`:

```ini
[Unit]
Description=Business AIQ Health Check
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/business-aiq
EnvironmentFile=/var/www/business-aiq/.env
Environment=NODE_ENV=production
Environment=LISTEN_HOST=127.0.0.1
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now business-aiq
sudo systemctl status business-aiq
```

### 5.6 Nginx reverse proxy (example)

Replace `aiq.example.com` with production hostname.

```nginx
server {
    listen 443 ssl http2;
    server_name aiq.example.com;

    ssl_certificate     /etc/ssl/certs/aiq.example.com.crt;
    ssl_certificate_key /etc/ssl/private/aiq.example.com.key;

    client_max_body_size 256k;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name aiq.example.com;
    return 301 https://$host$request_uri;
}
```

**Important:** Do not expose port 3000 on the public firewall; only the proxy should be public.

### 5.7 Apache reverse proxy (example)

```apache
<VirtualHost *:443>
    ServerName aiq.example.com
    SSLEngine on
    # SSLCertificateFile / SSLCertificateKeyFile ...

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

Enable modules: `proxy`, `proxy_http`, `ssl`.

---

## 6. HTTP API specification

Base URL: `https://<hostname>/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Liveness probe |
| GET | `/api/config?lang=en` | None | Single-language config |
| GET | `/api/config/bilingual` | None | EN + zh-Hant config (used by UI) |
| POST | `/api/submit` | None | Validate lead, score, persist, return report |
| GET | `/api/results` | Header `x-admin-key: <ADMIN_KEY>` | All submissions (JSON array) |
| GET | `/` | None | Survey UI |
| GET | `/admin` | None (UI); API key entered in browser | Admin dashboard |

### 6.1 POST `/api/submit`

**Request** `Content-Type: application/json`

```json
{
  "lang": "en",
  "answers": {
    "q1": "q1b",
    "q2": "q2a",
    "...": "...",
    "q13": "q13l"
  },
  "contact": {
    "company_name": "Acme Ltd",
    "full_name": "Jane Chan",
    "job_title": "IT Manager",
    "company_email": "jane@acme.hk",
    "company_phone": "91234567",
    "consent": true
  },
  "industry_other": ""
}
```

**Validation rules:**

- All scored question IDs present: `q1`–`q5`, `q7`–`q11`.
- Email format validated.
- Phone: **8-digit Hong Kong** (optional leading 852 stripped).
- PDPO `consent` must be true.
- If `q13` = Others, `industry_other` required.

**Success response (200):**

```json
{
  "ok": true,
  "rawScore": 28,
  "maxRaw": 40,
  "scorePct": 60,
  "resultType": {
    "code": "AI_BUILDER",
    "label": "AI Builder",
    "description": "..."
  },
  "breakdown": [ { "pillar": "...", "pct": 75, "score": 6, "max": 8 } ],
  "highlights": { "strongest": { ... }, "opportunity": { ... } }
}
```

### 6.2 Scoring algorithm (acceptance)

- Each scored option `a|b|c|d` = **1–4 points**.
- Raw score = sum of 10 scored answers (**10–40**).
- **AIQ (0–100):** `(raw − 10) / 30 × 100` (one decimal).
- **Tiers:**

| AIQ range | Tier code | Label |
|-----------|-----------|--------|
| 0.0 – 25.0 | AI_EXPLORER | AI Explorer |
| 26.0 – 50.0 | AI_ADOPTER | AI Adopter |
| 51.0 – 75.0 | AI_BUILDER | AI Builder |
| 76.0 – 100.0 | AI_ACCELERATOR | AI Accelerator |

- Pillar bars = pillar points / pillar max × 100 ( **not** averaged to AIQ).

Verify on server after deploy:

```bash
npm test
```

---

## 7. Security & PDPO

| Topic | Requirement |
|-------|-------------|
| Transport | **HTTPS only** for public URL (seminar QR codes) |
| Personal data | Name, email, phone, company, job title, survey answers |
| Consent | Mandatory checkbox (PDPO statement in UI) |
| Admin | Strong `ADMIN_KEY`; restrict `/admin` by VPN or IP allowlist if possible |
| Secrets | Never commit `.env` or `data/submissions.json` to git |
| Rate limiting | Recommended on `POST /api/submit` (WAF / nginx `limit_req`) |
| Logging | Avoid logging full PII in web server access logs at debug level |

---

## 8. Analytics (optional)

The frontend pushes events to `window.dataLayer` (GTM-ready):

- `survey_start`
- `survey_step_complete`
- `survey_submission`
- `cta_consultation_click`

IT may inject **Google Tag Manager** in `public/index.html` for GA4.

---

## 9. Optional integrations

| Integration | Env var | Behaviour |
|-------------|---------|-----------|
| Lead file backup | *(on-prem)* | Copy `data/submissions.json` on schedule; no DB |
| Vercel Blob | `BLOB_READ_WRITE_TOKEN` | One JSON object per lead under `leads/` |
| CRM / webhook | `LEAD_WEBHOOK_URL` | POST full lead record JSON on submit |
| Email report | `EMAIL_API_KEY`, `EMAIL_FROM` | Hook in `server/notifications.js` (requires IT to wire SendGrid/SES/etc.) |
| Result CTA | `CONSULTATION_URL_*` | Opens 3Business contact form in new tab |

Default CTA (English): https://web.three.com.hk/3business/contactus-en.html

---

## 10. Content updates

Question text, tiers, and UI strings: edit **`server/surveyConfig.js`**, then:

```bash
npm run prestart   # refresh config.bilingual.json
npm start          # or restart systemd service
```

No database migration required.

---

## 11. Production acceptance checklist

- [ ] `GET https://<hostname>/api/health` returns `ok: true`
- [ ] Survey loads at `https://<hostname>/` (EN + 繁中 toggle)
- [ ] Complete flow: all questions → contact → result with gauge and tier
- [ ] Raw 10 → AIQ **0**; raw 40 → AIQ **100** (smoke test)
- [ ] Lead appears in `/admin` with `ADMIN_KEY`; on-prem also in `data/submissions.json`
- [ ] `/api/results` reports expected **`storageMode`** (`file` on VM; `vercel-blob` on Vercel)
- [ ] CTA opens 3Business contact page
- [ ] Mobile: iOS Safari + Android Chrome
- [ ] TLS certificate valid; HTTP redirects to HTTPS
- [ ] `data/` backed up on schedule

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| **403 Forbidden** | No `index.html` in web root / wrong folder | Run Node + proxy; or upload **`public/`** contents only with `.htaccess` (API still needs Node) |
| **Failed to fetch** | Node not running or API not proxied | Start service; proxy `/api` to same origin |
| **Admin empty** | New server / empty `data/` / Vercel without Blob | Expected until first submit; on-prem check `data/` permissions; on Vercel set **`BLOB_READ_WRITE_TOKEN`** and redeploy |
| **CTA wrong URL** | Old env `CONSULTATION_URL` | Set URLs in `.env` to `web.three.com.hk` contact pages |
| **LAN device cannot open survey** | `LISTEN_HOST=127.0.0.1` or macOS firewall | Set `LISTEN_HOST=0.0.0.0` for rehearsal; allow Node incoming on `PORT` in firewall; use URL printed at startup (e.g. `http://192.168.x.x:3000`) |

---

## 13. Reference: current hosted environments

| Environment | URL | Notes |
|-------------|-----|--------|
| Vercel (dev/demo) | https://survey-taupe-three.vercel.app | Use **`BLOB_READ_WRITE_TOKEN`** for durable leads; without it, **`vercel-ephemeral`** `/tmp` only |
| Local dev / LAN rehearsal | `http://127.0.0.1:3000`, `http://<LAN-IP>:3000` | `LISTEN_HOST=0.0.0.0`; **`storageMode: file`** → `data/submissions.json` |
| On-prem / VM | `https://<IT-assigned-host>/` | **Recommended** for PDPO: JSON file + backup; **`LISTEN_HOST=127.0.0.1`** + reverse proxy; no DB required |

---

## 14. IT contact handoff (fill in)

| Role | Name | Email |
|------|------|-------|
| Application owner | | |
| Server / hosting | | |
| Security / PDPO | | |
| Sales CRM webhook | | |

---

**End of specification**
