import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./app";

const SHELL = `<!doctype html>
<html lang="en">
  <head>
    <title>Default title</title>
    <meta name="description" content="Default description" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="Default title" />
    <meta property="og:description" content="Default description" />
    <meta property="og:image" content="https://example.com/default.jpg" />
    <meta property="og:url" content="https://example.com/" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:title" content="Default title" />
    <meta name="twitter:description" content="Default description" />
    <meta name="twitter:image" content="https://example.com/default.jpg" />
    <link rel="canonical" href="https://example.com/" />
    <link rel="alternate" hreflang="en" href="https://example.com/" />
    <link rel="alternate" hreflang="x-default" href="https://example.com/" />
  </head>
  <body><div id="root"></div></body>
</html>`;

const servers: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      server =>
        new Promise<void>((resolve, reject) => {
          server.close(error => (error ? reject(error) : resolve()));
        })
    )
  );
});

describe("createApp commercial SEO", () => {
  it("serves route-specific metadata from the normal server entrypoint", async () => {
    const server = createServer(createApp({ seoHtml: SHELL }));
    servers.push(server);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected an ephemeral TCP address");
    }

    const response = await fetch(
      `http://127.0.0.1:${address.port}/he/private-family-tours-chiang-mai`
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('<html lang="he" dir="rtl">');
    expect(html).toContain(
      "<title>טיולי 4x4 פרטיים למשפחות בצ׳אנג מאי | WIRO 4x4 Kosher Adventures</title>"
    );
    expect(html).toContain(
      '<link rel="canonical" href="https://www.wiro4x4indochina.com/he/private-family-tours-chiang-mai" />'
    );
    expect(html).toContain('hreflang="en"');
    expect(html).toContain('hreflang="he"');
    expect(html).toContain('hreflang="x-default"');
  });
});
