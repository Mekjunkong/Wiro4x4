# Manus to Vercel Migration - Design Specification

**Date:** 2026-03-15
**Project:** Wiro 4x4 Kosher Off-Road Tours
**Goal:** Migrate from Manus platform to Vercel + self-hosted services
**Approach:** Minimal Surgery (replace only Manus dependencies, keep existing architecture)
**Target Cost:** $1-2/month (from Manus hosting fees)

---

## Executive Summary

This migration replaces all Manus platform dependencies while preserving the existing Express + tRPC + React architecture. The approach minimizes code changes (~300 lines modified, ~150 deleted) and enables a fast, low-risk cutover to Vercel hosting with PlanetScale (MySQL), Cloudflare R2 (storage), and OpenAI (LLM).

**Timeline:** 2-3 days implementation + testing
**Risk Level:** Low (most application logic unchanged)
**Rollback Plan:** Keep Manus deployment live until Vercel is verified working

---

## Current Architecture (Manus Platform)

```
┌─────────────────┐
│  Vite Frontend  │  React 19 + Tailwind CSS 4
│  (Static SPA)   │  → Calls tRPC API
└─────────────────┘
         ↓
┌─────────────────┐
│  Express Server │  Node.js + tRPC 11
│  + tRPC Router  │  → Depends on Manus _core services
└─────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│  Manus Platform Services (Black Box):       │
│  • OAuth (login/sessions via openId)        │
│  • Storage Proxy (S3-compatible uploads)    │
│  • LLM Proxy (Gemini 2.5 Flash)            │
│  • Notification Service (owner alerts)      │
│  • Image Generation (not actively used)     │
└─────────────────────────────────────────────┘
         ↓
┌─────────────────┐
│  TiDB/MySQL     │  Manus-managed database
│  (via Drizzle)  │  11 tables, ~200 procedures
└─────────────────┘
```

**Manus Dependencies:**

- `server/_core/oauth.ts` - OAuth callback handler
- `server/_core/sdk.ts` - Manus SDK client
- `server/_core/llm.ts` - LLM proxy wrapper
- `server/_core/notification.ts` - Owner notification service
- `server/_core/imageGeneration.ts` - Image generation service
- `server/storage.ts` - S3 storage proxy
- Environment variables: 14 Manus-specific vars

---

## Target Architecture (Vercel + Self-Hosted)

```
┌──────────────────────────────────────────┐
│           Vercel Edge Network            │
│  ┌────────────────┐  ┌────────────────┐ │
│  │  Static Files  │  │  API Function  │ │
│  │  dist/public/  │  │  dist/index.js │ │
│  │  (Vite build)  │  │  (Express)     │ │
│  └────────────────┘  └────────────────┘ │
└──────────────────────────────────────────┘
         ↓                      ↓
    ┌─────────┐         ┌──────────────────┐
    │   R2    │         │  Direct APIs:    │
    │  (CDN)  │         │  • JWT auth      │
    │ Images  │         │  • OpenAI API    │
    └─────────┘         │  • Resend Email  │
                        └──────────────────┘
                               ↓
                     ┌──────────────────┐
                     │  PlanetScale     │
                     │  (MySQL)         │
                     │  Same schema     │
                     └──────────────────┘
```

**New Stack:**

- **Hosting:** Vercel (Edge + Serverless Functions)
- **Database:** PlanetScale (serverless MySQL, free tier)
- **Storage:** Cloudflare R2 (S3-compatible, zero egress fees)
- **Auth:** Email/password + JWT (using `jose` library)
- **LLM:** OpenAI GPT-4o-mini ($0.15/1M tokens)
- **Email:** Resend (already configured)
- **No changes:** Express, tRPC, React, Drizzle ORM

---

## Component Changes

### 1. Authentication System

**Current (Manus OAuth):**

- Login redirects to `VITE_OAUTH_PORTAL_URL`
- OAuth callback exchanges code for token via `sdk.exchangeCodeForToken()`
- Session token created via `sdk.createSessionToken(openId)`
- User identified by `openId` (Manus unique identifier)

**New (Email/Password + JWT):**

- Login form on frontend (email + password inputs)
- Backend validates credentials, issues JWT
- Session stored in `__session` cookie (HttpOnly, Secure, SameSite=Lax)
- User identified by `email` (unique constraint)

**Database Schema Changes:**

```typescript
// drizzle/schema.ts
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),

  // REMOVE these fields:
  // openId: varchar("openId", { length: 64 }).notNull().unique(),
  // loginMethod: varchar("loginMethod", { length: 64 }),

  // ADD these fields:
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 60 }).notNull(), // bcrypt hash

  // KEEP unchanged:
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin", "owner", "manager", "agent"])
    .default("user")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ADD new table for password reset tokens (separate table for cleaner separation)
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

**New Auth Module** (`server/auth.ts`):

```typescript
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(
  userId: number,
  email: string,
  role: string
) {
  const token = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
  return token;
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number; email: string; role: string };
  } catch {
    return null;
  }
}
```

**Auth Routes** (replace `server/_core/oauth.ts`):

**1. POST /api/auth/register**

```typescript
// Input schema (Zod)
const registerInput = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255).optional(),
});

// Response
{ token: string, user: { id, email, name, role } }

// Error cases:
// - 400: Email already exists
// - 400: Password too weak (< 8 chars)
// - 500: Database error
```

**2. POST /api/auth/login**

```typescript
// Input schema
const loginInput = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Response
{ token: string, user: { id, email, name, role } }

// Sets httpOnly cookie: `session=${token}; Max-Age=2592000; Path=/; Secure; SameSite=Strict`

// Error cases:
// - 401: Invalid credentials (email not found OR password mismatch)
// - 500: Database error
```

**3. POST /api/auth/logout**

```typescript
// No input
// Response: { success: true }
// Clears session cookie: `session=; Max-Age=0; Path=/`
```

**4. POST /api/auth/forgot-password**

```typescript
// Input schema
const forgotPasswordInput = z.object({
  email: z.string().email(),
});

// Response: { success: true } (always, even if email doesn't exist — prevents enumeration)

// Implementation:
// 1. Check if user exists
// 2. Generate reset token (crypto.randomBytes(32).toString('hex'))
// 3. Store in new `passwordResetTokens` table with 1-hour expiry
// 4. Send email via Resend with reset link: https://wiro4x4indochina.com/reset-password?token=XYZ

// Schema for passwordResetTokens table:
// - id (auto-increment)
// - userId (FK to users)
// - token (varchar 64, indexed)
// - expiresAt (datetime)
// - createdAt (datetime)
```

**5. POST /api/auth/reset-password**

```typescript
// Input schema
const resetPasswordInput = z.object({
  token: z.string().length(64),
  newPassword: z.string().min(8).max(128),
});

// Response: { success: true }

// Implementation:
// 1. Find token in passwordResetTokens table
// 2. Check expiry (< 1 hour old)
// 3. Update user.passwordHash
// 4. Delete used token
// 5. Invalidate all existing sessions (optional — or force re-login)

// Error cases (use generic messages to prevent enumeration):
// - 400: "Reset failed. Please request a new password reset link." (for expired/invalid token)
// - 400: "Password must be at least 8 characters" (for password validation)
// - 500: "An error occurred. Please try again later." (for database errors)
```

**6. GET /api/auth/me**

- Already exists via tRPC `auth.me` procedure
- No changes needed (returns user from JWT context)

**Context Middleware Update** (`server/_core/context.ts`):

```typescript
// OLD: Parse Manus session token
const session = await sdk.verifySessionToken(cookieValue);

// NEW: Parse JWT session token with error handling
const payload = await verifySession(cookieValue);
if (payload) {
  try {
    const user = await db.getUserById(payload.userId);

    // Error case 1: User deleted after token issued
    if (!user) {
      return { user: null }; // Force re-login
    }

    // Error case 2: Role changed since token issued
    // (Token has stale role, but this is acceptable — role checks happen server-side)
    // Users will see updated role on next login

    return { user };
  } catch (err) {
    // Database error — return null user (public context)
    console.error("Context middleware DB error:", err);
    return { user: null };
  }
}

// Invalid/expired token handled by verifySession returning null
return { user: null };
```

**Frontend Changes:**

- Remove Manus login portal URL
- Add `LoginForm.tsx` component (email + password)
- Add `RegisterForm.tsx` component
- Add `ForgotPasswordForm.tsx` component
- Update `const.ts` to remove Manus URLs
- `useAuth` hook stays unchanged (still calls `trpc.auth.me`)

**Migration Strategy for Existing Users:**

**Chosen Approach: Fresh Start (Minimal Complexity)**

1. Existing users table will be wiped during migration (reset to empty)
2. Admin account will be manually created via migration script:
   ```bash
   npx tsx scripts/create-admin.ts
   # Prompts for email + password, creates admin role user
   ```
3. New users register via `/register` page
4. **Rationale:** MVP stage, likely <10 active users, simpler than preserving OpenID accounts. No password reset emails to coordinate, no partial migration state.

---

### 2. Database Configuration

**Current (Manus TiDB):**

```bash
DATABASE_URL=mysql://auto-injected-by-manus
```

**New (PlanetScale):**

```bash
DATABASE_URL=mysql://user:password@aws.connect.psdb.cloud/wiro?ssl={"rejectUnauthorized":true}
```

**Changes Required:**

- Update `.env` with PlanetScale connection string
- **No code changes** - Drizzle ORM works identically
- Run schema migration: `pnpm db:push`
- Verify tables created: 11 tables (users, bookings, agents, leads, financialRecords, galleryPhotos, reviews, payments, tours, blogPosts, subscribers)

**Data Migration:**

1. Export from Manus:

   ```bash
   mysqldump -h <manus-host> -u <user> -p wiro \
     --no-tablespaces \
     --single-transaction \
     --quick \
     --lock-tables=false \
     > backup.sql
   ```

2. Import to PlanetScale:

   ```bash
   # Install PlanetScale CLI
   brew install planetscale/tap/pscale

   # Authenticate
   pscale auth login

   # Create database
   pscale database create wiro --region us-east

   # Create branch for schema import
   pscale branch create wiro import-branch

   # Get connection string for import-branch
   pscale connect wiro import-branch --port 3309

   # Import via mysql client (in separate terminal)
   mysql --host=127.0.0.1 \
     --port=3309 \
     --user=root \
     --database=wiro \
     < backup.sql

   # Create deploy request to merge schema changes to main
   pscale deploy-request create wiro import-branch --into main

   # Review and deploy
   pscale deploy-request deploy wiro <number>
   ```

   **PlanetScale Constraints:**
   - No foreign key constraints (uses Vitess) — FK columns work, but NOT enforced at DB level
   - Schema changes must go through branch workflow (can't ALTER tables on main branch)
   - Large data imports may timeout — consider splitting into smaller batches

3. Verify row counts match (see Migration Verification section below)

**PlanetScale Free Tier Limits:**

- 5 GB storage
- 1 billion row reads/month
- 10 million row writes/month
- Expected usage: ~500 MB data, ~10K reads/day → well within limits

---

### 3. Storage System (Cloudflare R2)

**Current (Manus Storage Proxy):**

```typescript
// server/storage.ts
const { baseUrl, apiKey } = getStorageConfig(); // Manus endpoints
const uploadUrl = new URL("v1/storage/upload", baseUrl);
const response = await fetch(uploadUrl, {
  headers: { Authorization: `Bearer ${apiKey}` },
  body: formData,
});
```

**New (Direct R2 Access):**

```typescript
// server/storage.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );

  const url = `${process.env.R2_PUBLIC_URL}/${key}`;
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");

  // Use public URL (bucket is configured as public for gallery/blog images)
  const url = `${process.env.R2_PUBLIC_URL}/${key}`;

  return { key, url };
}
```

**Interface:** Unchanged - same `storagePut(key, data)` / `storageGet(key)` signature
**Callers:** No changes needed in `server/routers.ts` (blog image upload, gallery upload)

**R2 Setup:**

1. Create R2 bucket: `wiro-storage`
2. **Enable public access** (all files are public — gallery photos, blog images)
   - R2 Dashboard → Bucket Settings → Public Access → Enable
   - Public URL format: `https://pub-{bucket-id}.r2.dev/{key}`
3. **Set CORS policy** for frontend uploads (if admin uploads directly from browser):
   ```json
   [
     {
       "AllowedOrigins": [
         "https://www.wiro4x4indochina.com",
         "https://wiro4x4indochina.com"
       ],
       "AllowedMethods": ["GET", "PUT"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. Get API credentials (account ID, access key, secret key)

**Data Migration:**

```bash
# Step 1: Download from Manus S3 (get endpoint from Manus dashboard)
aws s3 sync s3://manus-bucket ./backup-files

# Step 2: Configure AWS CLI for R2
aws configure --profile r2
# Enter when prompted:
# AWS Access Key ID: <R2_ACCESS_KEY_ID>
# AWS Secret Access Key: <R2_SECRET_ACCESS_KEY>
# Default region name: auto
# Default output format: json

# Step 3: Upload to R2
aws s3 sync ./backup-files s3://wiro-storage \
  --endpoint-url https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2

# Step 4: Verify file count matches
aws s3 ls s3://wiro-storage --recursive --profile r2 --endpoint-url https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com | wc -l
# Compare with: find ./backup-files -type f | wc -l
```

- Update database URLs after upload (see Migration Phase 2, step 4)

---

### 4. LLM Integration (OpenAI)

**Current (Manus LLM Proxy):**

```typescript
// server/_core/llm.ts
const apiUrl = ENV.forgeApiUrl || "https://forge.manus.im/v1/chat/completions";
const response = await fetch(apiUrl, {
  headers: { authorization: `Bearer ${ENV.forgeApiKey}` },
  body: JSON.stringify({ model: "gemini-2.5-flash", messages }),
});
```

**New (Direct OpenAI):**

```typescript
// server/_core/llm.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const { messages, tools, maxTokens = 4096 } = params;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages.map(normalizeMessage),
    tools: tools?.length ? tools : undefined,
    max_tokens: maxTokens,
  });

  return response as InvokeResult; // Compatible interface
}
```

**Interface:** Unchanged - same `invokeLLM(params)` signature
**Callers:** No changes needed in `server/aiContentGenerator.ts` (blog draft generation)
**Model:** GPT-4o-mini ($0.15/1M input tokens, $0.60/1M output tokens)
**Expected cost:** ~$0.50-1/month for occasional blog drafts

**Error Handling:**

```typescript
// Update invokeLLM with retry logic and error handling
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const { messages, tools, maxTokens = 4096 } = params;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map(normalizeMessage),
      tools: tools?.length ? tools : undefined,
      max_tokens: maxTokens,
    });

    return response as InvokeResult;
  } catch (error) {
    // Error handling by type
    if (error.status === 429) {
      // Rate limit - wait and retry once
      await new Promise(resolve => setTimeout(resolve, 2000));
      return openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools,
        max_tokens: maxTokens,
      });
    } else if (error.status === 401) {
      // Invalid API key - fail fast
      throw new Error("OpenAI API key invalid or missing");
    } else if (error.status >= 500) {
      // OpenAI server error - return user-friendly message
      throw new Error(
        "AI service temporarily unavailable. Please try again later."
      );
    } else {
      // Other errors (quota, network, etc.) - log and rethrow
      console.error("[LLM] OpenAI error:", error);
      throw new Error("Failed to generate content. Please try again.");
    }
  }
}
```

**Behavior in Blog Draft Generation:**

- **Synchronous:** Admin waits for response (no background queue)
- **Timeout:** 30 seconds max (prevent hanging admin UI)
- **User-facing errors:** Toast notification with retry button
- **Logging:** All errors logged to console for debugging

---

### 5. Notifications (Resend Email)

**Current (Manus Notification Service):**

```typescript
// server/_core/notification.ts
export async function notifyOwner(payload: { title: string; content: string }) {
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  await fetch(endpoint, {
    method: "POST",
    headers: { authorization: `Bearer ${ENV.forgeApiKey}` },
    body: JSON.stringify(payload),
  });
}
```

**New (Resend Email):**

```typescript
// server/_core/notification.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notifyOwner(payload: { title: string; content: string }) {
  try {
    await resend.emails.send({
      from: "notifications@wiro4x4indochina.com",
      to: process.env.OWNER_EMAIL!,
      subject: payload.title,
      html: `
        <h2>${payload.title}</h2>
        <div>${payload.content.replace(/\n/g, "<br>")}</div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Sent from Wiro 4x4 Notification System
        </p>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Notification] Email failed:", error);
    return false;
  }
}
```

**Interface:** Unchanged - same `notifyOwner(payload)` signature
**Callers:** No changes needed (booking confirmations, admin alerts)
**Cost:** Resend free tier (3,000 emails/month) - well within limits

---

### 6. Remove Image Generation

**Verification Step (before deletion):**

```bash
# Search for all callers of generateImage()
grep -r "generateImage" server/ client/ --include="*.ts" --include="*.tsx"

# Expected: Only definition in server/_core/imageGeneration.ts
# If any callers found → assess impact before removing
```

**Files to delete (only after verification shows no callers):**

- `server/_core/imageGeneration.ts`
- Any callers of `generateImage()` function (if found)

**Replacement:** Manual image uploads only (blog cover images uploaded via admin panel)

**Justification:** Image generation is not used in current codebase (blog cover images are manually uploaded via admin panel's blog image upload feature)

---

### 7. Vercel Deployment Configuration

**New `vercel.json`:**

```json
{
  "version": 2,
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": null,
  "outputDirectory": "dist/public",
  "functions": {
    "api/index.js": {
      "runtime": "nodejs20.x",
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, must-revalidate" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

**Build Script Updates** (`package.json`):

```json
{
  "scripts": {
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js",
    "vercel-build": "pnpm build"
  }
}
```

**Build Output Structure:**

```
dist/
├── public/               # Vite output (frontend)
│   ├── index.html
│   ├── assets/
│   │   ├── index-xyz.js
│   │   └── index-xyz.css
│   └── images/
└── index.js              # esbuild output (backend - SINGLE BUNDLE)
```

**Backend Bundling Details:**

- Entry point: `server/_core/index.ts` (Express app)
- **ALL server code bundled:** `server/routers.ts`, `server/db.ts`, `server/storage.ts`, etc. are bundled into single `dist/index.js`
- `--bundle` flag includes all imports recursively
- `--packages=external` excludes node_modules (they're installed separately in Vercel function)
- Dependencies in `package.json` are installed by Vercel at function runtime
- No separate file copying needed — esbuild handles all imports

**Deployment Flow:**

1. Push to GitHub `main` branch
2. Vercel auto-deploys (connected to GitHub)
3. Build runs: Vite (frontend) + esbuild (backend bundle)
4. Frontend served from `dist/public/` (static files)
5. API served from `dist/index.js` as serverless function (single entry point)

---

### 8. Environment Variables

**Remove (Manus-specific):**

```bash
VITE_APP_ID
OAUTH_SERVER_URL
VITE_OAUTH_PORTAL_URL
OWNER_OPEN_ID
OWNER_NAME
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY
VITE_FRONTEND_FORGE_API_KEY
VITE_FRONTEND_FORGE_API_URL
SUPABASE_SERVICE_KEY
```

**Add (new services):**

```bash
# Auth
JWT_SECRET=<random-256-bit-secret>

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret-key>
R2_BUCKET_NAME=wiro-storage
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# AI
OPENAI_API_KEY=sk-proj-xxx

# Notifications
OWNER_EMAIL=wiro.adventures@gmail.com
```

**Keep (already working):**

```bash
# Database
DATABASE_URL=<planetscale-connection-string>

# Email
RESEND_API_KEY=re_xxx

# Payments
STRIPE_SECRET_KEY=sk_live_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App Config
NODE_ENV=production
VITE_APP_TITLE=Wiro 4x4
VITE_APP_LOGO=https://...
VITE_ANALYTICS_ENDPOINT=https://plausible.io
VITE_ANALYTICS_WEBSITE_ID=wiro4x4indochina.com
```

**Environment Variable Validation Strategy:**

| Variable               | Required? | Crash if Missing? | Fallback Behavior                                                      |
| ---------------------- | --------- | ----------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`         | ✅ Yes    | ✅ Crash          | None — app cannot function without DB                                  |
| `JWT_SECRET`           | ✅ Yes    | ✅ Crash          | None — auth requires secret                                            |
| `R2_ACCOUNT_ID`        | ✅ Yes    | ✅ Crash          | None — storage is core feature                                         |
| `R2_ACCESS_KEY_ID`     | ✅ Yes    | ✅ Crash          | None — storage is core feature                                         |
| `R2_SECRET_ACCESS_KEY` | ✅ Yes    | ✅ Crash          | None — storage is core feature                                         |
| `R2_BUCKET_NAME`       | ✅ Yes    | ✅ Crash          | None — storage is core feature                                         |
| `R2_PUBLIC_URL`        | ✅ Yes    | ✅ Crash          | None — storage is core feature                                         |
| `OWNER_EMAIL`          | ✅ Yes    | ✅ Crash          | None — notifications are critical                                      |
| `RESEND_API_KEY`       | ⚠️ Soft   | ❌ Lazy init      | Log warning, disable email features (booking confirmations won't send) |
| `OPENAI_API_KEY`       | ❌ No     | ❌ Lazy init      | Log warning, AI blog generation disabled                               |
| `ANTHROPIC_API_KEY`    | ❌ No     | ❌ Lazy init      | (Existing behavior — kept for compatibility)                           |
| `STRIPE_*`             | ❌ No     | ❌ Lazy init      | (Deferred — not yet implemented)                                       |

**Implementation:**

- **Modify existing** `server/_core/env.ts` — add validation for required vars on startup

  ```typescript
  // Add to existing server/_core/env.ts file
  const REQUIRED_VARS = [
    "DATABASE_URL",
    "JWT_SECRET",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_URL",
    "OWNER_EMAIL",
  ];

  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
  ```

- Use lazy initialization for RESEND/OPENAI (existing pattern from CLAUDE.md lines 92, 411)
- Crash early with clear error messages for required vars (shown above)

**Complete `.env.example`:**

```bash
# Database (PlanetScale)
DATABASE_URL=mysql://user:pass@aws.connect.psdb.cloud/wiro?ssl={"rejectUnauthorized":true}

# Authentication
JWT_SECRET=your-random-256-bit-secret-change-this

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=wiro-storage
R2_PUBLIC_URL=https://pub-xxxxxxxxx.r2.dev

# AI (OpenAI)
OPENAI_API_KEY=sk-proj-xxxxxxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxx
OWNER_EMAIL=wiro.adventures@gmail.com

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

# App Configuration
NODE_ENV=production
VITE_APP_TITLE=Wiro 4x4 - Kosher Off-Road Tours Chiang Mai
VITE_APP_LOGO=https://www.wiro4x4indochina.com/logo.png

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://plausible.io
VITE_ANALYTICS_WEBSITE_ID=wiro4x4indochina.com
```

---

## Migration Steps

### Phase 1: Local Development Setup (Day 1)

1. **Create accounts:**
   - PlanetScale database
   - Cloudflare R2 storage
   - OpenAI API key

2. **Update environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in all credentials
   - Test database connection: `pnpm db:push`

3. **Code changes:**
   - Update `drizzle/schema.ts` (users table)
   - Create `server/auth.ts` (new auth module)
   - Update `server/_core/context.ts` (JWT verification)
   - Update `server/storage.ts` (R2 integration)
   - Update `server/_core/llm.ts` (OpenAI integration)
   - Update `server/_core/notification.ts` (Resend email)
   - Delete `server/_core/imageGeneration.ts`
   - Delete `server/_core/oauth.ts`
   - Delete `server/_core/sdk.ts`

4. **Frontend changes:**
   - Create `client/src/components/LoginForm.tsx`
   - Create `client/src/components/RegisterForm.tsx`
   - Update `client/src/const.ts` (remove Manus URLs)

5. **Test locally:**
   - `pnpm dev` - verify server starts
   - Test login/register flows
   - Test file uploads
   - Test blog generation (OpenAI)
   - Run test suite: `pnpm test`

### Phase 2: Data Migration (Day 2)

1. **Export from Manus:**
   - Database: `mysqldump` all tables
   - Files: Download all S3 objects

2. **Import to new services:**
   - PlanetScale: Import SQL dump (see Database Configuration section)
   - R2: Upload all files via `aws s3 sync` (see Storage section)

3. **Verify data integrity:**

   ```sql
   -- Run on BOTH Manus and PlanetScale, compare counts
   SELECT 'users' as tbl, COUNT(*) FROM users
   UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
   UNION ALL SELECT 'agents', COUNT(*) FROM agents
   UNION ALL SELECT 'leads', COUNT(*) FROM leads
   UNION ALL SELECT 'financialRecords', COUNT(*) FROM financialRecords
   UNION ALL SELECT 'galleryPhotos', COUNT(*) FROM galleryPhotos
   UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
   UNION ALL SELECT 'payments', COUNT(*) FROM payments
   UNION ALL SELECT 'tours', COUNT(*) FROM tours
   UNION ALL SELECT 'blogPosts', COUNT(*) FROM blogPosts
   UNION ALL SELECT 'subscribers', COUNT(*) FROM subscribers;
   ```

   **Rollback Plan if Mismatch:**
   - If row counts don't match → investigate missing data
   - If ≥5% data loss → abort migration, restore from backup
   - If <5% data loss → identify missing rows, re-export those tables only

4. **Update file URLs:**

   **Discovery Step:** Find actual domain values

   ```sql
   -- Discover current Manus S3 domain
   SELECT DISTINCT SUBSTRING_INDEX(s3Url, '/', 3) as domain FROM galleryPhotos WHERE s3Url IS NOT NULL LIMIT 1;
   -- Example output: https://storage.manus.im or https://s3.manus-cdn.com

   -- Your R2 public URL (from R2 dashboard):
   -- Example: https://pub-abc123xyz.r2.dev
   ```

   **URL Replacement:**

   ```sql
   -- Replace Manus S3 URLs with R2 URLs
   -- IMPORTANT: Replace values below with discovered domains
   UPDATE galleryPhotos
   SET s3Url = REPLACE(s3Url, 'https://storage.manus.im', 'https://pub-abc123xyz.r2.dev')
   WHERE s3Url LIKE 'https://storage.manus.im%';

   UPDATE blogPosts
   SET coverImage = REPLACE(coverImage, 'https://storage.manus.im', 'https://pub-abc123xyz.r2.dev')
   WHERE coverImage LIKE 'https://storage.manus.im%';

   -- Verify replacements
   SELECT COUNT(*) FROM galleryPhotos WHERE s3Url LIKE '%pub-abc123xyz.r2.dev%';
   SELECT COUNT(*) FROM blogPosts WHERE coverImage LIKE '%pub-abc123xyz.r2.dev%';
   ```

   - Test image loading on staging environment before production deployment

### Phase 3: Vercel Deployment (Day 2-3)

1. **Configure Vercel:**
   - Connect GitHub repository
   - Set environment variables (all from `.env.example`)
   - Configure custom domain: `wiro4x4indochina.com`

2. **Deploy:**
   - Push to `main` branch
   - Verify build succeeds
   - Check deployment logs

3. **Verify deployment:**
   - Test all auth flows
   - Test file uploads
   - Test booking creation
   - Test admin panel
   - Test blog generation

4. **DNS cutover:**
   - Update DNS to point to Vercel
   - Monitor for errors
   - Test from multiple locations

### Phase 4: Post-Migration (Day 3)

1. **Monitor:**
   - Check Vercel logs
   - Check error tracking (Sentry)
   - Monitor database queries (PlanetScale dashboard)

2. **User communication:**
   - Email existing users about password reset (if needed)
   - Update documentation

3. **Cleanup:**
   - Keep Manus deployment live for 7 days (rollback safety)
   - Delete Manus project after verification
   - Remove old environment variables

---

## Testing Strategy

### Pre-Migration Testing (Local)

**Unit Tests (NEW - to be created):**

**`server/auth.test.ts` (new file) - 10 test cases:**

1. Password hashing produces different salts for same password
2. Password verification succeeds with correct password
3. Password verification fails with incorrect password
4. JWT creation includes userId, email, role claims
5. JWT expiration is set to 30 days
6. JWT verification succeeds with valid token
7. JWT verification fails with expired token (mock time advance)
8. JWT verification fails with invalid signature
9. Register rejects duplicate email
10. Reset token generation creates 64-char hex string

**`server/storage.test.ts` (new file) - 8 test cases:**

1. storagePut uploads buffer to R2 successfully
2. storagePut returns correct public URL format
3. storageGet returns public URL for existing key
4. storagePut handles missing R2_BUCKET_NAME env var gracefully
5. storagePut handles R2 network timeout (mocked S3Client)
6. storagePut strips leading slashes from keys
7. storagePut sets correct ContentType header
8. Multiple uploads to same key overwrite (S3 behavior)

**Coverage Target:** ≥80% line coverage for auth.ts and storage.ts modules

**Note:** These are NEW test files to be created during migration. The existing 21 test files (per CLAUDE.md) remain unchanged except for updating any Manus-specific assertions (e.g., remove references to `openId` field).

**Integration Tests:**

**Auth Flows (7 scenarios):**

1. Register → user created in DB → JWT cookie set → can access protected route
2. Register → duplicate email → 400 error
3. Login → correct credentials → JWT cookie → authenticated
4. Login → wrong password → 401 error
5. Forgot password → email sent → token stored in DB → expires after 1 hour
6. Reset password → valid token → password updated → token deleted → old password fails login
7. Reset password → expired token → generic error (no enumeration)

**File Upload Flow:**

- Frontend form → tRPC mutation → server storagePut() → R2 upload → public URL returned → image loads in gallery

**Blog Generation Flow:**

- Admin click "Generate" → tRPC call → OpenAI API → draft returned → editor populated

**Manual Testing:**

- Create account, login, logout
- Upload gallery photo
- Generate blog post
- Create booking
- Admin panel access

### Post-Migration Testing (Production)

**Smoke Tests:**

- [ ] Homepage loads
- [ ] Login works
- [ ] Admin panel accessible
- [ ] Gallery images load
- [ ] Blog posts display correctly
- [ ] Booking form submits
- [ ] Email notifications sent

**Performance Tests:**

- Measure API response times (should be <500ms)
- Check Lighthouse scores (should be >90)
- Verify image CDN loading (R2 public URL)

---

## Rollback Plan

**If issues arise during migration:**

1. **Immediate rollback (< 1 hour):**
   - Revert DNS to point back to Manus
   - No data loss (Manus still has original data)
   - Communicate downtime to users

2. **Partial rollback (specific service):**
   - Switch back to Manus LLM endpoint (env var change)
   - Switch back to Manus storage (code + env var)
   - Keep new auth system (if it's working)

3. **Data sync (if changes made on Vercel):**

   **Strategy: Freeze Writes During Rollback Window**
   - When rollback initiated, enable maintenance mode immediately (block new bookings/leads)
   - Export new bookings/leads from PlanetScale (created_at > migration_timestamp)
   - Import to Manus database via SQL INSERT statements (preserve IDs)
   - Verify foreign key integrity (bookings → agents, leads → bookings)
   - Re-enable writes on Manus

   **No Manual Merge:** Automated SQL export/import only. If foreign key conflicts detected, abort and investigate (data corruption risk).

   **Maintenance Mode Implementation:**

   ```typescript
   // Add to server/_core/middleware.ts (before tRPC handler)
   const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";
   if (MAINTENANCE_MODE) {
     // Block ALL API requests during rollback window
     // Simple approach: return 503 for all /api/* requests
     // This forces users to wait until rollback completes
     if (req.path.startsWith("/api/")) {
       return res.status(503).json({
         error: {
           message:
             "System under maintenance. Please check back in a few minutes.",
           code: "MAINTENANCE_MODE",
         },
       });
     }
   }
   ```

   **Alternative (granular control):** If you need read-only mode instead of full blackout, parse tRPC request body and block only mutations. During emergency rollback, full blackout is safer.

**Rollback readiness:**

- Keep Manus deployment active for 7 days
- Monitor error rates closely
- Have database backups ready

---

## Cost Breakdown

**Monthly Costs:**

| Service           | Plan                  | Cost     |
| ----------------- | --------------------- | -------- |
| Vercel            | Hobby (free)          | $0       |
| PlanetScale       | Free tier             | $0       |
| Cloudflare R2     | Free tier (10 GB)     | $0-1     |
| OpenAI API        | Pay-as-you-go         | $0.50-1  |
| Resend            | Free tier (3K emails) | $0       |
| Domain (existing) | -                     | $12/year |

**Total: $1-2/month** (vs Manus hosting fees)

**Scaling costs (if exceeded free tiers):**

- R2 overage: $0.015/GB/month
- OpenAI overage: $0.15/1M tokens (minimal for blog use)
- PlanetScale overage: Upgrade to $29/month (unlikely at current scale)

---

## Success Criteria

**Technical:**

- [ ] All 192 tests passing
- [ ] Auth flow working (login/register/logout)
- [ ] File uploads working (gallery + blog images)
- [ ] Blog generation working (OpenAI)
- [ ] Email notifications working (Resend)
- [ ] No errors in Vercel logs for 24 hours

**Business:**

- [ ] Zero downtime during migration
- [ ] All existing bookings preserved
- [ ] All gallery photos accessible
- [ ] No user complaints about access issues

**Performance:**

- [ ] API response time < 500ms (p95)
- [ ] Page load time < 2s (p95)
- [ ] Lighthouse score > 90

---

## Resolved Decisions

1. **User migration strategy:** ✅ DECIDED - Fresh Start approach (wipe users table, admin manually creates new account via migration script). No password migration needed. See "Migration Strategy for Existing Users" section.

2. **Session migration:** ✅ DECIDED - Invalidate all existing sessions (force re-login). All users will need to log in with new credentials after migration.

## Open Questions (Optional Decisions)

The following are implementation details that can be decided during execution:

1. **Database migration timing:** Migrate data before or after code deployment?
   - **Recommendation:** Migrate data first (to PlanetScale), then deploy code
   - **Status:** Non-blocking - both approaches work, recommendation preferred for safety

2. **Domain SSL:** Use Vercel's automatic SSL or bring custom certificate?
   - **Decision:** ✅ Use Vercel automatic SSL (Let's Encrypt) - zero config required

---

## Next Steps

1. **Review this design specification**
2. **Get approval from stakeholders**
3. **Create detailed implementation plan** (task breakdown)
4. **Set up new service accounts** (PlanetScale, R2, OpenAI)
5. **Begin Phase 1: Local development**

---

**End of Design Specification**
