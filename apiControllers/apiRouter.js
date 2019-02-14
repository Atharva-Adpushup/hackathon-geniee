const express = require('express');
const _ = require('lodash');

const router = express.Router();
const userController = require('./userController');
const indexController = require('./indexController');
const apTagController = require('./apTagController');

const apiAuthMiddleware = require('../middlewares/apiAuthMiddleware');

router.use(apiAuthMiddleware);

// API Controllers
router.use('/user', userController);
router.use('/apTag', apTagController);
router.use('/', indexController);

module.exports = router;
