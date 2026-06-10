import { randomBytes } from "crypto";

function randomSecret() {
  return randomBytes(32).toString("base64url");
}

function env(key: string, fallback: string) {
  return process.env[key]?.trim() || fallback;
}

const n8nHost = env("N8N_HOSTNAME", "n8n.example.com");
const siteUrl = env("WIRO_SITE_URL", "https://www.wiro4x4indochina.com");
const n8nBaseUrl = env("N8N_PUBLIC_URL", `https://${n8nHost}`);
const webhookSecret = randomSecret();
const apiSecret = randomSecret();
const n8nEncryptionKey = randomSecret();
const n8nPostgresPassword = randomSecret();

console.log(`# Generated at ${new Date().toISOString()}`);
console.log("# Copy the Wiro block into the Wiro app environment.");
console.log("# Copy the n8n block into the n8n environment.");
console.log("# Do not commit these values.\n");

console.log("# Wiro app env");
console.log("N8N_AUTOMATION_ENABLED=true");
console.log(`N8N_WEBHOOK_URL=${n8nBaseUrl}/webhook/wiro-automation`);
console.log(`N8N_WEBHOOK_SECRET=${webhookSecret}`);
console.log(`N8N_API_SECRET=${apiSecret}`);
console.log("N8N_WEBHOOK_TIMEOUT_MS=5000");
console.log("RESEND_API_KEY=replace-with-live-resend-key");
console.log("");

console.log("# n8n env");
console.log(`WIRO_SITE_URL=${siteUrl}`);
console.log(`WIRO_N8N_SHARED_SECRET=${webhookSecret}`);
console.log(`WIRO_N8N_API_SECRET=${apiSecret}`);
console.log(`N8N_HOST=${n8nHost}`);
console.log("N8N_PROTOCOL=https");
console.log(`N8N_PUBLIC_WEBHOOK_URL=${n8nBaseUrl}/`);
console.log(`N8N_ENCRYPTION_KEY=${n8nEncryptionKey}`);
console.log(`N8N_POSTGRES_PASSWORD=${n8nPostgresPassword}`);
console.log("");

console.log("# Optional workflow import env");
console.log(`N8N_IMPORT_API_BASE_URL=${n8nBaseUrl}/api/v1`);
console.log("N8N_IMPORT_API_KEY=replace-with-api-key-created-in-n8n");
