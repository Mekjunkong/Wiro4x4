import "dotenv/config";
import helmet from "helmet";
import { createApp } from "./_core/app";
import { seoMiddleware } from "./seoMiddleware";

const app = createApp();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://plausible.io", "'unsafe-inline'"],
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
app.use(seoMiddleware());

export default app;
