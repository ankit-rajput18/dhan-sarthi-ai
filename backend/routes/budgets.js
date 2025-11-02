const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

// Get budget for a specific month/year
router.get('/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Validate parameters
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid year or month' });
    }
    
    const budget = await Budget.findOne({
      user: req.user.id,
      year: parseInt(year),
      month: parseInt(month)
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json({ budget });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all budgets for a user
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id })
      .sort({ year: -1, month: -1 })
      .limit(12); // Limit to last 12 months
    
    res.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update budget for a specific month/year
router.post('/', auth, async (req, res) => {
  try {
    const { month, year, categories } = req.body;
    
    // Validate input
    if (!month || !year || !categories) {
      return res.status(400).json({ message: 'Month, year, and categories are required' });
    }
    
    // Validate month and year
    if (isNaN(month) || month < 1 || month > 12 || isNaN(year)) {
      return res.status(400).json({ message: 'Invalid month or year' });
    }
    
    // Validate categories
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'Categories must be a non-empty array' });
    }
    
    // Validate each category
    for (const category of categories) {
      if (!category.name || isNaN(category.amount) || category.amount < 0) {
        return res.status(400).json({ message: 'Each category must have a valid name and non-negative amount' });
      }
    }
    
    // Check if budget already exists
    let budget = await Budget.findOne({
      user: req.user.id,
      year: parseInt(year),
      month: parseInt(month)
    });
    
    if (budget) {
      // Update existing budget
      budget.categories = categories;
      await budget.save();
    } else {
      // Create new budget
      budget = new Budget({
        user: req.user.id,
        month: parseInt(month),
        year: parseInt(year),
        categories
      });
      await budget.save();
    }
    
    res.json({ budget });
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update specific category in budget
router.put('/:year/:month/category/:categoryName', auth, async (req, res) => {
  try {
    const { year, month, categoryName } = req.params;
    const { amount } = req.body;
    
    // Validate parameters
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12 || !categoryName) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }
    
    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number' });
    }
    
    // Find budget
    let budget = await Budget.findOne({
      user: req.user.id,
      year: parseInt(year),
      month: parseInt(month)
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    // Find category index
    const categoryIndex = budget.categories.findIndex(c => c.name === categoryName);
    
    if (categoryIndex === -1) {
      // Add new category
      budget.categories.push({ name: categoryName, amount: parseFloat(amount) });
    } else {
      // Update existing category
      budget.categories[categoryIndex].amount = parseFloat(amount);
    }
    
    await budget.save();
    
    res.json({ budget });
  } catch (error) {
    console.error('Error updating budget category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete budget for a specific month/year
router.delete('/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Validate parameters
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid year or month' });
    }
    
    const budget = await Budget.findOneAndDelete({
      user: req.user.id,
      year: parseInt(year),
      month: parseInt(month)
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;