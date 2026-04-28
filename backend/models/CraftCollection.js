import mongoose from 'mongoose';

const craftCollectionSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArtisanProfile',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    coverImage: {
        type: String
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

craftCollectionSchema.index({ artisan: 1, isActive: 1 });

const CraftCollection = mongoose.model('CraftCollection', craftCollectionSchema);
export default CraftCollection;