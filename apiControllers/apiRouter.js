const express = require('express');
const _ = require('lodash');

const router = express.Router();
const userController = require('./userController');
const proxyController = require('./proxyController');
const indexController = require('./indexController');
const apTagController = require('./apTagController');
const siteController = require('./siteController');
const dataController = require('./dataController');
const innovativeAdsController = require('./innovativeAdsController');
const opsController = require('./opsController');

const apiAuthMiddleware = require('../middlewares/apiAuthMiddleware');

router.use(apiAuthMiddleware);

// API Controllers
router.use('/user', userController);
router.use('/proxy', proxyController);
router.use('/apTag', apTagController);
router.use('/site', siteController);
router.use('/data', dataController);
router.use('/proxy', proxyController);
router.use('/innovativeAds', innovativeAdsController);
router.use('/ops', opsController);
router.use('/', indexController);

module.exports = router;
