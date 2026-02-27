import { useEffect } from "react";

const SITE_URL = "https://www.wiro4x4indochina.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/single_cascade_waterfall.jpg`;

interface PageMetaOptions {
  /** Page title (will be suffixed with "| WIRO 4x4 Kosher Adventures") */
  title: string;
  /** Meta description */
  description?: string;
  /** OG title override (defaults to title) */
  ogTitle?: string;
  /** OG description override (defaults to description) */
  ogDescription?: string;
  /** Absolute OG image URL */
  ogImage?: string;
  /** Canonical path (e.g. "/tours/doi-inthanon") — will be prefixed with SITE_URL */
  canonicalPath?: string;
  /** JSON-LD structured data object to inject */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function setMetaTag(selector: string, attribute: string, value: string) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    // Determine if it's a property or name attribute
    if (selector.startsWith("meta[property=")) {
      const prop = selector.match(/property="([^"]+)"/)?.[1];
      if (prop) el.setAttribute("property", prop);
    } else if (selector.startsWith("meta[name=")) {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) el.setAttribute("name", name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, value);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector(
    `link[rel="${rel}"]`
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function usePageMeta(
  titleOrOptions: string | PageMetaOptions,
  description?: string
) {
  const options: PageMetaOptions =
    typeof titleOrOptions === "string"
      ? { title: titleOrOptions, description }
      : titleOrOptions;

  useEffect(() => {
    const fullTitle = `${options.title} | WIRO 4x4 Kosher Adventures`;
    document.title = fullTitle;

    // Meta description
    if (options.description) {
      setMetaTag('meta[name="description"]', "content", options.description);
    }

    // OG tags
    setMetaTag(
      'meta[property="og:title"]',
      "content",
      options.ogTitle || options.title
    );
    if (options.description || options.ogDescription) {
      setMetaTag(
        'meta[property="og:description"]',
        "content",
        options.ogDescription || options.description || ""
      );
    }
    setMetaTag(
      'meta[property="og:image"]',
      "content",
      options.ogImage || DEFAULT_OG_IMAGE
    );

    // Twitter tags
    setMetaTag(
      'meta[name="twitter:title"]',
      "content",
      options.ogTitle || options.title
    );
    if (options.description || options.ogDescription) {
      setMetaTag(
        'meta[name="twitter:description"]',
        "content",
        options.ogDescription || options.description || ""
      );
    }
    setMetaTag(
      'meta[name="twitter:image"]',
      "content",
      options.ogImage || DEFAULT_OG_IMAGE
    );

    // Canonical URL
    if (options.canonicalPath) {
      setLinkTag("canonical", `${SITE_URL}${options.canonicalPath}`);
      setMetaTag(
        'meta[property="og:url"]',
        "content",
        `${SITE_URL}${options.canonicalPath}`
      );
    }

    // JSON-LD injection
    if (options.jsonLd) {
      const scriptId = "page-json-ld";
      let script = document.getElementById(
        scriptId
      ) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(options.jsonLd);

      // Cleanup on unmount
      return () => {
        const el = document.getElementById(scriptId);
        if (el) el.remove();
      };
    }

    return undefined;
  }, [
    options.title,
    options.description,
    options.ogTitle,
    options.ogDescription,
    options.ogImage,
    options.canonicalPath,
    options.jsonLd,
  ]);
}
