const REQUIRED_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
  "OWNER_EMAIL",
] as const;

for (const varName of REQUIRED_VARS) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

export const ENV = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  r2AccountId: process.env.R2_ACCOUNT_ID!,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID!,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  r2BucketName: process.env.R2_BUCKET_NAME!,
  r2PublicUrl: process.env.R2_PUBLIC_URL!,
  ownerEmail: process.env.OWNER_EMAIL!,
  isProduction: process.env.NODE_ENV === "production",
  // Lazy-init services (optional)
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
};
