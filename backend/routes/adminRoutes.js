const express = require('express');
const {
  getStats,
  getUsers,
  toggleBlockUser,
  getAllItems,
  deleteAnyItem,
  getFlags,
  updateFlagStatus,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Every route below needs: logged in AND admin
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/block', toggleBlockUser);
router.get('/items', getAllItems);
router.delete('/items/:id', deleteAnyItem);
router.get('/flags', getFlags);
router.patch('/flags/:id', updateFlagStatus);

module.exports = router;
