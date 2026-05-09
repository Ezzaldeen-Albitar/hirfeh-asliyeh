import { DEFAULT_ARTISAN_COVER } from '@/lib/imageUtils';

const CRAFT_COVER_IMAGES = {
  'السيراميك': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=75',
  'النسيج': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=75',
  'التطريز': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=75',
  'الفسيفساء': 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/465d6c152336785.631c38da7b8fa.png',
  'الفخار': 'https://hura7.com/wp-content/uploads/2024/02/see_smell_savour_sensory_exploration_tri_2023_nov_19_cultural_foundation_86940-full-en1681198550.jpg',
  'المجوهرات': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=75',
  'الخشب': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=75',
  'الزجاج': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=75',
  'الجلديات': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=75',
  'الصابون والعطور': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1200&q=75',
  'السلال والقش': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&q=75',
  'أخرى': DEFAULT_ARTISAN_COVER,
};

const CRAFT_ALIASES = {
  السيراميك: 'السيراميك',
  'فخار وخزف': 'السيراميك',
  الفخار: 'الفخار',
  النسيج: 'النسيج',
  'تطريز ونسيج': 'النسيج',
  التطريز: 'التطريز',
  الفسيفساء: 'الفسيفساء',
  'مجوهرات يدوية': 'المجوهرات',
  المجوهرات: 'المجوهرات',
  'نجارة وخشب': 'الخشب',
  الخشب: 'الخشب',
  'زجاج مزخرف': 'الزجاج',
  الزجاج: 'الزجاج',
  الجلديات: 'الجلديات',
  'صابون وعطور': 'الصابون والعطور',
  'سلال وقش': 'السلال والقش',
  أخرى: 'أخرى',
};

export function normalizeArtisanCraft(craftSpecialty) {
  if (typeof craftSpecialty !== 'string') return '';
  const value = craftSpecialty.trim();
  return CRAFT_ALIASES[value] || value;
}

export function getDefaultArtisanCoverImage(craftSpecialty) {
  const normalizedCraft = normalizeArtisanCraft(craftSpecialty);
  return CRAFT_COVER_IMAGES[normalizedCraft] || DEFAULT_ARTISAN_COVER;
}

export function getArtisanCoverSrc(coverImage, craftSpecialty, fallback = DEFAULT_ARTISAN_COVER) {
  if (typeof coverImage === 'string' && coverImage.trim()) {
    return coverImage;
  }

  const craftCover = getDefaultArtisanCoverImage(craftSpecialty);
  return craftCover || fallback;
}
