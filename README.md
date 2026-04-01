# Blueprint — Talent roster

Internal web app to browse, filter, and sort the contractor talent roster. Data loads from a static JSON file in `public/` (array of row objects keyed by column name).

## Screenshots

**Roster** — filters, sort, and table (dark theme).

![Roster table with filters](docs/screenshots/roster-table.png)

**Detail** — row opens a sheet with profile fields and job history.

![Talent detail sheet](docs/screenshots/talent-detail.png)

To regenerate these images after UI changes, install the Playwright browser once (`npx playwright install chromium`), then run `npm run capture:readme`. That build sets `VITE_SCREENGRAB_PRIVACY=true` so **surnames are blurred** in the capture (first name stays readable). Normal `npm run dev` / production builds do not set this.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

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

Static output is in `dist/` — suitable for any static host (S3, Netlify, Vercel, etc.).

## Branding & fonts

Visual design follows Blueprint tokens (dark-first, purple / teal accents, Saans). Saans is loaded from a third-party CDN (`fonts.cdnfonts.com`), same approach as the marketing landing page. Full notes live in [docs/brand-guidelines.md](docs/brand-guidelines.md).

## Supabase: sign-in, comments, resumes

With `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set (see [.env.example](.env.example)), users authenticate via Supabase. The talent detail sheet includes **internal notes** (`talent_comments`) and **resume uploads** (private `resumes` storage bucket + `talent_resumes` metadata).

If you are locked out locally (e.g. email rate limits), you may set **`VITE_BYPASS_AUTH=true`** in `.env.local` temporarily to load the roster without signing in. Remove it once you can authenticate again; Supabase-backed comments and resumes still require a real session.

Apply the database migration once (SQL Editor in the Supabase dashboard, or `supabase db push` if you use the CLI):

- [supabase/migrations/20260331120000_talent_comments_and_resumes.sql](supabase/migrations/20260331120000_talent_comments_and_resumes.sql)

People are keyed by a stable `talent_key` derived in the app (email when present; otherwise name + LinkedIn). Rows are linked to that key so notes and files survive roster refreshes.

## Future: parsed skills from resumes

The `Talent` type still has optional `resumeFileId`, `parsedSkills`, and `lastParsedAt` for a possible future extraction pipeline (not implemented yet).
