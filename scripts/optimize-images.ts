import sharp from "sharp";
import { readdir, mkdir, writeFile } from "fs/promises";
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

type ManifestEntry = {
  blur: string; // base64 data URI
  sm: { webp: string; jpg: string };
  md: { webp: string; jpg: string };
  lg: { webp: string; jpg: string };
};

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
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    await sharp(filePath)
      .resize(targetWidth)
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(jpgPath);

    entry[size.suffix as "sm" | "md" | "lg"] = {
      webp: `/images/optimized/${baseName}-${size.suffix}.webp`,
      jpg: `/images/optimized/${baseName}-${size.suffix}.jpg`,
    };
  }

  return entry;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Process images from the root images dir (not the optimized subdir)
  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  console.log(`Found ${imageFiles.length} images to process...`);

  const manifest: Record<string, ManifestEntry> = {};
  let processed = 0;

  for (const file of imageFiles) {
    const filePath = path.join(INPUT_DIR, file);
    const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");

    try {
      manifest[baseName] = await processImage(filePath, baseName);
      processed++;
      console.log(`[${processed}/${imageFiles.length}] ${file}`);
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
  console.log(`\nDone! Processed ${processed} images.`);
  console.log(`Manifest written to ${MANIFEST_PATH}`);
}

main();
