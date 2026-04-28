const categoryModel = require('../models/category');

const getAllCategories = async (req, res) => {
    try {
        const allCategories = await categoryModel.find({}).populate({ path: 'createdBy', select: '-password', populate: { path: 'role' } });
        if (allCategories.length === 0) {
            return res.status(200).json({ success: true, message: "No categories found in the database", data: [] });
        }
        res.status(200).json({ success: true, message: "All categories fetched successfully", data: allCategories });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

const createCategory = async (req, res) => {
    const { title, description, imageUrl } = req.body;
    try {
        const newCategory = new categoryModel({ title, description, imageUrl, createdBy: req.user.id });
        const savedCategory = await newCategory.save();
        res.status(201).json({ success: true, message: "The Category has been created", data: savedCategory });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await categoryModel.findById(id).populate('createdBy', '-password');
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        const { createdBy, ...safeBody } = req.body;
        Object.assign(category, safeBody);
        await category.save();
        res.status(200).json({ success: true, message: "Category updated successfully", data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await categoryModel.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
