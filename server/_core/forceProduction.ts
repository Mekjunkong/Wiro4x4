/**
 * The Vercel project runs with a non-production NODE_ENV, which made tRPC
 * return stack traces, widened CORS to localhost and (via the build) shipped
 * React's development bundle. The serverless entry is production by
 * definition, so it imports this module first: ES modules evaluate imports
 * in order, so NODE_ENV is set before tRPC and CORS read it.
 */
process.env.NODE_ENV = "production";

export {};
