import { useEffect } from "react";

const SITE_URL = "https://www.wiro4x4indochina.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/optimized/single_cascade_waterfall-lg.jpg`;

export interface PageMetaOptions {
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
  /** Explicit content language for social metadata. */
  language?: "en" | "he";
  /** Reciprocal canonical paths for localized equivalents. */
  alternates?: Partial<Record<"en" | "he" | "x-default", string>>;
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

function setTransientMetaTag(
  selector: string,
  attribute: string,
  value: string
) {
  let el = document.querySelector(selector);
  const created = !el;
  const previousValue = el?.getAttribute(attribute) ?? null;

  if (!el) {
    el = document.createElement("meta");
    if (selector.startsWith("meta[property=")) {
      const prop = selector.match(/property="([^"]+)"/)?.[1];
      if (prop) el.setAttribute("property", prop);
    } else if (selector.startsWith("meta[name=")) {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) el.setAttribute("name", name);
    }
    el.setAttribute("data-page-meta-owned", "true");
    document.head.appendChild(el);
  }

  el.setAttribute(attribute, value);

  return () => {
    if (!el?.isConnected || el.getAttribute(attribute) !== value) return;

    if (created && el.getAttribute("data-page-meta-owned") === "true") {
      el.remove();
      return;
    }

    if (previousValue === null) {
      el.removeAttribute(attribute);
    } else {
      el.setAttribute(attribute, previousValue);
    }
  };
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

function setHreflangLink(hreflang: string, href: string) {
  const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "alternate");
    el.setAttribute("hreflang", hreflang);
    el.setAttribute("data-dynamic-hreflang", "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function absoluteUrl(pathOrUrl: string) {
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${SITE_URL}${pathOrUrl}`;
}

function removeHreflangLink(hreflang: string) {
  document
    .querySelectorAll(`link[rel="alternate"][hreflang="${hreflang}"]`)
    .forEach(el => el.remove());
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

    // Canonical URL + hreflang links
    if (options.canonicalPath) {
      const canonicalUrl = `${SITE_URL}${options.canonicalPath}`;
      setLinkTag("canonical", canonicalUrl);
      setMetaTag('meta[property="og:url"]', "content", canonicalUrl);

      // Dynamic hreflang links per page. Explicit mappings are required for
      // localized commercial pairs; `/hebrew-guide` is an English route.
      removeHreflangLink("en");
      removeHreflangLink("he");
      removeHreflangLink("x-default");
      if (options.alternates) {
        for (const hreflang of ["en", "he", "x-default"] as const) {
          const path = options.alternates[hreflang];
          if (path) setHreflangLink(hreflang, absoluteUrl(path));
        }
      } else {
        setHreflangLink(options.language ?? "en", canonicalUrl);
        setHreflangLink("x-default", canonicalUrl);
      }
    }

    const restoreOgLocale = options.language
      ? setTransientMetaTag(
          'meta[property="og:locale"]',
          "content",
          options.language === "he" ? "he_IL" : "en_US"
        )
      : undefined;

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
    }

    // Cleanup on unmount — remove page-specific meta that shouldn't persist
    return () => {
      // Remove JSON-LD
      const jsonLdEl = document.getElementById("page-json-ld");
      if (jsonLdEl) jsonLdEl.remove();

      // Remove dynamic hreflang links (keep the static ones from index.html)
      document
        .querySelectorAll('link[data-dynamic-hreflang="true"]')
        .forEach(el => el.remove());

      restoreOgLocale?.();

      // Reset canonical to homepage
      const canonicalLink = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement | null;
      if (canonicalLink) canonicalLink.href = SITE_URL + "/";
    };
  }, [
    options.title,
    options.description,
    options.ogTitle,
    options.ogDescription,
    options.ogImage,
    options.canonicalPath,
    options.language,
    options.alternates?.en,
    options.alternates?.he,
    options.alternates?.["x-default"],
    options.jsonLd,
  ]);
}
