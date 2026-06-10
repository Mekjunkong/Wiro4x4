import { readImportableWorkflow, workflowPaths } from "./n8n-workflow-manifest";

type WorkflowListItem = {
  id: string;
  name: string;
};

type WorkflowListResponse = {
  data?: WorkflowListItem[];
};

function requiredEnv(key: string) {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function normalizeApiBaseUrl(raw: string) {
  return raw.replace(/\/+$/, "");
}

function inlineWiroRuntimeValues(
  workflow: ReturnType<typeof readImportableWorkflow>
) {
  if (process.env.N8N_IMPORT_INLINE_WIRO_ENV !== "true") return workflow;

  const siteUrl = requiredEnv("WIRO_SITE_URL").replace(/\/+$/, "");
  const apiSecret = requiredEnv("WIRO_N8N_API_SECRET");
  const sharedSecret = requiredEnv("WIRO_N8N_SHARED_SECRET");

  const replaceValue = (value: unknown): unknown => {
    if (typeof value === "string") {
      if (value === "={{ $env.WIRO_N8N_API_SECRET }}") return apiSecret;
      if (value === "={{ $env.WIRO_N8N_SHARED_SECRET }}") return sharedSecret;
      if (value.startsWith("={{ $env.WIRO_SITE_URL }}")) {
        return `${siteUrl}${value.slice("={{ $env.WIRO_SITE_URL }}".length)}`;
      }
      return value;
    }

    if (Array.isArray(value)) return value.map(replaceValue);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [key, replaceValue(entry)])
      );
    }

    return value;
  };

  return replaceValue(workflow) as typeof workflow;
}

async function n8nFetch<T>(
  apiBaseUrl: string,
  apiKey: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-N8N-API-KEY": apiKey,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${path} failed: ${response.status} ${await response.text()}`
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function listWorkflows(apiBaseUrl: string, apiKey: string) {
  const result = await n8nFetch<WorkflowListResponse>(
    apiBaseUrl,
    apiKey,
    "/workflows?limit=250"
  );
  return result.data ?? [];
}

async function main() {
  const apiBaseUrl = normalizeApiBaseUrl(
    requiredEnv("N8N_IMPORT_API_BASE_URL")
  );
  const apiKey = requiredEnv("N8N_IMPORT_API_KEY");
  const apply = process.env.N8N_IMPORT_APPLY === "true";
  const activate = process.env.N8N_IMPORT_ACTIVATE === "true";
  const existing = await listWorkflows(apiBaseUrl, apiKey);

  for (const workflowPath of workflowPaths) {
    const workflow = inlineWiroRuntimeValues(
      readImportableWorkflow(workflowPath)
    );
    const match = existing.find(item => item.name === workflow.name);

    if (!apply) {
      console.log("[n8n-import] dry-run", {
        workflow: workflow.name,
        action: match ? "update" : "create",
      });
      continue;
    }

    const saved = match
      ? await n8nFetch<WorkflowListItem>(
          apiBaseUrl,
          apiKey,
          `/workflows/${encodeURIComponent(match.id)}`,
          { method: "PUT", body: JSON.stringify(workflow) }
        )
      : await n8nFetch<WorkflowListItem>(apiBaseUrl, apiKey, "/workflows", {
          method: "POST",
          body: JSON.stringify(workflow),
        });

    console.log("[n8n-import] saved", {
      workflow: workflow.name,
      id: saved.id,
      action: match ? "updated" : "created",
    });

    if (activate) {
      await n8nFetch(
        apiBaseUrl,
        apiKey,
        `/workflows/${encodeURIComponent(saved.id)}/activate`,
        { method: "POST" }
      );
      console.log("[n8n-import] activated", {
        workflow: workflow.name,
        id: saved.id,
      });
    }
  }
}

main().catch(err => {
  console.error("[n8n-import] Failed", err);
  process.exitCode = 1;
});
