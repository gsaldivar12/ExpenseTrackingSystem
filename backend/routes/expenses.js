const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('paymentMethod').optional().isIn(['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other']).withMessage('Invalid payment method'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
  body('recurringType').optional().isIn(['Daily', 'Weekly', 'Monthly', 'Yearly']).withMessage('Invalid recurring type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      amount,
      category,
      description,
      date,
      paymentMethod,
      location,
      tags,
      isRecurring,
      recurringType
    } = req.body;

    // Verify category exists and belongs to user
    const categoryExists = await Category.findOne({ _id: category, user: req.user._id });
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Clean up empty values
    const cleanData = {
      user: req.user._id,
      title,
      amount,
      category,
      date: date || new Date(),
      paymentMethod: paymentMethod || 'Cash',
      isRecurring: isRecurring || false,
      recurringType: recurringType || 'Monthly'
    };

    // Only add optional fields if they have values
    if (description && description.trim()) {
      cleanData.description = description.trim();
    }
    if (location && location.trim()) {
      cleanData.location = location.trim();
    }
    if (tags && Array.isArray(tags) && tags.length > 0) {
      cleanData.tags = tags.filter(tag => tag && tag.trim());
    }

    const expense = await Expense.create(cleanData);

    const populatedExpense = await Expense.findById(expense._id).populate('category', 'name icon color');

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses
// @desc    Get all expenses with filtering and pagination
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isMongoId().withMessage('Category must be a valid ID'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  query('minAmount').optional().isNumeric().withMessage('Min amount must be a number'),
  query('maxAmount').optional().isNumeric().withMessage('Max amount must be a number'),
  query('paymentMethod').optional().isIn(['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other']).withMessage('Invalid payment method'),
  query('sortBy').optional().isIn(['date', 'amount', 'title']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      paymentMethod,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };

    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const expenses = await Expense.find(filter)
      .populate('category', 'name icon color')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get expense by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id })
      .populate('category', 'name icon color');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be less than 100 characters'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('paymentMethod').optional().isIn(['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other']).withMessage('Invalid payment method'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
  body('recurringType').optional().isIn(['Daily', 'Weekly', 'Monthly', 'Yearly']).withMessage('Invalid recurring type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // If category is being updated, verify it exists
    if (req.body.category) {
      const categoryExists = await Category.findOne({ _id: req.body.category, user: req.user._id });
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Clean up empty values for update
    const updateData = { ...req.body };
    
    // Handle empty strings for optional fields
    if (updateData.description !== undefined) {
      if (!updateData.description || !updateData.description.trim()) {
        updateData.description = undefined; // Remove the field
      } else {
        updateData.description = updateData.description.trim();
      }
    }
    
    if (updateData.location !== undefined) {
      if (!updateData.location || !updateData.location.trim()) {
        updateData.location = undefined; // Remove the field
      } else {
        updateData.location = updateData.location.trim();
      }
    }
    
    if (updateData.tags !== undefined) {
      if (!updateData.tags || !Array.isArray(updateData.tags) || updateData.tags.length === 0) {
        updateData.tags = undefined; // Remove the field
      } else {
        updateData.tags = updateData.tags.filter(tag => tag && tag.trim());
      }
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name icon color');

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses/summary/current-month
// @desc    Get current month expense summary
// @access  Private
router.get('/summary/current-month', async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('category', 'name icon color');

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = {};

    expenses.forEach(expense => {
      const categoryName = expense.category.name;
      categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount;
    });

    res.json({
      totalAmount,
      categoryTotals,
      expenseCount: expenses.length,
      period: {
        start: startOfMonth,
        end: endOfMonth
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 