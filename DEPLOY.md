# Fixing “403 Forbidden” on hosting

That message is from **Apache/IIS**, not from this app’s Node code. It usually means the server **refuses to show the folder** you pointed the URL at.

## Most common causes

| Cause | Fix |
|--------|-----|
| **`index.html` not in the web root** | Upload the **contents** of `public/` into `public_html` / `wwwroot` / `htdocs` so **`index.html` sits directly in that folder** — not `public_html/3business-Survey/public/index.html`. |
| **Uploaded the repo root** | There is **no** `index.html` at project root — only `public/index.html`. Either change the host’s document root to `public/`, or copy everything inside `public/` to the web root. |
| **File permissions (Linux)** | Folders **755**, files **644** for `index.html`, `app.js`, `styles.css`, `assets/*`. |
| **Only static upload, no Node** | HTML may load, but **`/api/*` will fail** unless Node runs somewhere. Full survey needs **`npm start`** (or Docker) + reverse proxy. |
| **Browsing `/server` or `/data`** | Those must **not** be web-accessible. Only deploy `public/` to the web root; run API separately. |

## Recommended: Node + reverse proxy (production)

1. Upload the **whole project** (not `node_modules`; run `npm ci --omit=dev` on the server).
2. Set env vars (`ADMIN_KEY`, `CONSULTATION_URL`, etc.).
3. Run: `npm start` (port 3000) under **systemd** or **PM2**.
4. Point Nginx/Apache at the app:

```nginx
location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Document root should **not** be used for static-only upload in this mode — the Node app serves `public/`.

## Static-only (HTML preview only — no scoring/submit)

Upload **only** these into the web root:

- `index.html`
- `app.js`
- `scoring-client.js`
- `config.bilingual.json` (run `npm run prestart` locally before upload, or copy from repo)
- `styles.css`
- `assets/`
- `.htaccess` (Apache)

Submit and results **will not work** without `/api/submit` on the same origin (or a code change to point to another API URL).

## Quick check after upload

Open: `https://your-domain/index.html`  
If that works but `https://your-domain/` is 403, set **DirectoryIndex index.html** (included in `public/.htaccess` and repo root `.htaccess`).

## Which `index.html`?

| File | Use when |
|------|----------|
| **`public/index.html`** | **Recommended** — copy everything in `public/` to the web root (`index.html`, `app.js`, `styles.css`, `assets/`, `.htaccess`). |
| **Repo root `index.html`** | You uploaded the **whole repo** to the host; it loads assets from `public/…` (still needs Node for `/api`). |
| **`public/kickstart.html`** | Optional redirect helper → `index.html`. |
