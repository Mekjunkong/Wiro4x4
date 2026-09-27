import { describe, expect, it } from "vitest";
import { databaseHost, remoteDbWritesBlocked } from "./devWriteGuard";

const remote =
  "mysql://u:p@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/wiro";

describe("remoteDbWritesBlocked", () => {
  it("blocks a dev server pointed at a remote database", () => {
    expect(
      remoteDbWritesBlocked({ NODE_ENV: "development", DATABASE_URL: remote })
    ).toBe(true);
    expect(remoteDbWritesBlocked({ DATABASE_URL: remote })).toBe(true);
  });

  it("allows local databases, production, tests and the explicit override", () => {
    const local = "mysql://root:root@127.0.0.1:3306/wiro";
    expect(
      remoteDbWritesBlocked({ NODE_ENV: "development", DATABASE_URL: local })
    ).toBe(false);
    expect(
      remoteDbWritesBlocked({
        NODE_ENV: "development",
        DATABASE_URL: "mysql://r@mysql:3306/w",
      })
    ).toBe(false);
    expect(
      remoteDbWritesBlocked({ NODE_ENV: "production", DATABASE_URL: remote })
    ).toBe(false);
    expect(
      remoteDbWritesBlocked({ NODE_ENV: "test", DATABASE_URL: remote })
    ).toBe(false);
    expect(
      remoteDbWritesBlocked({
        NODE_ENV: "development",
        DATABASE_URL: remote,
        ALLOW_REMOTE_DB_WRITES: "1",
      })
    ).toBe(false);
    expect(remoteDbWritesBlocked({ NODE_ENV: "development" })).toBe(false);
  });

  it("reads the host without exposing credentials", () => {
    expect(databaseHost(remote)).toBe(
      "gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
    );
    expect(databaseHost("not a url")).toBeNull();
  });
});
