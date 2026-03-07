import sharp from "sharp";
import path from "path";

const imagesDir = path.join(process.cwd(), "client/public/images");
const optimizedDir = path.join(imagesDir, "optimized");

const sizes = [
  { suffix: "sm", width: 400, quality: { webp: 95, jpeg: 93 } },
  { suffix: "md", width: 800, quality: { webp: 95, jpeg: 93 } },
  { suffix: "lg", width: 1600, quality: { webp: 95, jpeg: 93 } },
];

async function optimizeBanner() {
  const bannerPath = path.join(imagesDir, "banner.jpeg");

  for (const size of sizes) {
    // WebP
    await sharp(bannerPath)
      .resize(size.width, null, { withoutEnlargement: true })
      .webp({ quality: size.quality.webp })
      .toFile(path.join(optimizedDir, `banner-${size.suffix}.webp`));

    // JPEG
    await sharp(bannerPath)
      .resize(size.width, null, { withoutEnlargement: true })
      .jpeg({ quality: size.quality.jpeg, progressive: true })
      .toFile(path.join(optimizedDir, `banner-${size.suffix}.jpg`));

    console.log(
      `✅ Created banner-${size.suffix} (quality: WebP ${size.quality.webp}, JPEG ${size.quality.jpeg})`
    );
  }

  console.log("\n✅ Banner re-optimized with higher quality!");
}

optimizeBanner().catch(console.error);
