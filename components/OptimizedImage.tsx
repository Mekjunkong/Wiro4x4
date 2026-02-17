import { ImgHTMLAttributes, useState, useEffect } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /**
   * Image filename (without extension)
   * e.g., "hero-waterfall" will load hero-waterfall.webp with hero-waterfall.jpg fallback
   */
  src: string;
  
  /**
   * Alt text for accessibility (required)
   */
  alt: string;
  
  /**
   * Whether this is a priority image (hero/LCP)
   * Priority images are loaded immediately without lazy loading
   */
  priority?: boolean;
  
  /**
   * Image directory path
   * @default "/images/optimized"
   */
  basePath?: string;
  
  /**
   * Fallback image format
   * @default "jpg"
   */
  fallbackFormat?: 'jpg' | 'jpeg' | 'png';
  
  /**
   * Custom loading behavior
   */
  loading?: 'lazy' | 'eager';
}

/**
 * OptimizedImage Component
 * 
 * Automatically serves WebP images with JPEG/PNG fallback for better performance.
 * Implements lazy loading for non-priority images with loading states.
 * 
 * @example
 * ```tsx
 * // Hero image (priority, loads immediately)
 * <OptimizedImage 
 *   src="hero-waterfall" 
 *   alt="Waterfall adventure" 
 *   priority 
 *   className="w-full h-full object-cover"
 * />
 * 
 * // Regular image (lazy loaded)
 * <OptimizedImage 
 *   src="tour-image" 
 *   alt="Tour description"
 *   className="rounded-lg"
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  priority = false,
  basePath = '/images/optimized',
  fallbackFormat = 'jpg',
  loading,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  
  // Remove file extension if provided
  const cleanSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  
  // Construct paths
  const webpSrc = `${basePath}/${cleanSrc}.webp`;
  const fallbackSrc = `${basePath}/${cleanSrc}.${fallbackFormat}`;
  
  // Preload priority images
  useEffect(() => {
    if (priority) {
      const img = new Image();
      img.src = webpSrc;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => {
        // Try fallback
        const fallbackImg = new Image();
        fallbackImg.src = fallbackSrc;
        fallbackImg.onload = () => {
          setUseFallback(true);
          setIsLoaded(true);
        };
        fallbackImg.onerror = () => setImageError(true);
      };
    }
  }, [webpSrc, fallbackSrc, priority]);
  
  // Handle image load error - fallback to JPEG
  const handleError = () => {
    if (!useFallback) {
      setUseFallback(true);
    } else {
      setImageError(true);
    }
  };
  
  // Error state
  if (imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">Image unavailable</span>
      </div>
    );
  }
  
  const loadingBehavior = loading || (priority ? 'eager' : 'lazy');
  
  return (
    <div className="relative">
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className={`absolute inset-0 bg-muted animate-pulse ${className}`} />
      )}
      
      <picture>
        {/* WebP source (modern browsers) */}
        {!useFallback && (
          <source srcSet={webpSrc} type="image/webp" />
        )}
        
        {/* Fallback image */}
        <img
          src={fallbackSrc}
          alt={alt}
          loading={loadingBehavior}
          decoding={priority ? 'sync' : 'async'}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          {...props}
        />
      </picture>
    </div>
  );
}

/**
 * Preload a critical image (for hero/LCP images)
 * Call this in the component that uses the hero image
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   preloadImage('hero-waterfall');
 * }, []);
 * ```
 */
export function preloadImage(src: string, basePath = '/images/optimized') {
  const cleanSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  
  // Preload WebP
  const linkWebP = document.createElement('link');
  linkWebP.rel = 'preload';
  linkWebP.as = 'image';
  linkWebP.href = `${basePath}/${cleanSrc}.webp`;
  linkWebP.type = 'image/webp';
  document.head.appendChild(linkWebP);
  
  // Preload fallback
  const linkJPEG = document.createElement('link');
  linkJPEG.rel = 'preload';
  linkJPEG.as = 'image';
  linkJPEG.href = `${basePath}/${cleanSrc}.jpg`;
  linkJPEG.type = 'image/jpeg';
  document.head.appendChild(linkJPEG);
}
