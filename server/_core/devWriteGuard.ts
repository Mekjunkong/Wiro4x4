/**
 * The local `.env` DATABASE_URL points at the production database, so a form
 * submitted against `pnpm dev` writes real rows (test booking #30001 was
 * created this way). Outside production and tests, refuse writes to any
 * non-local database unless ALLOW_REMOTE_DB_WRITES=1 is set on purpose.
 * Reads still work, so the local site shows real tours.
 */

const LOCAL_DB_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
  "mysql", // docker-compose / CI service names
  "db",
  "host.docker.internal",
]);

type Env = Record<string, string | undefined>;

export function databaseHost(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function remoteDbWritesBlocked(env: Env = process.env): boolean {
  // Only a local `pnpm dev` (which sets NODE_ENV=development) is guarded.
  // Never on Vercel: its runtime NODE_ENV is not reliably "production", and
  // blocking there stops real bookings.
  if (env.VERCEL) return false;
  if (env.NODE_ENV !== "development") return false;
  if (env.ALLOW_REMOTE_DB_WRITES === "1") return false;
  const host = databaseHost(env.DATABASE_URL);
  return host !== null && !LOCAL_DB_HOSTS.has(host);
}

export const REMOTE_DB_WRITE_MESSAGE =
  "Blocked: this dev server is connected to a remote (production) database, so writes are disabled. " +
  "Use a local DATABASE_URL, or set ALLOW_REMOTE_DB_WRITES=1 if you really mean to write to it.";
