import sharp from "sharp";
import { readdir, mkdir, writeFile, stat, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const INPUT_DIR = path.resolve("client/public/images");
const OUTPUT_DIR = path.resolve("client/public/images/optimized");
const MANIFEST_PATH = path.resolve("client/public/image-manifest.json");

const SIZES = [
  { suffix: "sm", width: 400 },
  { suffix: "md", width: 800 },
  { suffix: "lg", width: 1600 },
];

const WEBP_QUALITY = 80;
const JPEG_QUALITY = 85;
const THUMB_WIDTH = 20;

// Hero/banner images need higher quality (first thing users see, especially on mobile)
const HERO_IMAGES = ["banner", "hero", "hero-bg"];
const HERO_WEBP_QUALITY = 95;
const HERO_JPEG_QUALITY = 93;

// Parse CLI flags
const FORCE = process.argv.includes("--force");
const REPORT_ONLY = process.argv.includes("--report");

type ManifestEntry = {
  blur: string; // base64 data URI
  sm: { webp: string; jpg: string };
  md: { webp: string; jpg: string };
  lg: { webp: string; jpg: string };
};

type SizeReport = {
  file: string;
  originalBytes: number;
  optimizedBytes: number;
  reductionPct: number;
};

async function getFileSize(filePath: string): Promise<number> {
  try {
    const s = await stat(filePath);
    return s.size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function isAlreadyOptimized(baseName: string): boolean {
  // Check if all responsive variants exist
  for (const size of SIZES) {
    const webpPath = path.join(OUTPUT_DIR, `${baseName}-${size.suffix}.webp`);
    const jpgPath = path.join(OUTPUT_DIR, `${baseName}-${size.suffix}.jpg`);
    if (!existsSync(webpPath) || !existsSync(jpgPath)) return false;
  }
  return true;
}

async function processImage(
  filePath: string,
  baseName: string
): Promise<ManifestEntry> {
  const image = sharp(filePath);
  const metadata = await image.metadata();
  const entry: ManifestEntry = {
    blur: "",
    sm: { webp: "", jpg: "" },
    md: { webp: "", jpg: "" },
    lg: { webp: "", jpg: "" },
  };

  // Generate blur thumbnail (20px wide, base64)
  const thumbBuffer = await sharp(filePath)
    .resize(THUMB_WIDTH)
    .webp({ quality: 20 })
    .toBuffer();
  entry.blur = `data:image/webp;base64,${thumbBuffer.toString("base64")}`;

  // Generate responsive variants
  // Use higher quality for hero/banner images
  const isHeroImage = HERO_IMAGES.some(hero => baseName.includes(hero));
  const webpQuality = isHeroImage ? HERO_WEBP_QUALITY : WEBP_QUALITY;
  const jpegQuality = isHeroImage ? HERO_JPEG_QUALITY : JPEG_QUALITY;

  for (const size of SIZES) {
    // Skip if source is smaller than target width
    const targetWidth =
      metadata.width && metadata.width < size.width
        ? metadata.width
        : size.width;

    const webpPath = path.join(OUTPUT_DIR, `${baseName}-${size.suffix}.webp`);
    const jpgPath = path.join(OUTPUT_DIR, `${baseName}-${size.suffix}.jpg`);

    await sharp(filePath)
      .resize(targetWidth)
      .webp({ quality: webpQuality })
      .toFile(webpPath);

    await sharp(filePath)
      .resize(targetWidth)
      .jpeg({ quality: jpegQuality })
      .toFile(jpgPath);

    entry[size.suffix as "sm" | "md" | "lg"] = {
      webp: `/images/optimized/${baseName}-${size.suffix}.webp`,
      jpg: `/images/optimized/${baseName}-${size.suffix}.jpg`,
    };
  }

  return entry;
}

async function generateReport(): Promise<void> {
  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  const reports: SizeReport[] = [];
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of imageFiles) {
    const filePath = path.join(INPUT_DIR, file);
    const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");
    const originalSize = await getFileSize(filePath);
    totalOriginal += originalSize;

    // Sum the md.webp variant as the "typical served" size
    const mdWebpPath = path.join(OUTPUT_DIR, `${baseName}-md.webp`);
    const optimizedSize = await getFileSize(mdWebpPath);
    totalOptimized += optimizedSize;

    const reduction =
      originalSize > 0
        ? ((originalSize - optimizedSize) / originalSize) * 100
        : 0;

    reports.push({
      file,
      originalBytes: originalSize,
      optimizedBytes: optimizedSize,
      reductionPct: reduction,
    });
  }

  // Sort by biggest savings first
  reports.sort((a, b) => b.originalBytes - a.originalBytes);

  console.log("\n=== IMAGE OPTIMIZATION REPORT ===\n");
  console.log(
    "File".padEnd(50),
    "Original".padStart(10),
    "Optimized".padStart(10),
    "Saved".padStart(8)
  );
  console.log("-".repeat(82));

  for (const r of reports) {
    const saved =
      r.optimizedBytes > 0 ? `${r.reductionPct.toFixed(0)}%` : "N/A";
    console.log(
      r.file.substring(0, 49).padEnd(50),
      formatBytes(r.originalBytes).padStart(10),
      (r.optimizedBytes > 0
        ? formatBytes(r.optimizedBytes)
        : "missing"
      ).padStart(10),
      saved.padStart(8)
    );
  }

  console.log("-".repeat(82));
  const totalReduction =
    totalOriginal > 0
      ? ((totalOriginal - totalOptimized) / totalOriginal) * 100
      : 0;
  console.log(
    "TOTAL".padEnd(50),
    formatBytes(totalOriginal).padStart(10),
    formatBytes(totalOptimized).padStart(10),
    `${totalReduction.toFixed(0)}%`.padStart(8)
  );
  console.log(
    `\nNote: "Optimized" column shows md.webp variant (800w) as the typical served size.`
  );
  console.log(
    `Full savings are even larger since sm.webp (400w) is served on mobile.\n`
  );
}

async function main() {
  if (REPORT_ONLY) {
    await generateReport();
    return;
  }

  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Load existing manifest if present
  let existingManifest: Record<string, ManifestEntry> = {};
  if (existsSync(MANIFEST_PATH)) {
    try {
      const raw = await readFile(MANIFEST_PATH, "utf-8");
      existingManifest = JSON.parse(raw);
    } catch {
      // Ignore parse errors, we'll rebuild
    }
  }

  // Process images from the root images dir (not the optimized subdir)
  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  console.log(`Found ${imageFiles.length} images to process...`);
  if (!FORCE) {
    console.log(`(Use --force to re-process already-optimized images)\n`);
  }

  const manifest: Record<string, ManifestEntry> = {};
  let processed = 0;
  let skipped = 0;
  const sizeReports: SizeReport[] = [];

  for (const file of imageFiles) {
    const filePath = path.join(INPUT_DIR, file);
    const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");

    // Skip if already optimized (unless --force)
    if (!FORCE && isAlreadyOptimized(baseName)) {
      // Use existing manifest entry if available
      if (existingManifest[baseName]) {
        manifest[baseName] = existingManifest[baseName];
      }
      skipped++;
      continue;
    }

    try {
      const originalSize = await getFileSize(filePath);
      manifest[baseName] = await processImage(filePath, baseName);
      processed++;

      // Calculate savings (using md.webp as typical served size)
      const mdWebpPath = path.join(OUTPUT_DIR, `${baseName}-md.webp`);
      const optimizedSize = await getFileSize(mdWebpPath);
      const reduction =
        originalSize > 0
          ? ((originalSize - optimizedSize) / originalSize) * 100
          : 0;

      sizeReports.push({
        file,
        originalBytes: originalSize,
        optimizedBytes: optimizedSize,
        reductionPct: reduction,
      });

      console.log(
        `[${processed}/${imageFiles.length - skipped}] ${file}  ${formatBytes(originalSize)} -> ${formatBytes(optimizedSize)} (${reduction.toFixed(0)}% saved)`
      );
    } catch (err) {
      console.error(`Failed to process ${file}:`, err);
    }
  }

  // Also process existing optimized images that don't have responsive variants yet
  const optimizedFiles = await readdir(OUTPUT_DIR);
  const existingOptimized = optimizedFiles.filter(
    f => /\.(jpg|jpeg|png|webp)$/i.test(f) && !/-(?:sm|md|lg|thumb)\./.test(f)
  );

  for (const file of existingOptimized) {
    const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");
    if (manifest[baseName]) continue; // Already processed from root

    if (!FORCE && isAlreadyOptimized(baseName)) {
      if (existingManifest[baseName]) {
        manifest[baseName] = existingManifest[baseName];
      }
      continue;
    }

    const filePath = path.join(OUTPUT_DIR, file);
    try {
      manifest[baseName] = await processImage(filePath, baseName);
      processed++;
      console.log(`[optimized] ${file}`);
    } catch (err) {
      console.error(`Failed to process ${file}:`, err);
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(
    `\nDone! Processed ${processed} images, skipped ${skipped} (already optimized).`
  );
  console.log(`Manifest written to ${MANIFEST_PATH}`);

  // Print summary of newly processed images
  if (sizeReports.length > 0) {
    const totalOrig = sizeReports.reduce((s, r) => s + r.originalBytes, 0);
    const totalOpt = sizeReports.reduce((s, r) => s + r.optimizedBytes, 0);
    const totalPct =
      totalOrig > 0 ? ((totalOrig - totalOpt) / totalOrig) * 100 : 0;
    console.log(
      `\nNewly processed: ${formatBytes(totalOrig)} -> ${formatBytes(totalOpt)} (${totalPct.toFixed(0)}% reduction)`
    );
  }
}

main();
