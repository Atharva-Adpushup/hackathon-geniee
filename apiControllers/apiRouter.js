const express = require('express');

const router = express.Router();
const _ = require('lodash');
const userController = require('./userController');
const indexController = require('./indexController');
const apiAuthMiddleware = require('../middlewares/apiAuthMiddleware');

router.use(apiAuthMiddleware);

// API Controllers
router.use('/user', userController);
router.use('/', indexController);

module.exports = router;
