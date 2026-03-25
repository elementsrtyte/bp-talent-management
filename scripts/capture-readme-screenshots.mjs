import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "docs", "screenshots");

async function waitForOk(url, ms = 30000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

const vite = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173"], {
  cwd: root,
  stdio: "pipe",
});

let exitCode = 1;
try {
  await waitForOk("http://127.0.0.1:4173/");
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(outDir, "roster-table.png"),
  });
  await page.getByRole("button", { name: /^View / }).first().click();
  await page.getByRole("dialog").waitFor({ state: "visible" });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(outDir, "talent-detail.png"),
  });
  await browser.close();
  exitCode = 0;
} finally {
  vite.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 400));
}

process.exit(exitCode);
