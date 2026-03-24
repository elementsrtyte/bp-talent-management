# Blueprint — Talent roster

Internal web app to browse, filter, and sort the contractor talent roster. Data loads from a static CSV in `public/` (export from Google Sheets or your source of truth).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Update roster data

1. Export your sheet as CSV with the same column headers as the current template (see `public/roster.csv`).
2. Replace `public/roster.csv` with the new file (keep the filename `roster.csv` or change the path in `src/App.tsx` where `loadRosterFromUrl` is called).
3. Refresh the browser.

Quoted fields and embedded JSON in **Job History JSON** are handled by [Papa Parse](https://www.papaparse.com/).

## Build

```bash
npm run build
npm run preview
```

Static output is in `dist/` — suitable for any static host (S3, Netlify, Vercel, etc.).

## Branding & fonts

Visual design follows Blueprint tokens (dark-first, purple / teal accents, Saans). Saans is loaded from a third-party CDN (`fonts.cdnfonts.com`), same approach as the marketing landing page. Full notes live in [docs/brand-guidelines.md](docs/brand-guidelines.md).

## Future: resumes & parsed skills

The `Talent` type includes optional `resumeFileId`, `parsedSkills`, and `lastParsedAt` for a future upload + extraction flow. The detail panel includes a disabled “Upload resume” stub until that ships.
