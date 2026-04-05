import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "../routes/authRoutes";
import { registerRssRoute } from "../routes/rss";
import { registerSitemapRoute } from "../routes/sitemap";
import { registerWhatsAppWebhookRoute } from "../routes/whatsapp";
import { registerAgentApiRoutes } from "../routes/agentApi";
import { registerChatApiRoute } from "../routes/chatApi";
import { registerEliChatRoute } from "../routes/eliChatApi";
import { registerEliRelayRoute } from "../routes/eliRelay";
import { registerChatRoute } from "../routes/chat";
import { appRouter } from "../routers";
import { createContext } from "./context";

export function createApp() {
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

  // Auth routes (register, login, logout, forgot/reset password)
  registerAuthRoutes(app);

  // RSS feed
  registerRssRoute(app);
  registerSitemapRoute(app);
  registerWhatsAppWebhookRoute(app);
  registerAgentApiRoutes(app);

  // AI Chat API (legacy endpoint)
  registerChatApiRoute(app);
  registerEliChatRoute(app);
  registerEliRelayRoute(app);

  // AI Chat API with DB persistence
  registerChatRoute(app);

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
