import { existsSync, readFileSync } from "fs";
import { workflowPaths } from "./n8n-workflow-manifest";

const wiroEnvKeys = [
  "N8N_AUTOMATION_ENABLED",
  "N8N_WEBHOOK_URL",
  "N8N_WEBHOOK_SECRET",
  "N8N_API_SECRET",
];

const n8nEnvKeys = [
  "WIRO_SITE_URL",
  "WIRO_N8N_SHARED_SECRET",
  "WIRO_N8N_API_SECRET",
];

const ownerEmailNotificationKeys = ["OWNER_EMAIL", "RESEND_API_KEY"];
const ownerTelegramNotificationKeys = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
];
const customerEmailKeys = ["RESEND_API_KEY"];

const n8nApiKeys = ["N8N_IMPORT_API_BASE_URL", "N8N_IMPORT_API_KEY"];

const envFiles = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.n8n",
  ".env.n8n.local",
];

function parseEnvValues(path: string) {
  const values = new Map<string, string>();
  if (!existsSync(path)) return values;
  const content = readFileSync(path, "utf8");
  for (const match of content.matchAll(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/gm)) {
    values.set(match[1], match[2].trim());
  }
  return values;
}

function hasProcessValue(key: string) {
  const value = process.env[key]?.trim();
  return Boolean(value && !value.startsWith("TODO_"));
}

function hasConfiguredValue(key: string, envValues: Map<string, string>) {
  const value = envValues.get(key)?.trim();
  return hasProcessValue(key) || Boolean(value && !value.startsWith("TODO_"));
}

function assertJsonFile(path: string) {
  if (!existsSync(path)) {
    throw new Error(`${path} is missing`);
  }
  JSON.parse(readFileSync(path, "utf8"));
}

function listFoundKeys(targetKeys: string[], sourceKeys: Set<string>) {
  return targetKeys.filter(key => sourceKeys.has(key));
}

function main() {
  const missing: string[] = [];
  const configuredEnvValues = new Map<string, string>();

  for (const workflowPath of workflowPaths) {
    assertJsonFile(workflowPath);
  }
  console.log("[n8n-doctor] Workflow exports parse OK", workflowPaths);

  for (const envFile of envFiles) {
    const values = parseEnvValues(envFile);
    if (values.size === 0) {
      console.log(`[n8n-doctor] ${envFile}: missing or no keys`);
      continue;
    }
    for (const [key, value] of values) {
      if (value) configuredEnvValues.set(key, value);
    }
    const found = listFoundKeys(
      [
        ...wiroEnvKeys,
        ...n8nEnvKeys,
        ...ownerEmailNotificationKeys,
        ...ownerTelegramNotificationKeys,
        ...n8nApiKeys,
      ],
      new Set(values.keys())
    );
    console.log(
      `[n8n-doctor] ${envFile}: ${
        found.length ? found.join(", ") : "no n8n keys"
      }`
    );
  }

  for (const key of wiroEnvKeys) {
    if (!hasConfiguredValue(key, configuredEnvValues)) missing.push(key);
  }

  const n8nRuntimeMissing = n8nEnvKeys.filter(
    key => !hasConfiguredValue(key, configuredEnvValues)
  );
  if (n8nRuntimeMissing.length > 0) {
    console.log(
      "[n8n-doctor] n8n runtime keys to set in n8n:",
      n8nRuntimeMissing
    );
  }

  const hasOwnerEmailNotifications = ownerEmailNotificationKeys.every(key =>
    hasConfiguredValue(key, configuredEnvValues)
  );
  const hasOwnerTelegramNotifications = ownerTelegramNotificationKeys.every(
    key => hasConfiguredValue(key, configuredEnvValues)
  );
  if (!hasOwnerEmailNotifications && !hasOwnerTelegramNotifications) {
    console.log(
      "[n8n-doctor] owner notification keys missing for ops.notify delivery: set OWNER_EMAIL plus RESEND_API_KEY, or TELEGRAM_BOT_TOKEN plus TELEGRAM_CHAT_ID"
    );
  }

  const customerEmailMissing = customerEmailKeys.filter(
    key => !hasConfiguredValue(key, configuredEnvValues)
  );
  if (customerEmailMissing.length > 0) {
    console.log(
      "[n8n-doctor] Wiro newsletter email keys missing; booking reminders and abandoned recovery can fall back to WhatsApp when phone numbers are present:",
      customerEmailMissing
    );
  }

  const importMissing = n8nApiKeys.filter(
    key => !hasConfiguredValue(key, configuredEnvValues)
  );
  if (importMissing.length > 0) {
    console.log(
      "[n8n-doctor] optional n8n API keys missing for npm run n8n:import and npm run n8n:verify-live:",
      importMissing
    );
  }

  if (missing.length > 0) {
    console.error("[n8n-doctor] Wiro runtime env missing:", missing);
    console.error(
      "[n8n-doctor] Run npm run n8n:secrets to generate matching env values, then set these before npm run n8n:smoke."
    );
    process.exitCode = 1;
    return;
  }

  console.log("[n8n-doctor] Wiro runtime env is ready for npm run n8n:smoke");
}

main();
