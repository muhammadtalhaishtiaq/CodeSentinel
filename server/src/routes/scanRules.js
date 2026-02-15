const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getScanRules,
  getCustomScanRules,
  createScanRule,
  updateScanRule,
  deleteScanRule,
  toggleRuleStatus,
  getRulesByCategory
} = require('../controllers/scanRules');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all rules (custom + default)
router.get('/', getScanRules);

// Get only custom rules
router.get('/custom', getCustomScanRules);

// Get rules by category
router.get('/category/:category', getRulesByCategory);

// Create new rule
router.post('/', createScanRule);

// Update rule
router.put('/:id', updateScanRule);

// Delete rule
router.delete('/:id', deleteScanRule);

// Toggle rule status
router.patch('/:id/toggle', toggleRuleStatus);

module.exports = router;
