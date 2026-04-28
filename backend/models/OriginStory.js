import mongoose from 'mongoose';

const originStorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true
    },
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArtisanProfile',
        required: true
    },
    origin: {
        region: {
            type: String,
            required: true
        },
        village: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    craftingProcess: {
        type: String,
        required: true,
        minlength: 100
    },
    materialsSource: {
        type: String,
        required: true
    },
    culturalSignificance: {
        type: String,
        required: true
    },
    artisanPersonalNote: String,
    processImages: [String],
    processVideoUrl: String,
    estimatedCraftingTime: String,
    generationsTaught: String,
    certificateNumber: String,
    issuedAt: Date,
    certIsVisible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const OriginStory = mongoose.model('OriginStory', originStorySchema);
export default OriginStory;