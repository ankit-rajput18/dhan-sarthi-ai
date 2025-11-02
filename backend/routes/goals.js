const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/goals
// @desc    Get all goals for a user
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, status, category, priority } = req.query;
    const userId = req.user._id;

    // Build filter object
    const filter = { user: userId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get goals with pagination
    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    // Get total count for pagination
    const total = await Goal.countDocuments(filter);

    res.json({
      goals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalGoals: total,
        hasNext: skip + goals.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error while fetching goals' });
  }
});

// @route   GET /api/goals/:id
// @desc    Get single goal
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email');

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ goal });

  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ message: 'Server error while fetching goal' });
  }
});

// @route   POST /api/goals
// @desc    Create new goal
// @access  Private
router.post('/', [
  auth,
  body('name').isString().notEmpty().withMessage('Goal name is required'),
  body('targetAmount').isFloat({ min: 0 }).withMessage('Target amount must be a positive number'),
  body('currentAmount').optional().isFloat({ min: 0 }).withMessage('Current amount must be positive'),
  body('deadline').isISO8601().withMessage('Deadline must be a valid date'),
  body('category').isIn(['vehicle', 'home', 'travel', 'education', 'health', 'technology', 'luxury', 'hobby', 'business', 'emergency']).withMessage('Invalid category'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      targetAmount,
      currentAmount,
      deadline,
      category,
      description,
      priority,
      tags
    } = req.body;

    // Create goal
    const goal = new Goal({
      user: req.user._id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: new Date(deadline),
      category,
      description,
      priority: priority || 'medium',
      tags: tags || []
    });

    await goal.save();
    await goal.populate('user', 'name email');

    res.status(201).json({
      message: 'Goal created successfully',
      goal
    });

  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error while creating goal' });
  }
});

// @route   PUT /api/goals/:id
// @desc    Update goal
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().isString().notEmpty().withMessage('Goal name cannot be empty'),
  body('targetAmount').optional().isFloat({ min: 0 }).withMessage('Target amount must be positive'),
  body('currentAmount').optional().isFloat({ min: 0 }).withMessage('Current amount must be positive'),
  body('deadline').optional().isISO8601().withMessage('Deadline must be a valid date'),
  body('category').optional().isIn(['vehicle', 'home', 'travel', 'education', 'health', 'technology', 'luxury', 'hobby', 'business', 'emergency']).withMessage('Invalid category'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Update fields
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.targetAmount !== undefined) updateData.targetAmount = req.body.targetAmount;
    if (req.body.currentAmount !== undefined) updateData.currentAmount = req.body.currentAmount;
    if (req.body.deadline) updateData.deadline = new Date(req.body.deadline);
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.priority) updateData.priority = req.body.priority;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.tags) updateData.tags = req.body.tags;

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json({
      message: 'Goal updated successfully',
      goal: updatedGoal
    });

  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error while updating goal' });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete goal
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });

  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error while deleting goal' });
  }
});

// @route   PUT /api/goals/:id/amount
// @desc    Update current amount for a goal
// @access  Private
router.put('/:id/amount', [
  auth,
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const { amount } = req.body;
    
    // Update current amount
    await goal.updateCurrentAmount(amount);

    await goal.populate('user', 'name email');

    res.json({
      message: 'Goal amount updated successfully',
      goal
    });

  } catch (error) {
    console.error('Update goal amount error:', error);
    res.status(500).json({ message: 'Server error while updating goal amount' });
  }
});

// @route   GET /api/goals/stats/summary
// @desc    Get goal summary statistics
// @access  Private
router.get('/stats/summary', [
  auth,
  query('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user._id;

    // Build filter object
    const filter = { user: userId };
    if (status) filter.status = status;

    // Get goal statistics
    const [goalStats, categoryStats, priorityStats] = await Promise.all([
      Goal.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          totalGoals: { $sum: 1 },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' },
          avgProgress: { $avg: '$progressPercentage' }
        }}
      ]),
      Goal.aggregate([
        { $match: filter },
        { $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' }
        }},
        { $sort: { totalTargetAmount: -1 } }
      ]),
      Goal.aggregate([
        { $match: filter },
        { $group: {
          _id: '$priority',
          count: { $sum: 1 },
          totalTargetAmount: { $sum: '$targetAmount' },
          totalCurrentAmount: { $sum: '$currentAmount' }
        }}
      ])
    ]);

    const stats = goalStats[0] || {
      totalGoals: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      avgProgress: 0
    };

    res.json({
      summary: {
        totalGoals: stats.totalGoals,
        totalTargetAmount: stats.totalTargetAmount,
        totalCurrentAmount: stats.totalCurrentAmount,
        avgProgress: Math.round(stats.avgProgress * 100) / 100,
        totalRemainingAmount: stats.totalTargetAmount - stats.totalCurrentAmount
      },
      categoryBreakdown: categoryStats,
      priorityBreakdown: priorityStats
    });

  } catch (error) {
    console.error('Get goal stats error:', error);
    res.status(500).json({ message: 'Server error while fetching goal statistics' });
  }
});

module.exports = router;