import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArtisanProfile',
        required: true
    },
    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CraftCollection'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 120
    },
    description: {
        type: String,
        required: true,
        maxlength: 3000
    },
    price: {
        type: Number,
        required: true,
        min: 0.5
    },
    currency: {
        type: String,
        default: "JOD"
    },
    tags: [String],
    images: {
        type: [String],
        required: true
    },
    thumbnailIndex: {
        type: Number,
        default: 0
    },
    productType: {
        type: String,
        enum: ["ready-made", "made-to-order"],
        required: true
    },
    stock: {
        type: Number,
        default: 1,
        min: 0
    },
    leadTimeDays: Number,
    materials: [String],
    dimensions: {
        width: Number,
        height: Number,
        depth: Number
    },
    weight: Number,
    allowsCustomization: {
        type: Boolean,
        default: false
    },
    customizationOptions: {
        colors: [String],
        sizes: [String],
        engravingAllowed: { type: Boolean, default: false },
        maxCharsEngraving: Number,
        notes: String
    },
    originStory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OriginStory'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    salesCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    searchKeywords: [String]
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text', tags: 'text', searchKeywords: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ artisan: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ rating: -1 });

productSchema.pre('save', function (next) {
    if (this.isModified('title') || this.isModified('tags')) {
        const keywords = new Set();
        this.title.toLowerCase().split(' ').forEach(word => keywords.add(word));
        this.tags.forEach(tag => keywords.add(tag.toLowerCase()));
        this.searchKeywords = Array.from(keywords);
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;