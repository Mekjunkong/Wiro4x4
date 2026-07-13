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
import { seoMiddleware } from "../seoMiddleware";
import { createContext } from "./context";

export function createApp(options?: { seoHtml?: string }) {
  const app = express();

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
  if (options?.seoHtml || process.env.NODE_ENV === "production") {
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
