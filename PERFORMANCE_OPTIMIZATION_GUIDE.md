# Performance Optimization Guide - WIRO 4x4

## Executive Summary

This document details the comprehensive performance optimization implemented for the WIRO 4x4 website to achieve faster load times, better mobile performance, and improved user experience.

## Optimization Results

### Image Optimization

**Before:**
- Total images: 26 files
- Total size: 3.9 MB (3,916 KB)
- Format: JPEG only
- Lazy loading: None
- Priority loading: None

**After:**
- Total images: 26 files (52 files including WebP versions)
- WebP size: 2.74 MB (2,803 KB) - **28.4% smaller**
- JPEG fallback: 3.24 MB (3,322 KB) - **15.2% smaller**
- Format: WebP with JPEG fallback
- Lazy loading: Implemented for all non-critical images
- Priority loading: Enabled for hero/LCP images

**Savings:** ~1.1 MB reduction when using WebP (modern browsers)

### Code Splitting & Bundle Optimization

**Implemented:**
- ✅ Manual chunks for vendor libraries (React, UI components, icons, utilities)
- ✅ Separate chunks for routing, UI vendor, icons, and utils
- ✅ Optimized chunk file names with content hashing
- ✅ CSS and JavaScript minification (esbuild)
- ✅ Disabled source maps in production
- ✅ Chunk size warnings (1MB limit)

**Expected Results:**
- Smaller initial bundle size
- Better browser caching
- Faster subsequent page loads
- Reduced Total Blocking Time

### Critical Resource Optimization

**Implemented:**
- ✅ Preload hero image (WebP + JPEG fallback)
- ✅ DNS prefetch for Google Fonts
- ✅ Preconnect to external CDNs
- ✅ Optimized font loading (media print trick)
- ✅ Resource hints for critical assets

**Expected Results:**
- Faster LCP (Largest Contentful Paint)
- Improved FCP (First Contentful Paint)
- Reduced layout shifts

## Implementation Details

### 1. Image Optimization Script

**Location:** `scripts/optimize-images.py`

**Features:**
- Automatic image compression (82% WebP quality, 85% JPEG quality)
- Smart resizing based on usage:
  - Hero images: 1920px width
  - Large tour images: 1200px width
  - Medium images: 800px width
  - Small thumbnails: 400px width
- WebP conversion with JPEG fallback
- Maintains aspect ratios
- Handles RGBA to RGB conversion

**Usage:**
```bash
cd /home/ubuntu/wiro-4x4
python3 scripts/optimize-images.py
```

### 2. OptimizedImage Component

**Location:** `client/src/components/OptimizedImage.tsx`

**Features:**
- Automatic WebP serving with JPEG fallback
- Lazy loading for non-priority images
- Priority loading for hero/LCP images
- Loading states with skeleton placeholders
- Error handling with fallback UI
- Preload helper function

**Usage Examples:**

```tsx
// Hero image (priority, loads immediately)
<OptimizedImage 
  src="hero-waterfall" 
  alt="Waterfall adventure" 
  priority 
  className="w-full h-full object-cover"
/>

// Regular image (lazy loaded)
<OptimizedImage 
  src="tour-image" 
  alt="Tour description"
  className="rounded-lg"
/>

// Custom base path
<OptimizedImage 
  src="custom-image" 
  alt="Custom" 
  basePath="/images/custom"
/>
```

### 3. Vite Configuration

**Location:** `vite.config.ts`

**Key Changes:**
```typescript
build: {
  minify: 'esbuild',           // Fast minification
  cssMinify: true,             // CSS minification
  sourcemap: false,            // Disable in production
  chunkSizeWarningLimit: 1000, // 1MB warning
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
        'router': ['wouter'],
        'ui-vendor': [...],    // Radix UI components
        'icons': ['lucide-react'],
        'utils': ['clsx', 'tailwind-merge', 'date-fns'],
      },
      // Optimized file names with hashing
      chunkFileNames: 'assets/js/[name]-[hash].js',
      entryFileNames: 'assets/js/[name]-[hash].js',
      assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
    },
  },
}
```

### 4. HTML Resource Hints

**Location:** `client/index.html`

**Implemented:**
```html
<!-- DNS Prefetch & Preconnect -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Preload Hero Image (LCP) -->
<link rel="preload" as="image" href="/images/optimized/hero-waterfall.webp" type="image/webp" />
<link rel="preload" as="image" href="/images/optimized/hero-waterfall.jpg" type="image/jpeg" />

<!-- Optimized Font Loading -->
<link 
  href="https://fonts.googleapis.com/css2?family=..." 
  rel="stylesheet" 
  media="print" 
  onload="this.media='all'" 
/>
```

## Maintenance Guidelines

### Adding New Images

1. **Add original image** to `client/public/images/`
2. **Run optimization script:**
   ```bash
   cd /home/ubuntu/wiro-4x4
   python3 scripts/optimize-images.py
   ```
3. **Use OptimizedImage component:**
   ```tsx
   <OptimizedImage src="new-image" alt="Description" />
   ```

### Image Naming Convention

- Use descriptive names: `tour-jungle.jpg`, `waterfall-view.jpg`
- Avoid spaces, use hyphens: `chiang-mai-tour.jpg`
- Add `_compressed` suffix if pre-compressed: `image_compressed.jpg`
- Hero images should include "hero" in filename: `hero-waterfall.jpg`

### Performance Monitoring

**Recommended Tools:**
- Google PageSpeed Insights
- Lighthouse (Chrome DevTools)
- WebPageTest
- GTmetrix

**Key Metrics to Monitor:**
- LCP (Largest Contentful Paint): Target <2.5s
- FCP (First Contentful Paint): Target <1.8s
- TBT (Total Blocking Time): Target <200ms
- CLS (Cumulative Layout Shift): Target <0.1
- Speed Index: Target <3.0s

### Production Build

**Build command:**
```bash
pnpm build
```

**What happens:**
- All images served from `/images/optimized/`
- JavaScript split into optimized chunks
- CSS minified and extracted
- Assets hashed for cache busting
- Source maps disabled
- Console logs removed

## Verification Steps

### 1. Visual Inspection
- [ ] All images load correctly
- [ ] WebP images served in modern browsers
- [ ] JPEG fallback works in older browsers
- [ ] No broken images or layout shifts

### 2. Performance Testing
- [ ] Run Lighthouse audit (target score >80)
- [ ] Check LCP < 2.5s
- [ ] Check FCP < 1.8s
- [ ] Verify lazy loading works (images load as you scroll)
- [ ] Test on mobile device

### 3. Browser Compatibility
- [ ] Chrome/Edge (WebP support)
- [ ] Firefox (WebP support)
- [ ] Safari (WebP support since iOS 14)
- [ ] Older browsers (JPEG fallback)

### 4. Network Throttling
- [ ] Test on Fast 3G
- [ ] Test on Slow 3G
- [ ] Verify images load progressively

## Technical Details

### WebP Format Benefits
- **25-35% smaller** than JPEG at same quality
- Supports transparency (like PNG)
- Supported by 95%+ of browsers (as of 2024)
- Automatic fallback to JPEG for older browsers

### Lazy Loading Benefits
- Reduces initial page load time
- Saves bandwidth for users
- Improves performance metrics (LCP, FCP)
- Native browser support (`loading="lazy"`)

### Code Splitting Benefits
- Smaller initial JavaScript bundle
- Faster Time to Interactive (TTI)
- Better browser caching (vendor code rarely changes)
- Parallel loading of chunks

### Resource Hints Benefits
- **DNS Prefetch**: Resolves domain names early
- **Preconnect**: Establishes early connections
- **Preload**: Fetches critical resources ASAP
- Combined effect: Faster resource loading

## Performance Budget

### Recommended Limits
- **Images:** <2 MB total (WebP)
- **JavaScript:** <500 KB (gzipped)
- **CSS:** <100 KB (gzipped)
- **Fonts:** <200 KB
- **Total Page Size:** <6 MB

### Current Status
- Images: 2.74 MB (WebP) ✅
- JavaScript: To be measured after build
- CSS: To be measured after build
- Fonts: Loaded from Google Fonts CDN
- Total: Estimated <5 MB ✅

## Troubleshooting

### Images Not Loading

**Problem:** OptimizedImage shows "Image unavailable"

**Solutions:**
1. Check image exists in `/images/optimized/`
2. Verify filename matches (case-sensitive)
3. Check browser console for 404 errors
4. Ensure optimization script ran successfully

### WebP Not Working

**Problem:** JPEG served instead of WebP

**Solutions:**
1. Check browser supports WebP (Chrome, Firefox, Safari 14+)
2. Verify WebP files exist in optimized folder
3. Check `<picture>` element in DevTools
4. Clear browser cache

### Build Errors

**Problem:** Build fails with chunk size warnings

**Solutions:**
1. Check `chunkSizeWarningLimit` in vite.config.ts
2. Review manual chunks configuration
3. Consider splitting large dependencies further
4. Use dynamic imports for large components

## Future Optimizations

### Potential Improvements
- [ ] Implement responsive images (srcset)
- [ ] Add AVIF format support (even smaller than WebP)
- [ ] Implement service worker for offline support
- [ ] Add image CDN for global distribution
- [ ] Implement critical CSS inlining
- [ ] Add prefetch for next page resources
- [ ] Implement progressive image loading (blur-up)

### Advanced Techniques
- [ ] HTTP/2 Server Push for critical resources
- [ ] Brotli compression for text assets
- [ ] Resource prioritization with Priority Hints API
- [ ] Intersection Observer for advanced lazy loading
- [ ] WebP animation for hero sections

## Support & Resources

### Documentation
- [Web.dev Performance](https://web.dev/performance/)
- [MDN Web Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [WebP Image Format](https://developers.google.com/speed/webp)

### Tools
- [Squoosh](https://squoosh.app/) - Online image optimizer
- [ImageOptim](https://imageoptim.com/) - Desktop image optimizer
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated testing

---

**Last Updated:** 2026-01-19  
**Version:** 1.0  
**Maintained By:** WIRO 4x4 Development Team
