import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const originStorySchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    artisan: {
      type: Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
      required: true,
    },
    origin: {
      region: { type: String, required: true },
      village: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    craftingProcess: {
      type: String,
      required: [true, 'Crafting process description is required'],
      minlength: [100, 'Please provide a detailed crafting process (min 100 chars)'],
    },
    materialsSource: {
      type: String,
      required: [true, 'Materials source is required'],
    },
    culturalSignificance: {
      type: String,
      required: [true, 'Cultural significance is required'],
    },
    artisanPersonalNote: String,
    processImages: [String],
    processVideoUrl: String,
    estimatedCraftingTime: String,
    generationsTaught: String,
    certificateNumber: {
      type: String,
      unique: true,
    },
    issuedAt: Date,
    certIsVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);
originStorySchema.pre('save', function (next) {
  if (!this.certificateNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.certificateNumber = `HA-${year}-${random}`;
    this.issuedAt = new Date();
  }
  next();
});

export default model('OriginStory', originStorySchema);
