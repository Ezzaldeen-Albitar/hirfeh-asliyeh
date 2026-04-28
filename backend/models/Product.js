import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const productSchema = new Schema(
  {
    artisan: {
      type: Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title must not exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [3000, 'Description must not exceed 3000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.5, 'Price must be at least 0.5'],
    },
    currency: { type: String, default: 'JOD' },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'فخار وخزف',
        'تطريز ونسيج',
        'نجارة وخشب',
        'زجاج مزخرف',
        'جلديات',
        'مجوهرات يدوية',
        'فسيفساء',
        'صابون وعطور',
        'سلال وقش',
        'أخرى',
      ],
    },
    tags: [String],
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: (v) => v.length >= 1,
        message: 'At least one image is required',
      },
    },
    thumbnailIndex: { type: Number, default: 0 },
    productType: {
      type: String,
      enum: ['ready-made', 'made-to-order'],
      required: [true, 'Product type is required'],
    },
    stock: { type: Number, default: 1, min: 0 },
    leadTimeDays: Number,
    materials: [String],
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
    },
    weight: Number,
    allowsCustomization: { type: Boolean, default: false },
    customizationOptions: {
      colors: [String],
      sizes: [String],
      engravingAllowed: { type: Boolean, default: false },
      maxCharsEngraving: Number,
      notes: String,
    },
    originStory: { type: Schema.Types.ObjectId, ref: 'OriginStory' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    searchKeywords: [String],
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text', tags: 'text', searchKeywords: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ artisan: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

productSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isModified('tags') || this.isModified('category')) {
    const keywords = [
      ...this.title.toLowerCase().split(' '),
      ...(this.tags || []).map(t => t.toLowerCase()),
      this.category.toLowerCase(),
    ];
    this.searchKeywords = [...new Set(keywords)].filter(k => k.length > 1);
  }
  next();
});

export default model('Product', productSchema);