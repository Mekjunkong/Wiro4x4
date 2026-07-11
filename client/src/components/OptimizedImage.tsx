import { ImgHTMLAttributes, useState } from "react";

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
  width?: number;
  height?: number;
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
  width,
  height,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const cleanSrc = src
    .replace(/^\/images\/optimized\//, "")
    .replace(/\.(jpg|jpeg|png|webp)$/i, "");

  const isExternalUrl = src.startsWith("http://") || src.startsWith("https://");

  // Responsive srcset (only used at fallback level 0 when variants exist)
  const webpSrcSet = `${basePath}/${cleanSrc}-sm.webp 400w, ${basePath}/${cleanSrc}-md.webp 800w, ${basePath}/${cleanSrc}-lg.webp 1600w`;
  const jpgSrcSet = `${basePath}/${cleanSrc}-sm.${fallbackFormat} 400w, ${basePath}/${cleanSrc}-md.${fallbackFormat} 800w, ${basePath}/${cleanSrc}-lg.${fallbackFormat} 1600w`;

  // Fallback chain: responsive variants may not exist on production,
  // so try non-suffixed optimized images, then original /images/ directory
  const fallbackChain = isExternalUrl
    ? [src]
    : [
        `${basePath}/${cleanSrc}.${fallbackFormat}`,
        `${basePath}/${cleanSrc}.webp`,
        `/images/${cleanSrc}.jpeg`,
        `/images/${cleanSrc}.jpg`,
      ];

  const showResponsive = fallbackIndex === 0 && !isExternalUrl;
  const currentSrc = fallbackChain[fallbackIndex];

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
      {showResponsive && (
        <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />
      )}
      <img
        src={currentSrc}
        srcSet={showResponsive ? jpgSrcSet : undefined}
        sizes={showResponsive ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (fallbackIndex < fallbackChain.length - 1) {
            setFallbackIndex(prev => prev + 1);
          } else {
            setHasError(true);
            onError?.();
          }
        }}
        className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={containerStyle}
        {...props}
      />
    </picture>
  );
}
