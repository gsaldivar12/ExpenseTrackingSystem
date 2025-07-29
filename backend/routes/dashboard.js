const express = require('express');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary data
// @access  Private
router.get('/summary', async (req, res) => {
  try {
    const { period = 'current-month' } = req.query;
    
    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'current-week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Get expenses for the period
    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('category', 'name icon color');

    // Calculate totals
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expenseCount = expenses.length;

    // Get category breakdown
    const categoryTotals = {};
    const categoryCounts = {};
    
    expenses.forEach(expense => {
      const categoryName = expense.category.name;
      categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount;
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    // Get user's monthly budget
    const user = await require('../models/User').findById(req.user._id);
    const monthlyBudget = user.monthlyBudget || 0;

    // Calculate budget utilization
    const budgetUtilization = monthlyBudget > 0 ? (totalAmount / monthlyBudget) * 100 : 0;

    // Get recent expenses (last 5)
    const recentExpenses = await Expense.find({ user: req.user._id })
      .populate('category', 'name icon color')
      .sort({ date: -1 })
      .limit(5);

    // Get top spending categories
    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    res.json({
      period: {
        start: startDate,
        end: endDate,
        type: period
      },
      summary: {
        totalAmount,
        expenseCount,
        monthlyBudget,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100
      },
      categoryBreakdown: categoryTotals,
      categoryCounts,
      topCategories,
      recentExpenses
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/charts
// @desc    Get chart data for dashboard
// @access  Private
router.get('/charts', async (req, res) => {
  try {
    const { period = 'current-month' } = req.query;
    
    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'current-week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('category', 'name icon color');

    // Daily spending trend
    const dailyData = {};
    expenses.forEach(expense => {
      const date = expense.date.toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + expense.amount;
    });

    // Category pie chart data
    const categoryData = {};
    expenses.forEach(expense => {
      const categoryName = expense.category.name;
      categoryData[categoryName] = (categoryData[categoryName] || 0) + expense.amount;
    });

    // Payment method breakdown
    const paymentMethodData = {};
    expenses.forEach(expense => {
      paymentMethodData[expense.paymentMethod] = (paymentMethodData[expense.paymentMethod] || 0) + expense.amount;
    });

    res.json({
      dailyTrend: Object.entries(dailyData).map(([date, amount]) => ({ date, amount })),
      categoryBreakdown: Object.entries(categoryData).map(([name, amount]) => ({ name, amount })),
      paymentMethodBreakdown: Object.entries(paymentMethodData).map(([method, amount]) => ({ method, amount }))
    });
  } catch (error) {
    console.error('Dashboard charts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/insights
// @desc    Get spending insights and recommendations
// @access  Private
router.get('/insights', async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Get current month expenses
    const currentMonthExpenses = await Expense.find({
      user: req.user._id,
      date: { $gte: currentMonthStart }
    });

    // Get last month expenses
    const lastMonthExpenses = await Expense.find({
      user: req.user._id,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });

    const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate percentage change
    const percentageChange = lastMonthTotal > 0 
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    // Get user's budget
    const user = await require('../models/User').findById(req.user._id);
    const monthlyBudget = user.monthlyBudget || 0;

    // Generate insights
    const insights = [];

    if (monthlyBudget > 0) {
      const budgetUtilization = (currentMonthTotal / monthlyBudget) * 100;
      
      if (budgetUtilization > 90) {
        insights.push({
          type: 'warning',
          title: 'Budget Alert',
          message: `You've used ${Math.round(budgetUtilization)}% of your monthly budget. Consider reducing expenses.`
        });
      } else if (budgetUtilization > 75) {
        insights.push({
          type: 'info',
          title: 'Budget Notice',
          message: `You've used ${Math.round(budgetUtilization)}% of your monthly budget.`
        });
      }
    }

    if (percentageChange > 20) {
      insights.push({
        type: 'warning',
        title: 'Spending Increase',
        message: `Your spending is ${Math.round(percentageChange)}% higher than last month.`
      });
    } else if (percentageChange < -20) {
      insights.push({
        type: 'success',
        title: 'Great Job!',
        message: `Your spending is ${Math.round(Math.abs(percentageChange))}% lower than last month.`
      });
    }

    // Find highest spending day
    const dailyTotals = {};
    currentMonthExpenses.forEach(expense => {
      const date = expense.date.toISOString().split('T')[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + expense.amount;
    });

    const highestSpendingDay = Object.entries(dailyTotals)
      .sort(([,a], [,b]) => b - a)[0];

    if (highestSpendingDay) {
      insights.push({
        type: 'info',
        title: 'Highest Spending Day',
        message: `Your highest spending day this month was ${highestSpendingDay[0]} with $${highestSpendingDay[1].toFixed(2)}.`
      });
    }

    res.json({
      currentMonthTotal,
      lastMonthTotal,
      percentageChange: Math.round(percentageChange * 100) / 100,
      insights
    });
  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 