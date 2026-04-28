import mongoose from 'mongoose';

const workshopSessionSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArtisanProfile',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: String,
    coverImage: String,
    images: [String],
    locationType: {
        type: String,
        enum: ["physical", "online"],
        default: "physical"
    },
    location: {
        address: String,
        city: String,
        governorate: String,
        coordinates: {
            lat: Number,
            lng: Number
        },
        meetingLink: String
    },
    schedule: {
        date: Date,
        startTime: String,
        endTime: String,
        durationMins: Number
    },
    capacity: {
        type: Number,
        required: true
    },
    bookedCount: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "JOD"
    },
    includes: [String],
    requirements: [String],
    skillLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "all"]
    },
    status: {
        type: String,
        enum: ["draft", "upcoming", "ongoing", "completed", "cancelled"],
        default: "upcoming"
    }
}, { timestamps: true });

const WorkshopSession = mongoose.model('WorkshopSession', workshopSessionSchema);
export default WorkshopSession;