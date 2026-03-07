/**
 * Server-side image optimization using sharp.
 * Used for uploaded images (blog, gallery) to reduce file size before S3 storage.
 *
 * sharp is a devDependency used at build time for static images,
 * but we lazy-import it here so the server doesn't crash if sharp
 * isn't available in production (e.g., Manus platform).
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg";
}

interface OptimizeResult {
  buffer: Buffer;
  contentType: string;
  extension: string;
  originalSize: number;
  optimizedSize: number;
}

let sharpModule: typeof import("sharp") | null = null;

async function getSharp(): Promise<typeof import("sharp") | null> {
  if (sharpModule) return sharpModule;
  try {
    sharpModule = (await import("sharp"))
      .default as unknown as typeof import("sharp");
    return sharpModule;
  } catch {
    console.warn(
      "[imageOptimizer] sharp not available, returning images unoptimized"
    );
    return null;
  }
}

export async function optimizeUploadedImage(
  inputBuffer: Buffer,
  options: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = "webp",
  } = options;

  const originalSize = inputBuffer.length;
  const sharp = await getSharp();

  // If sharp is unavailable, return original buffer as-is
  if (!sharp) {
    return {
      buffer: inputBuffer,
      contentType: "image/jpeg",
      extension: "jpg",
      originalSize,
      optimizedSize: originalSize,
    };
  }

  try {
    let pipeline = sharp(inputBuffer).resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });

    let contentType: string;
    let extension: string;

    if (format === "webp") {
      pipeline = pipeline.webp({ quality });
      contentType = "image/webp";
      extension = "webp";
    } else {
      pipeline = pipeline.jpeg({ quality, progressive: true });
      contentType = "image/jpeg";
      extension = "jpg";
    }

    const buffer = await pipeline.toBuffer();

    return {
      buffer,
      contentType,
      extension,
      originalSize,
      optimizedSize: buffer.length,
    };
  } catch (err) {
    console.error(
      "[imageOptimizer] Failed to optimize, returning original:",
      err
    );
    return {
      buffer: inputBuffer,
      contentType: "image/jpeg",
      extension: "jpg",
      originalSize,
      optimizedSize: originalSize,
    };
  }
}
