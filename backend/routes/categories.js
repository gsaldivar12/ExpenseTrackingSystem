const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Category name is required and must be less than 50 characters'),
  body('icon').optional().isLength({ max: 10 }).withMessage('Icon must be less than 10 characters'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Please enter a valid hex color'),
  body('description').optional().isLength({ max: 200 }).withMessage('Description must be less than 200 characters'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, icon, color, description, budget } = req.body;

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({ name, user: req.user._id });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      icon: icon || '💰',
      color: color || '#3B82F6',
      description,
      budget: budget || 0
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories
// @desc    Get all categories for the user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id, isActive: true })
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category name must be less than 50 characters'),
  body('icon').optional().isLength({ max: 10 }).withMessage('Icon must be less than 10 characters'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Please enter a valid hex color'),
  body('description').optional().isLength({ max: 200 }).withMessage('Description must be less than 200 characters'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if name is being changed and if it already exists
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: req.body.name, 
        user: req.user._id,
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category (soft delete by setting isActive to false)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Soft delete by setting isActive to false
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/default/list
// @desc    Get default categories (for new users)
// @access  Private
router.get('/default/list', async (req, res) => {
  try {
    const defaultCategories = [
      { name: 'Food & Dining', icon: '🍽️', color: '#EF4444', description: 'Restaurants, groceries, and dining out' },
      { name: 'Transportation', icon: '🚗', color: '#3B82F6', description: 'Gas, public transport, and vehicle expenses' },
      { name: 'Shopping', icon: '🛍️', color: '#8B5CF6', description: 'Clothing, electronics, and general shopping' },
      { name: 'Entertainment', icon: '🎬', color: '#EC4899', description: 'Movies, games, and leisure activities' },
      { name: 'Healthcare', icon: '🏥', color: '#10B981', description: 'Medical expenses and health-related costs' },
      { name: 'Utilities', icon: '⚡', color: '#F59E0B', description: 'Electricity, water, internet, and phone bills' },
      { name: 'Housing', icon: '🏠', color: '#6366F1', description: 'Rent, mortgage, and home maintenance' },
      { name: 'Education', icon: '📚', color: '#06B6D4', description: 'Books, courses, and educational expenses' },
      { name: 'Travel', icon: '✈️', color: '#84CC16', description: 'Vacations, business trips, and travel expenses' },
      { name: 'Other', icon: '📦', color: '#6B7280', description: 'Miscellaneous expenses' }
    ];

    res.json(defaultCategories);
  } catch (error) {
    console.error('Get default categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories/import-defaults
// @desc    Import default categories for a new user
// @access  Private
router.post('/import-defaults', async (req, res) => {
  try {
    const defaultCategories = [
      { name: 'Food & Dining', icon: '🍽️', color: '#EF4444', description: 'Restaurants, groceries, and dining out' },
      { name: 'Transportation', icon: '🚗', color: '#3B82F6', description: 'Gas, public transport, and vehicle expenses' },
      { name: 'Shopping', icon: '🛍️', color: '#8B5CF6', description: 'Clothing, electronics, and general shopping' },
      { name: 'Entertainment', icon: '🎬', color: '#EC4899', description: 'Movies, games, and leisure activities' },
      { name: 'Healthcare', icon: '🏥', color: '#10B981', description: 'Medical expenses and health-related costs' },
      { name: 'Utilities', icon: '⚡', color: '#F59E0B', description: 'Electricity, water, internet, and phone bills' },
      { name: 'Housing', icon: '🏠', color: '#6366F1', description: 'Rent, mortgage, and home maintenance' },
      { name: 'Education', icon: '📚', color: '#06B6D4', description: 'Books, courses, and educational expenses' },
      { name: 'Travel', icon: '✈️', color: '#84CC16', description: 'Vacations, business trips, and travel expenses' },
      { name: 'Other', icon: '📦', color: '#6B7280', description: 'Miscellaneous expenses' }
    ];

    // Check if user already has categories
    const existingCategories = await Category.find({ user: req.user._id });
    if (existingCategories.length > 0) {
      return res.status(400).json({ message: 'User already has categories' });
    }

    // Create default categories for the user
    const categoriesToCreate = defaultCategories.map(cat => ({
      ...cat,
      user: req.user._id
    }));

    const createdCategories = await Category.insertMany(categoriesToCreate);

    res.status(201).json(createdCategories);
  } catch (error) {
    console.error('Import default categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 