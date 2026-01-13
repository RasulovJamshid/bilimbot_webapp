import { useState, useEffect } from 'react';
import { getImageProxyUrl } from '../utils/mediaProxy';

interface ProxiedImageProps {
  mediaId: number | string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

/**
 * ProxiedImage Component
 * 
 * Displays images from Telegram through the secure proxy endpoint.
 * Automatically handles loading states and errors.
 * 
 * @example
 * <ProxiedImage 
 *   mediaId={123} 
 *   alt="Course thumbnail"
 *   className="w-full h-48 object-cover"
 * />
 */
export function ProxiedImage({
  mediaId,
  alt = '',
  className = '',
  style,
  onLoad,
  onError,
  fallbackSrc = '/placeholder-image.png',
}: ProxiedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!mediaId) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setImageSrc(getImageProxyUrl(mediaId));
  }, [mediaId]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallbackSrc);
    onError?.();
  };

  if (!mediaId && !fallbackSrc) {
    return null;
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        src={imageSrc || fallbackSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <span>Image not available</span>
        </div>
      )}
    </div>
  );
}

/**
 * ProxiedBackgroundImage Component
 * 
 * Displays a background image from Telegram through the proxy.
 * Useful for hero sections, cards, etc.
 */
interface ProxiedBackgroundImageProps {
  mediaId: number | string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function ProxiedBackgroundImage({
  mediaId,
  children,
  className = '',
  style,
  overlay = false,
  overlayOpacity = 0.5,
}: ProxiedBackgroundImageProps) {
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');

  useEffect(() => {
    if (mediaId) {
      setBackgroundUrl(getImageProxyUrl(mediaId));
    }
  }, [mediaId]);

  const backgroundStyle: React.CSSProperties = {
    ...style,
    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className={`relative ${className}`} style={backgroundStyle}>
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
