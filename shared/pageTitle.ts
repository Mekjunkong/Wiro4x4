/** Brand suffix, added only while the whole title fits Google's ~60 characters. */
export const BRAND_SUFFIX = " | WIRO 4x4";
export const MAX_TITLE_LENGTH = 60;

export function withBrandSuffix(title: string): string {
  if (title.includes("WIRO 4x4")) return title;
  const branded = title + BRAND_SUFFIX;
  return branded.length <= MAX_TITLE_LENGTH ? branded : title;
}
