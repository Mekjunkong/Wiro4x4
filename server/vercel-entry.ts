import "dotenv/config";
import helmet from "helmet";
import { createApp } from "./_core/app";
import { seoMiddleware } from "./seoMiddleware";
// Embedded at build time by esbuild (--loader:.html=text) so the serverless
// bundle never depends on Vercel's file tracing to ship the SPA shell —
// tracing silently missed it and every HTML route 404'd ("Cannot GET /").
// vite build runs before esbuild in build:frontend, so this file exists.
import indexHtml from "../dist/public/index.html";

const app = createApp();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://plausible.io"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://plausible.io", "https://wa.me"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedded images from S3/CDN
  })
);

// SEO: inject route-specific meta tags into the SPA HTML for crawlers
app.use(seoMiddleware({ html: indexHtml }));

export default app;
