const express = require('express');

const router = express.Router();
const userController = require('./userController');
const proxyController = require('./proxyController');
const indexController = require('./indexController');
const apTagController = require('./apTagController');
const siteController = require('./siteController');
const dataController = require('./dataController');
const innovativeAdsController = require('./innovativeAdsController');
const reportsController = require('./reportsController');
const opsController = require('./opsController');
const channelController = require('./channelController');
const headerBiddingController = require('./headerBiddingController');
const visualEditorController = require('./visualEditorController');
const ampSettingsController = require('./ampSettingsController');
const utilityController = require('./utilityController');

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
router.use('/reports', reportsController);
router.use('/ops', opsController);
router.use('/channel', channelController);
router.use('/headerBidding', headerBiddingController);
router.use('/visualEditor', visualEditorController);
router.use('/ampSettings', ampSettingsController);
router.use('/utils', utilityController);
router.use('/', indexController);

module.exports = router;
