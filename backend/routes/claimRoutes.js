const express = require('express');
const {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  updateClaimStatus,
  cancelClaim,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createClaim);
router.get('/my', protect, getMyClaims);
router.get('/received', protect, getReceivedClaims);
router.patch('/:id', protect, updateClaimStatus);
router.delete('/:id', protect, cancelClaim);

module.exports = router;
