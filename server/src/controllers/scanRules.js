const ScanRule = require('../models/ScanRule');

// @desc    Get all active scan rules for user (custom + recommended)
// @route   GET /api/scan-rules
// @access  Private
exports.getScanRules = async (req, res, next) => {
  try {
    const rules = await ScanRule.find({
      $or: [
        { user: req.user._id },
        { isDefault: true } // Include default rules for all users
      ],
      active: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    console.error('[ERROR] Error fetching scan rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scan rules'
    });
  }
};

// @desc    Get user's custom scan rules only
// @route   GET /api/scan-rules/custom
// @access  Private
exports.getCustomScanRules = async (req, res, next) => {
  try {
    const rules = await ScanRule.find({
      user: req.user._id,
      isDefault: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    console.error('[ERROR] Error fetching custom scan rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom scan rules'
    });
  }
};

// @desc    Create new scan rule
// @route   POST /api/scan-rules
// @access  Private
exports.createScanRule = async (req, res, next) => {
  try {
    const { name, description, languages, ruleDetails } = req.body;

    // Validation
    if (!name || !ruleDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rule name and details'
      });
    }

    if (!languages || languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one language'
      });
    }

    const rule = await ScanRule.create({
      user: req.user._id,
      name,
      description: description || '',
      severity: 'medium', // Default severity
      languages,
      checkFor: [], // Empty by default
      ruleDetails,
      category: 'security', // Default category
      examples: {}, // Empty by default
      isDefault: false,
      active: true
    });

    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('[ERROR] Error creating scan rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scan rule'
    });
  }
};

// @desc    Update scan rule
// @route   PUT /api/scan-rules/:id
// @access  Private
exports.updateScanRule = async (req, res, next) => {
  try {
    let rule = await ScanRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Scan rule not found'
      });
    }

    // Ensure user owns this rule or it's not a default rule
    if (rule.user.toString() !== req.user._id.toString() && !rule.isDefault) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this rule'
      });
    }

    const { name, description, languages, ruleDetails, active } = req.body;

    rule = await ScanRule.findByIdAndUpdate(
      req.params.id,
      {
        name: name || rule.name,
        description: description !== undefined ? description : rule.description,
        languages: languages || rule.languages,
        ruleDetails: ruleDetails || rule.ruleDetails,
        active: active !== undefined ? active : rule.active,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('[ERROR] Error updating scan rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scan rule'
    });
  }
};

// @desc    Delete scan rule
// @route   DELETE /api/scan-rules/:id
// @access  Private
exports.deleteScanRule = async (req, res, next) => {
  try {
    const rule = await ScanRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Scan rule not found'
      });
    }

    // Only allow deletion of custom rules by the owner
    if (rule.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this rule'
      });
    }

    await ScanRule.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Scan rule deleted successfully'
    });
  } catch (error) {
    console.error('[ERROR] Error deleting scan rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scan rule'
    });
  }
};

// @desc    Toggle rule active status
// @route   PATCH /api/scan-rules/:id/toggle
// @access  Private
exports.toggleRuleStatus = async (req, res, next) => {
  try {
    let rule = await ScanRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Scan rule not found'
      });
    }

    // Only allow toggling of custom rules by the owner
    if (rule.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this rule'
      });
    }

    rule.active = !rule.active;
    await rule.save();

    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('[ERROR] Error toggling rule status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle rule status'
    });
  }
};

// @desc    Get rules by category
// @route   GET /api/scan-rules/category/:category
// @access  Private
exports.getRulesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const rules = await ScanRule.find({
      $or: [
        { user: req.user._id },
        { isDefault: true }
      ],
      category,
      active: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    console.error('[ERROR] Error fetching rules by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rules'
    });
  }
};
