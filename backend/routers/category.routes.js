const express = require('express');
const categoryRouter = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/authorizeRole');

categoryRouter.get('/', getAllCategories);
categoryRouter.post('/', auth, authorizeRole('admin'), createCategory);
categoryRouter.put('/:id', auth, authorizeRole('admin'), updateCategory);
categoryRouter.delete('/:id', auth, authorizeRole('admin'), deleteCategory);

module.exports = categoryRouter;
