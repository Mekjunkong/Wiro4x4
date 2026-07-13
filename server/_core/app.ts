import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "../routes/authRoutes";
import { registerRssRoute } from "../routes/rss";
import { registerSitemapRoute } from "../routes/sitemap";
import { registerWhatsAppWebhookRoute } from "../routes/whatsapp";
import { registerPostTourReviewClickRoute } from "../routes/postTourReviewClick";
import { registerAgentApiRoutes } from "../routes/agentApi";
import { registerChatApiRoute } from "../routes/chatApi";
import { registerEliChatRoute } from "../routes/eliChatApi";
import { registerEliRelayRoute } from "../routes/eliRelay";
import { registerChatRoute } from "../routes/chat";
import { registerMosheRoute } from "../routes/moshe";
import { registerN8nRoutes } from "../routes/n8n";
import { appRouter } from "../routers";
import { productionSecurityMiddleware } from "../productionSecurity";
import { seoMiddleware } from "../seoMiddleware";
import { createContext } from "./context";

interface CreateAppOptions {
  /** Embedded SPA shell used by the Vercel production bundle and tests. */
  seoHtml?: string;
  /** Enable the ordered production security and SEO response stack. */
  production?: boolean;
}

export function createApp(options?: CreateAppOptions) {
  const app = express();
  const isProductionEntry =
    options?.production || options?.seoHtml !== undefined;

  // This must precede CORS preflight, body-parser errors, SEO HTML, API routes,
  // and static fallbacks so every production response carries the same policy.
  if (isProductionEntry) {
    app.use(productionSecurityMiddleware());
  }

  // CORS whitelist
  app.use(
    cors({
      origin: [
        "https://wiro4x4indochina.com",
        "https://www.wiro4x4indochina.com",
        ...(process.env.NODE_ENV === "development"
          ? ["http://localhost:3000", "http://localhost:5173"]
          : []),
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve route-specific metadata from the same app entrypoint used by the
  // local production build. Development must always fall through to Vite so a
  // stale dist shell cannot reference assets that the dev server does not own.
  if (isProductionEntry) {
    app.use(seoMiddleware({ html: options?.seoHtml }));
  }

  // Auth routes (register, login, logout, forgot/reset password)
  registerAuthRoutes(app);

  // RSS feed
  registerRssRoute(app);
  registerSitemapRoute(app);
  registerWhatsAppWebhookRoute(app);
  registerPostTourReviewClickRoute(app);
  registerAgentApiRoutes(app);

  // AI Chat API (legacy endpoint)
  registerChatApiRoute(app);
  registerEliChatRoute(app);
  registerEliRelayRoute(app);
  registerN8nRoutes(app);

  // AI Chat API with DB persistence
  registerChatRoute(app);

  // Moshe human-handoff chat → Telegram notification
  registerMosheRoute(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
