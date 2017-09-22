var globalModel = require('../../models/globalModel'),
	userModel = require('../../models/userModel'),
	siteModel = require('../../models/siteModel'),
	mcmService = require('../mcmAutomationService/service'),
	AdPushupError = require('../../helpers/AdPushupError'),
	_ = require('lodash'),
	consts = require('../../configs/commonConsts'),
	Promise = require('bluebird');

module.exports = Promise.method(function(siteId) {
	var getSite = siteModel.getSiteById(siteId),
		getUser = getSite.then(function(site) {
			if (!site.hasUnsyncedAds()) {
				globalModel.removeFromQueue(consts.Queue.SITES_TO_SYNC_ADSENSE, site.get('siteId')).then(function() {
					throw new AdPushupError(consts.errors.NO_ADS_TO_SYNC);
				});
			}

			return userModel.getUserByEmail(site.get('ownerEmail'));
		}),
		adsToRequiredFormat = function(ads) {
			return _.map(ads, function(adObj) {
				return {
					width: adObj.get('width'),
					height: adObj.get('height'),
					type: adObj.get('adType'),
					tplName: adObj.get('tplName'),
					bordercolor: _.trimStart(adObj.get('borderColor'), '#'),
					bgcolor: _.trimStart(adObj.get('backgroundColor'), '#'),
					textcolor: _.trimStart(adObj.get('textColor'), '#'),
					urlcolor: _.trimStart(adObj.get('urlColor'), '#'),
					titlecolor: _.trimStart(adObj.get('titleColor'), '#'),
					name: adObj.get('variationName')
				};
			});
		};

	return Promise.join(getSite, getUser, function(site, user) {
		var networkData = user.getNetworkDataSync('ADSENSE'),
			ads = adsToRequiredFormat(site.getUnsyncedAds('ADSENSE'));
		if (!networkData) {
			throw new AdPushupError(consts.errors.NO_ADSENSE_ACCOUNT_CONNECTED);
		}
		return mcmService
			.sendToBaPromise(
				'createAds',
				{
					email: user.get('email'),
					ads: ads,
					pubId: networkData.pubId,
					adsenseEmail: networkData.adsenseEmail
				},
				ads.length * (2 * 60 * 1000)
			)
			.then(function(json) {
				return siteModel
					.getSiteById(site.get('siteId')) // again fetch site from database to get latest copy of site object as adsyncing can take time
					.then(function(latestSiteObj) {
						return latestSiteObj.syncAdsenseAds(json.ads);
					})
					.then(function(latestSiteObj) {
						if (!latestSiteObj.hasUnsyncedAds()) {
							return globalModel.removeFromQueue(consts.Queue.SITES_TO_SYNC_ADSENSE, site.get('siteId'));
						}
					});
			});
	});
});
