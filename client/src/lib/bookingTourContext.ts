export function parseRequestedPackageName(packageParam: string | null): string {
  return packageParam?.trim() ?? "";
}

export function buildPackageBookingUrl(packageName: string): string {
  const safePackageName = packageName.trim();
  return safePackageName
    ? `/book?package=${encodeURIComponent(safePackageName)}`
    : "/book";
}

export function parseRequestedTourSlugs(
  toursParam: string | null,
  tourParam: string | null
): string[] {
  return Array.from(
    new Set(
      [toursParam, tourParam]
        .flatMap(value => value?.split(",") ?? [])
        .map(slug => slug.trim())
        .filter(Boolean)
    )
  );
}

export function buildSelectedToursBookingUrl(
  selectedSlugs: readonly string[],
  knownSlugs: readonly string[]
): string {
  const knownSlugSet = new Set(
    knownSlugs.map(slug => slug.trim()).filter(Boolean)
  );
  const safeSlugs = Array.from(
    new Set(
      selectedSlugs
        .map(slug => slug.trim())
        .filter(slug => knownSlugSet.has(slug))
    )
  );

  return safeSlugs.length > 0 ? `/book?tours=${safeSlugs.join(",")}` : "/book";
}
