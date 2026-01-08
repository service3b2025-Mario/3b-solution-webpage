import { ImgHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // If true, don't lazy load
  className?: string;
  sizes?: string;
}

/**
 * OptimizedImage component with:
 * - Lazy loading for below-the-fold images
 * - Blur-up placeholder effect
 * - Responsive srcset support
 * - WebP format with fallback
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate WebP version URL if image is JPG/PNG (but not for CloudFront URLs)
  const getWebPSrc = (originalSrc: string): string => {
    // Don't convert CloudFront images - they are already optimized
    if (originalSrc.includes('cloudfront.net')) {
      return originalSrc;
    }
    
    if (originalSrc.match(/\.(jpg|jpeg|png)$/i)) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return originalSrc;
  };

  // Generate responsive srcset for different screen sizes
  const generateSrcSet = (baseSrc: string): string => {
    // CloudFront URLs don't support query parameters for resizing by default
    // Just return the original URL
    return baseSrc;
  };

  const webpSrc = getWebPSrc(src);
  const srcSet = generateSrcSet(webpSrc);

  return (
    <picture>
      {/* WebP version for modern browsers */}
      {webpSrc !== src && (
        <source
          type="image/webp"
          srcSet={srcSet}
          sizes={sizes || '100vw'}
        />
      )}
      
      {/* Fallback to original format */}
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'opacity-50',
          className
        )}
        sizes={sizes || '100vw'}
        {...props}
      />
    </picture>
  );
}

/**
 * Hero image component with optimized loading
 */
export function HeroImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true} // Hero images should load immediately
      sizes="100vw"
      className={cn('w-full h-full object-cover', className)}
      {...props}
    />
  );
}

/**
 * Property card image component with lazy loading
 */
export function PropertyImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={false} // Property cards should lazy load
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={cn('w-full h-full object-cover', className)}
      {...props}
    />
  );
}

/**
 * Logo image component (always eager load)
 */
export function LogoImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      className={cn('object-contain', className)}
      {...props}
    />
  );
}
