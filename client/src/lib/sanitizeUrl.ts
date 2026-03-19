/**
 * Sanitize a URL from markdown content by allowlisting safe protocols.
 * Strips control characters and returns the cleaned URL. Blocks anything
 * except http(s), mailto, tel, relative paths, and anchors.
 */
export function sanitizeUrl(url: string): string {
  const cleaned = url.replace(/[\x00-\x1f\x7f]/g, "").trim();
  if (/^[a-z]+:/i.test(cleaned) && !/^https?:|^mailto:|^tel:/i.test(cleaned)) {
    return "#";
  }
  return cleaned;
}
