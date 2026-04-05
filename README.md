# Blueprint — Talent roster

Internal web app to browse, filter, and sort the contractor talent roster. Data loads from a static JSON file in `public/` (array of row objects keyed by column name).

## Screenshots

**Roster** — filters, sort, and table (dark theme).

![Roster table with filters](docs/screenshots/roster-table.png)

**Detail** — row opens a sheet with profile fields and job history.

![Talent detail sheet](docs/screenshots/talent-detail.png)

To regenerate these images after UI changes, install the Playwright browser once (`npx playwright install chromium`), then run `npm run capture:readme`. That build sets `VITE_SCREENGRAB_PRIVACY=true` so **surnames are blurred** in the capture (first name stays readable). Normal `npm run dev` / production builds do not set this.

## Run locally

### Roster only (no Supabase / no API)

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically [http://localhost:5173](http://localhost:5173)). The app reads `public/roster.json` or cached n8n data; sign-in and notes/resumes stay hidden without Supabase env vars.

### Full stack: UI + API (comments & resumes)

Comments and resume uploads call a small **Node API** in [`api/`](api/), not Postgres or Storage from the browser. The API validates the Supabase session (`Authorization: Bearer …`) and uses the **service role** key server-side.

1. Install dependencies **twice** (root SPA + API are separate packages):

   ```bash
   npm install
   npm install --prefix api
   ```

2. Copy [.env.example](.env.example) to `.env.local` (or `.env`) and set at least `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL` (same URL as the `VITE_` project URL), and **`SUPABASE_SERVICE_ROLE_KEY`** (Dashboard → Settings → API → *service_role* — never commit it or prefix it with `VITE_`).

3. Run **two** processes:

   ```bash
   npm run dev:api    # Express on http://127.0.0.1:3001
   npm run dev        # Vite — proxies /api → that server
   ```

   Open [http://localhost:5173](http://localhost:5173). Leave `VITE_API_URL` unset so the UI uses same-origin `/api` (the Vite dev proxy rewrites it to port 3001).

Optional: install API deps with `cd api && npm install` if you prefer; then `npm run dev` from `api/` instead of `npm run dev:api` from the repo root.

## Update roster data

### Live refresh (n8n)

The header **Refresh** button calls your n8n webhook (default URL in [src/config/rosterWebhook.ts](src/config/rosterWebhook.ts)), stores the response in **localStorage**, and shows **Last updated** with the fetch time. Requests use `cache: no-store` so the browser does not serve a stale response.

Override the URL without editing code:

```bash
# .env.local
VITE_N8N_ROSTER_WEBHOOK=https://your-instance.app.n8n.cloud/webhook/...
```

The webhook should return JSON: a **array of row objects**, a **single row object** (one person), or an object with an array under `data`, `rows`, `roster`, `items`, or `results`. Each row must match the field names in [src/lib/rosterColumns.ts](src/lib/rosterColumns.ts).

### Bundled fallback

If there is **no** cached webhook payload yet, the app loads `public/roster.json` once. Replace that file to ship a default roster with the build.

`Desired Salary` may be a string (`$50.00`) or a number (`50`). **Job History JSON** may be a string of JSON or an already-parsed array.

The **Skills** column, skill filters, and search use **`Augmented Skillsets`** (comma-separated). The legacy **`Skillset(s)`** column is not read by the app.

## Build

```bash
npm run build
npm run preview
```

Output is in `dist/`. **`npm run preview`** serves that folder on a local URL; API routes under `/api` are **not** wired in preview the way they are in `npm run dev`, so comments/resumes need the API running separately (for example with **`VITE_API_URL`** pointing at it if it is not same-origin) or stick to **`npm run dev`** for full-stack local testing.

For a **static host only** (S3, Netlify, Vercel, etc.), deploy the `dist/` assets *and* run the [`api/`](api/) service somewhere with HTTPS, then set **`VITE_API_URL`** to that API’s public origin (no trailing slash) at build time so the browser can reach it with CORS.

## Branding & fonts

Visual design follows Blueprint tokens (dark-first, purple / teal accents, Saans). Saans is loaded from a third-party CDN (`fonts.cdnfonts.com`), same approach as the marketing landing page. Full notes live in [docs/brand-guidelines.md](docs/brand-guidelines.md).

## Supabase: sign-in, comments, resumes

With `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set (see [.env.example](.env.example)), users authenticate in the browser via Supabase. The talent detail sheet includes **internal notes** and **resume uploads**; those features call the **backend API**, which reads and writes **`talent_comments`**, **`talent_resumes`**, and the private **`resumes`** storage bucket using the service role. Configure that with the **Full stack** flow under [Run locally](#run-locally).

If you are locked out locally (e.g. email rate limits), you may set **`VITE_BYPASS_AUTH=true`** in `.env.local` temporarily to load the roster without signing in. Remove it once you can authenticate again; comments and resumes still need a real session and a running API.

Apply the database migration once (SQL Editor in the Supabase dashboard, or `supabase db push` if you use the CLI):

- [supabase/migrations/20260331120000_talent_comments_and_resumes.sql](supabase/migrations/20260331120000_talent_comments_and_resumes.sql)

People are keyed by a stable `talent_key` derived in the app (email when present; otherwise name + LinkedIn). Rows are linked to that key so notes and files survive roster refreshes.

## Future: parsed skills from resumes

The `Talent` type still has optional `resumeFileId`, `parsedSkills`, and `lastParsedAt` for a possible future extraction pipeline (not implemented yet).
