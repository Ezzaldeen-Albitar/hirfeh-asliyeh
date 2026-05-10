export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=75';
export const DEFAULT_WORKSHOP_IMAGE = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=75';
export const DEFAULT_ARTISAN_AVATAR = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=70';
export const DEFAULT_ARTISAN_COVER = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=75';

function getApiOrigin() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return apiUrl.replace(/\/api\/?$/, '');
}

function isBrokenPlaceholder(src) {
  try {
    return new URL(src).hostname === 'placehold.co';
  } catch {
    return false;
  }
}

export function getSafeImageSrc(src, fallback = DEFAULT_PRODUCT_IMAGE) {
  if (typeof src !== 'string') return fallback;

  const value = src.trim();
  if (!value || isBrokenPlaceholder(value)) return fallback;

  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  if (normalizedPath.startsWith('/uploads/')) {
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}${normalizedPath}` : normalizedPath;
  }

  return value;
}

export function getPrimaryImageSrc(images, fallback = DEFAULT_PRODUCT_IMAGE) {
  if (Array.isArray(images)) {
    const firstValidImage = images.find((image) => typeof image === 'string' && image.trim());
    if (firstValidImage) return getSafeImageSrc(firstValidImage, fallback);
  }
  return fallback;
}

export function setImageFallback(event, fallback = DEFAULT_PRODUCT_IMAGE) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallback;
}
