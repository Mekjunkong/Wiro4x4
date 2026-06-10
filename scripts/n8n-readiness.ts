const defaultSiteUrl = "https://www.wiro4x4indochina.com";

function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value || value.startsWith("TODO_")) return undefined;
  return value;
}

function normalizeBaseUrl(raw: string) {
  return raw.replace(/\/+$/, "");
}

function automationSecret() {
  return env("N8N_API_SECRET") || env("N8N_WEBHOOK_SECRET");
}

async function readJsonOrText(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  if (!contentType.includes("application/json")) {
    return { contentType, text, json: null as unknown };
  }

  try {
    return { contentType, text, json: JSON.parse(text) as unknown };
  } catch {
    return { contentType, text, json: null as unknown };
  }
}

function jsonError(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const error = (payload as { error?: unknown }).error;
  return typeof error === "string" ? error : null;
}

async function checkWiroEndpoint(siteUrl: string) {
  const secret = automationSecret();
  const url = new URL("/api/n8n/operations-snapshot", siteUrl);
  const response = await fetch(url, {
    headers: secret ? { "X-Wiro-Automation-Secret": secret } : {},
  });
  const body = await readJsonOrText(response);
  const error = jsonError(body.json);

  if (response.status === 404) {
    return {
      ok: false,
      gate: "wiro-route",
      detail:
        "Production does not expose /api/n8n/operations-snapshot yet. Deploy the current Wiro build first.",
    };
  }

  if (!body.contentType.includes("application/json")) {
    return {
      ok: false,
      gate: "wiro-route",
      detail:
        "Production returned non-JSON for /api/n8n/operations-snapshot, likely the SPA fallback.",
    };
  }

  if (response.status === 503 && error === "n8n_api_secret_not_configured") {
    return {
      ok: false,
      gate: "wiro-env",
      detail:
        "Wiro n8n routes are deployed, but N8N_API_SECRET or N8N_WEBHOOK_SECRET is missing in the Wiro runtime.",
    };
  }

  if (response.status === 401) {
    return {
      ok: false,
      gate: "wiro-secret",
      detail:
        "Wiro n8n routes are deployed, but the provided N8N_API_SECRET/N8N_WEBHOOK_SECRET does not authorize the request.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      gate: "wiro-endpoint",
      detail: `Wiro n8n endpoint failed with HTTP ${response.status}.`,
    };
  }

  return {
    ok: true,
    gate: "wiro-endpoint",
    detail: "Wiro n8n operations snapshot endpoint is reachable.",
  };
}

async function checkN8nApi() {
  const apiBaseUrl = env("N8N_IMPORT_API_BASE_URL");
  const apiKey = env("N8N_IMPORT_API_KEY");
  if (!apiBaseUrl || !apiKey) {
    return {
      ok: false,
      gate: "n8n-api",
      detail:
        "N8N_IMPORT_API_BASE_URL and N8N_IMPORT_API_KEY are missing, so live workflow import/verification cannot run.",
    };
  }

  const response = await fetch(
    `${normalizeBaseUrl(apiBaseUrl)}/workflows?limit=1`,
    {
      headers: {
        accept: "application/json",
        "X-N8N-API-KEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    return {
      ok: false,
      gate: "n8n-api",
      detail: `n8n API check failed with HTTP ${response.status}.`,
    };
  }

  return {
    ok: true,
    gate: "n8n-api",
    detail: "n8n public API is reachable with the provided API key.",
  };
}

async function main() {
  const siteUrl = normalizeBaseUrl(env("WIRO_SITE_URL") || defaultSiteUrl);
  const checks = [await checkWiroEndpoint(siteUrl), await checkN8nApi()];

  for (const check of checks) {
    const label = check.ok ? "OK" : "MISSING";
    console.log(`[n8n-readiness] ${label} ${check.gate}: ${check.detail}`);
  }

  if (checks.some(check => !check.ok)) {
    console.error(
      "[n8n-readiness] Live n8n automation is not complete yet. Fix the missing gates above, then run npm run n8n:import, npm run n8n:verify-live, and npm run n8n:smoke."
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    "[n8n-readiness] Live prerequisites are present. Continue with import, live verify, and smoke test."
  );
}

main().catch(err => {
  console.error("[n8n-readiness] Failed", err);
  process.exitCode = 1;
});
