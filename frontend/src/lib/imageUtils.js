export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=75';
export const DEFAULT_ARTISAN_AVATAR = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=70';
export const DEFAULT_ARTISAN_COVER = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=75';

export function getSafeImageSrc(src, fallback = DEFAULT_PRODUCT_IMAGE) {
  return typeof src === 'string' && src.trim() ? src : fallback;
}

export function getPrimaryImageSrc(images, fallback = DEFAULT_PRODUCT_IMAGE) {
  if (Array.isArray(images)) {
    const firstValidImage = images.find((image) => typeof image === 'string' && image.trim());
    if (firstValidImage) return firstValidImage;
  }
  return fallback;
}
