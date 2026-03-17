import "dotenv/config";
import helmet from "helmet";
import { createApp } from "./_core/app";

const app = createApp();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Permissive — tighten after auditing inline scripts
    crossOriginEmbedderPolicy: false, // Allow embedded images from S3/CDN
  })
);

export default app;
