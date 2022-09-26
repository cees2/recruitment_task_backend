const express = require('express');
const {
  getAllItems,
  createItem,
  updateItem,
  getOneTypeOfItems,
  getItem,
  deleteItem,
} = require('../controllers/itemsController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllItems).post(restrictTo('admin'), createItem);

router
  .route('/:itemId')
  .get(getItem)
  .patch(restrictTo('admin'), updateItem)
  .delete(restrictTo('admin'), deleteItem);

router.route('/item/:itemType').get(getOneTypeOfItems);
module.exports = router;
