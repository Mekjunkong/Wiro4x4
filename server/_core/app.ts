import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "../routes/authRoutes";
import { registerRssRoute } from "../routes/rss";
import { registerSitemapRoute } from "../routes/sitemap";
import { registerWhatsAppWebhookRoute } from "../routes/whatsapp";
import { appRouter } from "../routers";
import { createContext } from "./context";

export function createApp() {
  const app = express();

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Auth routes (register, login, logout, forgot/reset password)
  registerAuthRoutes(app);

  // RSS feed
  registerRssRoute(app);
  registerSitemapRoute(app);
  registerWhatsAppWebhookRoute(app);

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
