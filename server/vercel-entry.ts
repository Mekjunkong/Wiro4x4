import "dotenv/config";
import { createApp } from "./_core/app";
// Embedded at build time by esbuild (--loader:.html=text) so the serverless
// bundle never depends on Vercel's file tracing to ship the SPA shell —
// tracing silently missed it and every HTML route 404'd ("Cannot GET /").
// vite build runs before esbuild in build:frontend, so this file exists.
import indexHtml from "../dist/public/index.html";

// createApp owns production ordering: security must precede API, SEO, and any
// terminal response so the serverless entry cannot accidentally bypass Helmet.
const app = createApp({ production: true, seoHtml: indexHtml });

export default app;
