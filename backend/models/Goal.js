const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Goal name cannot be more than 100 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0, 'Target amount must be positive']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount must be positive']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'vehicle', 'home', 'travel', 'education', 'health', 
      'technology', 'luxury', 'hobby', 'business', 'emergency'
    ]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  // Progress tracking
  progressPercentage: {
    type: Number,
    default: 0
  },
  // Monthly savings target
  monthlySavingsTarget: {
    type: Number,
    default: 0
  },
  // Tags for organization
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, category: 1 });
goalSchema.index({ user: 1, deadline: -1 });
goalSchema.index({ status: 1 });

// Virtual for remaining amount
goalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Virtual for days until deadline
goalSchema.virtual('daysUntilDeadline').get(function() {
  const today = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for months until deadline
goalSchema.virtual('monthsUntilDeadline').get(function() {
  const today = new Date();
  const deadline = new Date(this.deadline);
  const diffMonths = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth());
  return Math.max(0, diffMonths);
});

// Method to calculate progress percentage
goalSchema.methods.calculateProgress = function() {
  if (this.targetAmount <= 0) return 0;
  return Math.min(100, (this.currentAmount / this.targetAmount) * 100);
};

// Method to calculate monthly savings needed
goalSchema.methods.calculateMonthlySavings = function() {
  const monthsLeft = this.monthsUntilDeadline;
  if (monthsLeft <= 0) return this.remainingAmount;
  return this.remainingAmount / monthsLeft;
};

// Pre-save middleware to update calculated fields
goalSchema.pre('save', function(next) {
  // Update progress percentage
  this.progressPercentage = this.calculateProgress();
  
  // Update monthly savings target
  this.monthlySavingsTarget = this.calculateMonthlySavings();
  
  // Update status if goal is completed
  if (this.currentAmount >= this.targetAmount) {
    this.status = 'completed';
  }
  
  next();
});

// Method to update current amount
goalSchema.methods.updateCurrentAmount = function(amount) {
  this.currentAmount = Math.max(0, amount);
  this.progressPercentage = this.calculateProgress();
  this.monthlySavingsTarget = this.calculateMonthlySavings();
  
  // Update status if goal is completed
  if (this.currentAmount >= this.targetAmount) {
    this.status = 'completed';
  }
  
  return this.save();
};

module.exports = mongoose.model('Goal', goalSchema);