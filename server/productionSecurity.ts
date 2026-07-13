import helmet from "helmet";

const productionHelmetOptions = {
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
  // The site intentionally renders images hosted on approved external CDNs.
  crossOriginEmbedderPolicy: false,
} as const;

/**
 * Create the production security middleware used by every HTTP entrypoint.
 * It must be registered before any middleware that can terminate a response.
 */
export function productionSecurityMiddleware() {
  return helmet(productionHelmetOptions);
}
