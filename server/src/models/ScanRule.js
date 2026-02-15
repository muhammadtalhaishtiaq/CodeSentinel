const mongoose = require('mongoose');

const ScanRuleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a rule name'],
    trim: true,
    maxlength: [100, 'Rule name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Languages this rule applies to
  languages: [{
    type: String,
    enum: ['javascript', 'typescript', 'python', 'php', 'java', 'csharp', 'cpp', 'go', 'rust', 'ruby', 'sql', 'html', 'css', 'kotlin', 'swift', 'objective-c'],
    lowercase: true
  }],
  // What to check for (patterns/keywords/concepts)
  checkFor: [{
    type: String,
    trim: true
  }],
  // Detailed rule description for LLM
  ruleDetails: {
    type: String,
    required: [true, 'Please add rule details'],
    maxlength: [10000, 'Rule details cannot exceed 10000 characters']
  },
  // Examples of violations
  examples: {
    badCode: {
      type: String,
      trim: true
    },
    goodCode: {
      type: String,
      trim: true
    }
  },
  // Categories
  category: {
    type: String,
    enum: ['security', 'performance', 'code-quality', 'best-practices', 'architectural'],
    default: 'security'
  },
  // Whether this rule is active
  active: {
    type: Boolean,
    default: true
  },
  // Whether this is a default rule or custom rule
  isDefault: {
    type: Boolean,
    default: false
  },
  // Rule type: 'master' (comprehensive evaluation) or 'custom' (specific rule)
  ruleType: {
    type: String,
    enum: ['master', 'custom'],
    default: 'custom'
  },
  // Flag for master comprehensive evaluation rule
  isMasterRule: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
ScanRuleSchema.index({ user: 1, active: 1 });
ScanRuleSchema.index({ category: 1 });

module.exports = mongoose.model('ScanRule', ScanRuleSchema);
