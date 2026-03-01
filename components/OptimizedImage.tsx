import { ImgHTMLAttributes, useState, useEffect } from "react";

interface OptimizedImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet"
> {
  src: string;
  alt: string;
  priority?: boolean;
  basePath?: string;
  sizes?: string;
  blur?: string;
  aspectRatio?: string;
  onError?: () => void;
  fallbackFormat?: "jpg" | "jpeg" | "png";
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  basePath = "/images/optimized",
  sizes = "100vw",
  blur,
  aspectRatio,
  fallbackFormat = "jpg",
  className = "",
  onError,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const cleanSrc = src
    .replace(/^\/images\/optimized\//, "")
    .replace(/\.(jpg|jpeg|png|webp)$/i, "");

  const isExternalUrl = src.startsWith("http://") || src.startsWith("https://");

  const webpSrcSet = isExternalUrl
    ? undefined
    : `${basePath}/${cleanSrc}-sm.webp 400w, ${basePath}/${cleanSrc}-md.webp 800w, ${basePath}/${cleanSrc}-lg.webp 1600w`;

  const jpgSrcSet = isExternalUrl
    ? undefined
    : `${basePath}/${cleanSrc}-sm.${fallbackFormat} 400w, ${basePath}/${cleanSrc}-md.${fallbackFormat} 800w, ${basePath}/${cleanSrc}-lg.${fallbackFormat} 1600w`;

  const fallbackSrc = isExternalUrl
    ? src
    : `${basePath}/${cleanSrc}-lg.${fallbackFormat}`;

  useEffect(() => {
    if (!priority || isExternalUrl) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.type = "image/webp";
    link.imageSrcset = webpSrcSet || "";
    link.imageSizes = sizes;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [priority, webpSrcSet, sizes, isExternalUrl]);

  if (hasError) return null;

  const containerStyle: React.CSSProperties = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...(blur && !isLoaded
      ? {
          backgroundImage: `url(${blur})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
    ...style,
  };

  return (
    <picture>
      {webpSrcSet && (
        <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />
      )}
      <img
        src={fallbackSrc}
        srcSet={jpgSrcSet}
        sizes={isExternalUrl ? undefined : sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          onError?.();
        }}
        className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={containerStyle}
        {...props}
      />
    </picture>
  );
}

export function preloadImage(
  src: string,
  basePath = "/images/optimized",
  sizes = "100vw"
) {
  const cleanSrc = src
    .replace(/^\/images\/optimized\//, "")
    .replace(/\.(jpg|jpeg|png|webp)$/i, "");

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.type = "image/webp";
  link.imageSrcset = `${basePath}/${cleanSrc}-sm.webp 400w, ${basePath}/${cleanSrc}-md.webp 800w, ${basePath}/${cleanSrc}-lg.webp 1600w`;
  link.imageSizes = sizes;
  document.head.appendChild(link);
}
