#!/usr/bin/env node
/**
 * Post-deploy smoke test for the live site (run by
 * .github/workflows/post-deploy-smoke.yml after every production deploy, or
 * by hand: `node scripts/smoke-live.mjs [baseUrl]`).
 *
 * Read-only: the one POST sends an invalid email, which the API must reject
 * with a validation error before anything is written. Each check targets a
 * failure we have actually shipped: forms refusing writes (Sep 2026 outage),
 * React's development bundle, stack traces in API errors, and crawler HTML.
 */

const BASE = (process.argv[2] || process.env.SMOKE_BASE_URL || "https://www.wiro4x4indochina.com").replace(/\/$/, "");
const ATTEMPTS = Number(process.env.SMOKE_ATTEMPTS || 3);
const RETRY_MS = Number(process.env.SMOKE_RETRY_MS || 20000);

const PAGES = [
  "/",
  "/tours",
  "/tours/doi-inthanon-roof-of-thailand",
  "/book",
  "/plan-trip",
  "/sitemap.xml",
  "/robots.txt",
];

async function get(path, init) {
  const res = await fetch(BASE + path, { redirect: "manual", ...init });
  return { status: res.status, text: await res.text() };
}

const checks = [
  ...PAGES.map(path => ({
    name: `${path} returns 200`,
    run: async () => {
      const { status } = await get(path);
      if (status !== 200) throw new Error(`status ${status}`);
    },
  })),
  {
    name: "production React bundle (no jsxDEV)",
    run: async () => {
      const { text } = await get("/");
      const src = text.match(/src="(\/assets\/js\/index-[^"]+\.js)"/)?.[1];
      if (!src) throw new Error("entry script not found in HTML");
      const js = await get(src);
      if (js.text.includes("jsxDEV")) throw new Error(`${src} is a development build`);
    },
  },
  {
    name: "crawler HTML carries tour content",
    run: async () => {
      const { text } = await get("/tours/doi-inthanon-roof-of-thailand");
      if (!text.includes("The day, hour by hour")) throw new Error("itinerary missing from server HTML");
    },
  },
  {
    name: "forms accept input (invalid email → validation error, no stack)",
    run: async () => {
      const { status, text } = await get("/api/trpc/newsletter.subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ json: { email: "smoke-test-not-an-email" } }),
      });
      if (status !== 400) throw new Error(`expected 400 validation error, got ${status}: ${text.slice(0, 160)}`);
      if (text.includes("Blocked:")) throw new Error("write guard is blocking production writes");
      if (text.includes('"stack"')) throw new Error("API error response exposes a stack trace");
    },
  },
  {
    // blog.list is DB-backed and non-empty. (tour.list is not used: the live
    // tours table is empty and pages run on the shared/wiroTourCatalog fallback.)
    name: "database reachable (blog.list returns posts)",
    run: async () => {
      const { status, text } = await get("/api/trpc/blog.list");
      if (status !== 200) throw new Error(`status ${status}`);
      const posts = JSON.parse(text)?.result?.data?.json;
      if (!Array.isArray(posts) || posts.length === 0) throw new Error("no posts: database unreachable or empty");
    },
  },
];

async function runOnce() {
  const failures = [];
  for (const check of checks) {
    try {
      await check.run();
      console.log(`  ok    ${check.name}`);
    } catch (error) {
      console.log(`  FAIL  ${check.name}: ${error.message}`);
      failures.push(`${check.name}: ${error.message}`);
    }
  }
  return failures;
}

let failures = [];
for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  console.log(`Smoke test ${BASE} (attempt ${attempt}/${ATTEMPTS})`);
  failures = await runOnce();
  if (!failures.length) break;
  // The domain can take a moment to switch to the new deployment.
  if (attempt < ATTEMPTS) await new Promise(r => setTimeout(r, RETRY_MS));
}

if (failures.length) {
  console.log(`\n${failures.length} check(s) failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("\nAll smoke checks passed.");
