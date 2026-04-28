import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    imageUrl: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;