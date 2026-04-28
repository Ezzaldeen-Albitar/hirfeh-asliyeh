import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const workshopSessionSchema = new Schema(
    {
        artisan: {
            type: Schema.Types.ObjectId,
            ref: 'ArtisanProfile',
            required: true,
        },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        category: String,
        coverImage: String,
        images: [String],
        locationType: {
            type: String,
            enum: ['physical', 'online'],
            default: 'physical',
        },
        location: {
            address: String,
            city: String,
            governorate: String,
            coordinates: {
                lat: Number,
                lng: Number,
            },
            meetingLink: String,
        },
        schedule: {
            date: Date,
            startTime: String,
            endTime: String,
            durationMins: Number,
        },
        capacity: {
            type: Number,
            required: [true, 'Capacity is required'],
            min: 1,
        },
        bookedCount: { type: Number, default: 0 },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        currency: { type: String, default: 'JOD' },
        includes: [String],
        requirements: [String],
        skillLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'all'],
            default: 'all',
        },
        status: {
            type: String,
            enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming',
        },
    },
    { timestamps: true }
);

workshopSessionSchema.index({ artisan: 1, status: 1 });
workshopSessionSchema.index({ 'schedule.date': 1 });
export default model('WorkshopSession', workshopSessionSchema);