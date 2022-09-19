const express = require('express');
const {
  getAllItems,
  createItem,
  updateItem,
  getOneTypeOfItems,
} = require('../controllers/itemsController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllItems).post(restrictTo('admin'), createItem);
router.route('/:itemId').patch(restrictTo('admin'), updateItem);
router.route('/:itemType').get(getOneTypeOfItems);

module.exports = router;
