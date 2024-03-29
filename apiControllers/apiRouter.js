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
const urlReportsControllers = require('./urlReportsController');
const hbAnalyticsController = require('./hbAnalyticsController');
const channelController = require('./channelController');
const headerBiddingController = require('./headerBiddingController');
const visualEditorController = require('./visualEditorController');
const ampSettingsController = require('./ampSettingsController');
const adsTxtController = require('./adsTxtController');
const utilityController = require('./utilityController');
const ampController = require('./ampController');
const scriptController = require('./scriptController');
const paymentController = require('./paymentController');
const cacheController = require('./cache/controller');
const syncController = require('./syncController');
const getRemainingSitesinQueueStatus = require('./checkQueueExistingSites');

// TODO: add some security/authentication check
router.use('/script', scriptController);

const apiAuthMiddleware = require('../middlewares/apiAuthMiddleware');
const loggerMiddleware = require('../middlewares/logger');

router.use(apiAuthMiddleware);

// API Controllers
router.use('/user', userController);
router.use('/proxy', proxyController);
router.use('/apTag', apTagController);
router.use('/site', siteController);
router.use('/data', dataController);
router.use('/innovativeAds', innovativeAdsController);
router.use('/reports', loggerMiddleware, reportsController);
router.use('/url', urlReportsControllers);
router.use('/hbAnalytics', hbAnalyticsController);
router.use('/ops', opsController);
router.use('/channel', channelController);
router.use('/headerBidding', headerBiddingController);
router.use('/visualEditor', visualEditorController);
router.use('/ampSettings', ampSettingsController);
router.use('/adsTxt', adsTxtController);
router.use('/utils', utilityController);
router.use('/amp', ampController);
router.use('/', indexController);
router.use('/payment', paymentController);
router.use('/cache', cacheController);
router.use('/sync', syncController);
router.use('./sites', getRemainingSitesinQueueStatus);

module.exports = router;
