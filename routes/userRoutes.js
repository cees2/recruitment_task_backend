const express = require('express');
const { createUser } = require('../controllers/userController');

const { login, signup } = require('../controllers/authController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);

router.route('/').post(protect, restrictTo('admin'), createUser);

module.exports = router;
