/**
 * Media Proxy Utilities
 * 
 * Helper functions to generate URLs for Telegram media through the proxy endpoint.
 * This prevents exposing bot tokens to the frontend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get proxied media URL for a media asset
 * @param mediaId - Internal MediaAsset ID from database
 * @returns Full URL to proxied media
 */
export function getMediaProxyUrl(mediaId: number | string): string {
  if (!mediaId) {
    return '';
  }
  return `${API_BASE_URL}/media-proxy/public/${mediaId}`;
}

/**
 * Get proxied image URL with optional size parameters
 * @param mediaId - Internal MediaAsset ID
 * @param size - Optional size parameter (not implemented yet, for future use)
 * @returns Full URL to proxied image
 */
export function getImageProxyUrl(mediaId: number | string, _size?: 'thumbnail' | 'medium' | 'full'): string {
  const baseUrl = getMediaProxyUrl(mediaId);
  
  // Future: Add size parameter support
  // if (_size) {
  //   return `${baseUrl}?size=${_size}`;
  // }
  
  return baseUrl;
}

/**
 * Preload an image through the proxy
 * @param mediaId - Internal MediaAsset ID
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(mediaId: number | string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image ${mediaId}`));
    img.src = getImageProxyUrl(mediaId);
  });
}

/**
 * Check if media URL is a proxy URL
 * @param url - URL to check
 * @returns true if URL is a proxy URL
 */
export function isProxyUrl(url: string): boolean {
  return url.includes('/media-proxy/');
}

/**
 * Extract media ID from proxy URL
 * @param url - Proxy URL
 * @returns Media ID or null if not a proxy URL
 */
export function extractMediaIdFromUrl(url: string): number | null {
  const match = url.match(/\/media-proxy\/(?:public\/)?(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
