const express = require('express');

const viewsController = require('../controller/viewsController');
const authController = require('../controller/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getHome);

router.get('/profile', authController.protect, viewsController.getAccount);

module.exports = router;
