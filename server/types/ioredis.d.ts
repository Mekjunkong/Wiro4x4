/**
 * Ambient type declarations for the optional `ioredis` package.
 *
 * The ioredis package is loaded dynamically at runtime via `import("ioredis")`.
 * These minimal declarations keep TypeScript happy without requiring the
 * package to be installed.
 */

declare module "ioredis" {
  interface RedisOptions {
    maxRetriesPerRequest?: number;
    connectTimeout?: number;
    lazyConnect?: boolean;
    enableOfflineQueue?: boolean;
  }

  class Redis {
    constructor(url: string, options?: RedisOptions);
    connect(): Promise<void>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    quit(): Promise<string>;
  }

  export { Redis };
  export default Redis;
}
