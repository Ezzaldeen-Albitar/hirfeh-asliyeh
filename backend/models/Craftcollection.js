import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const craftCollectionSchema = new Schema(
    {
        artisan: {
            type: Schema.Types.ObjectId,
            ref: 'ArtisanProfile',
            required: [true, 'Artisan is required'],
        },
        name: {
            type: String,
            required: [true, 'Collection name is required'],
            trim: true,
            minlength: [3, 'Name must be at least 3 characters'],
            maxlength: [100, 'Name must not exceed 100 characters'],
        },
        nameAr: {
            type: String,
            trim: true,
            maxlength: [100, 'Arabic name must not exceed 100 characters'],
        },
        description: {
            type: String,
            maxlength: [1000, 'Description must not exceed 1000 characters'],
        },
        coverImage: {
            type: String,
        },
        isActive: { type: Boolean, default: true },
        productCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);
craftCollectionSchema.index({ artisan: 1, isActive: 1 });
craftCollectionSchema.index({ createdAt: -1 });

export default model('CraftCollection', craftCollectionSchema);