import { createServer, request, type IncomingHttpHeaders } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app";

const SHELL = `<!doctype html><html><head><title>WIRO</title></head>
<body><div id="root"></div><script src="/assets/app.js"></script></body></html>`;

describe("production apex homepage redirect", () => {
  const server = createServer(createApp({ production: true, seoHtml: SHELL }));
  let origin: string;

  // Fetch may replace Host with the URL host; use HTTP directly so the app
  // receives the same apex/canonical host distinction as production.
  function requestApp(
    path: string,
    host: string,
    method = "GET",
    forwardedHost?: string
  ): Promise<{ status: number; headers: IncomingHttpHeaders; body: string }> {
    return new Promise((resolve, reject) => {
      const req = request(
        new URL(path, origin),
        {
          method,
          headers: {
            host,
            ...(forwardedHost ? { "x-forwarded-host": forwardedHost } : {}),
          },
        },
        response => {
          let body = "";
          response.setEncoding("utf8");
          response.on("data", chunk => (body += chunk));
          response.on("error", reject);
          response.on("end", () =>
            resolve({
              status: response.statusCode!,
              headers: response.headers,
              body,
            })
          );
        }
      );
      req.on("error", reject);
      req.end();
    });
  }

  beforeAll(async () => {
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected an ephemeral TCP address");
    }
    origin = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });
  });

  it.each(["GET", "HEAD"])(
    "redirects apex %s before serving the SEO shell and preserves the query",
    async method => {
      const path = "/?utm_source=Google&utm_campaign=family%20trip&ref=a%2Fb";
      const response = await requestApp(path, "wiro4x4indochina.com", method);

      expect(response.status).toBe(308);
      expect(response.headers.location).toBe(
        `https://www.wiro4x4indochina.com${path}`
      );
      expect(response.headers["content-security-policy"]).toContain(
        "script-src 'self'"
      );
      expect(response.body).not.toContain('id="root"');
      if (method === "HEAD") expect(response.body).toBe("");
    }
  );

  it.each(["www.wiro4x4indochina.com", "wiro-preview.vercel.app", "localhost"])(
    "serves the homepage on %s without redirecting",
    async host => {
      const response = await requestApp("/?utm_source=test", host);

      expect(response.status).toBe(200);
      expect(response.headers.location).toBeUndefined();
      expect(response.body).toContain('id="root"');
    }
  );

  it("does not redirect a preview host based on forwarded host input", async () => {
    const response = await requestApp(
      "/",
      "wiro-preview.vercel.app",
      "GET",
      "wiro4x4indochina.com"
    );

    expect(response.status).toBe(200);
    expect(response.headers.location).toBeUndefined();
  });

  it("leaves POST requests at the apex unchanged", async () => {
    const response = await requestApp("/", "wiro4x4indochina.com", "POST");

    expect(response.status).toBe(404);
    expect(response.headers.location).toBeUndefined();
  });

  it("leaves the apex API health request unchanged", async () => {
    const response = await requestApp(
      "/api/trpc/health.liveness",
      "wiro4x4indochina.com"
    );

    expect(response.status).toBe(200);
    expect(response.headers.location).toBeUndefined();
    expect(JSON.parse(response.body)).toMatchObject({
      result: { data: { json: { status: "alive" } } },
    });
  });
});
