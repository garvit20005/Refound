const express = require('express');
const { createFlag } = require('../controllers/flagController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createFlag);

module.exports = router;
