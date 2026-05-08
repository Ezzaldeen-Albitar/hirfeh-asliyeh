export const PRODUCT_CATEGORY_OPTIONS = [
  { value: 'السيراميك', label: 'السيراميك' },
  { value: 'تطريز ونسيج', label: 'تطريز ونسيج' },
  { value: 'فسيفساء', label: 'فسيفساء' },
  { value: 'مجوهرات يدوية', label: 'مجوهرات يدوية' },
  { value: 'نجارة وخشب', label: 'نجارة وخشب' },
  { value: 'زجاج مزخرف', label: 'زجاج مزخرف' },
  { value: 'جلديات', label: 'جلديات' },
  { value: 'صابون وعطور', label: 'صابون وعطور' },
  { value: 'سلال وقش', label: 'سلال وقش' },
  { value: 'أخرى', label: 'أخرى' },
];

export const GOVERNORATE_OPTIONS = [
  { value: 'عمّان', label: 'عمّان' },
  { value: 'إربد', label: 'إربد' },
  { value: 'الزرقاء', label: 'الزرقاء' },
  { value: 'البلقاء', label: 'البلقاء' },
  { value: 'السلط', label: 'السلط' },
  { value: 'مأدبا', label: 'مأدبا' },
  { value: 'الكرك', label: 'الكرك' },
  { value: 'العقبة', label: 'العقبة' },
  { value: 'جرش', label: 'جرش' },
  { value: 'عجلون', label: 'عجلون' },
  { value: 'معان', label: 'معان' },
  { value: 'الطفيلة', label: 'الطفيلة' },
];

const CATEGORY_ALIASES = {
  'السيراميك': 'السيراميك',
  'فخار وخزف': 'السيراميك',
  السيراميك: 'السيراميك',
  الفخار: 'السيراميك',
  Pottery: 'السيراميك',
  'تطريز ونسيج': 'تطريز ونسيج',
  التطريز: 'تطريز ونسيج',
  النسيج: 'تطريز ونسيج',
  Embroidery: 'تطريز ونسيج',
  'نجارة وخشب': 'نجارة وخشب',
  الخشب: 'نجارة وخشب',
  'زجاج مزخرف': 'زجاج مزخرف',
  الزجاج: 'زجاج مزخرف',
  جلديات: 'جلديات',
  'مجوهرات يدوية': 'مجوهرات يدوية',
  المجوهرات: 'مجوهرات يدوية',
  فسيفساء: 'فسيفساء',
  Mosaic: 'فسيفساء',
  'صابون وعطور': 'صابون وعطور',
  'سلال وقش': 'سلال وقش',
  أخرى: 'أخرى',
};

const REGION_ALIASES = {
  'عمّان': 'عمّان',
  عمان: 'عمّان',
  Amman: 'عمّان',
  إربد: 'إربد',
  اربد: 'إربد',
  Irbid: 'إربد',
  الكرك: 'الكرك',
  Karak: 'الكرك',
  مأدبا: 'مأدبا',
  مادبا: 'مأدبا',
  Madaba: 'مأدبا',
  العقبة: 'العقبة',
  Aqaba: 'العقبة',
  الزرقاء: 'الزرقاء',
  Zarqa: 'الزرقاء',
  البلقاء: 'البلقاء',
  Balqa: 'البلقاء',
  السلط: 'السلط',
  Salt: 'السلط',
  جرش: 'جرش',
  Jerash: 'جرش',
  عجلون: 'عجلون',
  Ajloun: 'عجلون',
  معان: 'معان',
  Maan: 'معان',
  الطفيلة: 'الطفيلة',
  Tafila: 'الطفيلة',
};

export function normalizeProductCategory(value) {
  if (!value) return '';
  return CATEGORY_ALIASES[value] || value;
}

export function normalizeRegion(value) {
  if (!value) return '';
  return REGION_ALIASES[value] || value;
}
