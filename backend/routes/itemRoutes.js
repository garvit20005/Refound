const express = require('express');
const {
  getItems,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  markRecovered,
  deleteItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getItems);
router.post('/', protect, upload.single('image'), createItem);

// "/my" must be above "/:id", otherwise "my" is treated as an id
router.get('/my', protect, getMyItems);

router.patch('/:id/recovered', protect, markRecovered);

router.get('/:id', getItemById);
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
