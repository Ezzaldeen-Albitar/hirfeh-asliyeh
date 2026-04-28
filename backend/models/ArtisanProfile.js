import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const artisanProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    craftName: {
      type: String,
      required: [true, 'Craft name is required'],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      maxlength: [1000, 'Bio must not exceed 1000 characters'],
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      enum: ['عمّان', 'إربد', 'الكرك', 'مأدبا', 'العقبة', 'الزرقاء', 'السلط', 'جرش', 'عجلون', 'معان', 'الطفيلة', 'البلقاء'],
    },
    specialties: [String], 
    profileImage: String,  
    coverImage: String,   
    socialLinks: {
      instagram: String,
      facebook: String,
      whatsapp: String,
    },
    yearsOfExperience: Number,
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verificationDocs: [String],
    rejectionReason: String,
    badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
    acceptsCustomOrders: { type: Boolean, default: true },
    acceptsWorkshops: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

artisanProfileSchema.index({ region: 1, isVerified: 1 });
artisanProfileSchema.index({ rating: -1 });
artisanProfileSchema.index({ user: 1 });

export default model('ArtisanProfile', artisanProfileSchema);
