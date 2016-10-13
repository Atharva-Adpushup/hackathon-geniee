var adsenseModel = require('../../models/adsenseModel'),
	userModel = require('../../models/userModel'),
	siteModel = require('../../models/siteModel'),
	utils = require('../../helpers/utils'),
	AdPushupError = require('../../helpers/AdPushupError'),
	_ = require('lodash'),
	moment = require('moment'),
	Promise = require('bluebird');

module.exports = Promise.method(function(siteId) {
	var noOfDays = (process.argv[2] && (process.argv[2].toLowerCase() === 'daily')) ? 1 : 365, // first argument is node second is file name and third is no of days we want get stats of
		getSite = siteModel.getSiteById(siteId),
		getUser = getSite.then(function(site) {
			if (!site.areAdsSynced()) {
				throw new AdPushupError('No ads synced yet');
			}
			return userModel.getUserByEmail(site.get('ownerEmail'));
		}),
		getAdsense = getUser.then(function(user) {
			return adsenseModel.getAdsense(user);
		}),
		getConfig = function(site, variations, startFromDays) {
			var adunits = _.map(variations, function(variation) {
				return 'AD_UNIT_CODE==' + variation;
			});

			return {
				startDate: moment().subtract(startFromDays, 'days').format('YYYY-MM-DD'),
				endDate: moment().format('YYYY-MM-DD'),
				useTimezoneReporting: false, // only pdt time zone, which is billingzone of all users
				metric: ['AD_REQUESTS', 'AD_REQUESTS_COVERAGE', 'CLICKS', 'AD_REQUESTS_CTR', 'COST_PER_CLICK', 'AD_REQUESTS_RPM', 'EARNINGS'],
				dimension: ['PLATFORM_TYPE_NAME', 'AD_UNIT_CODE'],
				filter: adunits.join(',') + '&DOMAIN_NAME=@' + utils.domanize(site)
			};
		},
		getStats = Promise.method(function(site, adsense) {
			var ads = site.get('ads'), variations, adsenseConfig;
			if (!Array.isArray(ads) || !ads.length) {
				throw new AdPushupError('No ads to sync');
			}
			// get all adslots(adunit code as called by google) of ads
			variations = _.map(site.get('ads'), function(ad) {
				if (ad.get('adslot')) {
					return ad.get('adslot');
				}
			});

			adsenseConfig = getConfig(site.get('siteDomain'), variations, noOfDays);
			// group stats by adslots
			return adsense.getStats(adsenseConfig).then(function(stats) {
				return _.groupBy(stats, function(row) {
					return row[1];
				});
			});
		}),
		setStats = Promise.method(function(site, stats) {
			var ad = null, adData = {};
			_.forEach(stats, function(rows, adslot) {
				ad = _.find(site.get('ads'), function(adObj) {
					return adObj.get('adslot') === adslot;
				});
				adData = {
					data: {},
					startDate: moment().subtract(noOfDays, 'days').format('YYYY-MM-DD'),
					endDate: moment().format('YYYY-MM-DD')
				};
				_.forEach(rows, function(row) {
					adData.data[row[0]] = {
						AD_REQUESTS: utils.toNumber(row[2]),
						AD_REQUESTS_COVERAGE: utils.toNumber(row[3]),
						CLICKS: utils.toNumber(row[4]),
						AD_REQUESTS_CTR: utils.toFloat(row[5]),
						COST_PER_CLICK: utils.toFloat(row[6]),
						AD_REQUESTS_RPM: utils.toFloat(row[7]),
						EARNINGS: utils.toFloat(row[8])
					};
				});
				if (noOfDays === 1) {
					ad.set('adsenseStatsDaily', adData, true);
				} else {
					ad.set('adsenseStats', adData, true);
				}
			});
			return site;
		});


	return Promise.join(getSite, getUser, getAdsense, function(site, user, adsense) {
		return getStats(site, adsense, noOfDays)
			.then(setStats.bind(null, site))
			.then(function(siteObj) {
				if (noOfDays === 1) {
					siteObj.set('adsenseStatsDailyUpdated', +moment().utc(), true);
				} else {
					siteObj.set('adsenseStatsUpdated', +moment().utc(), true);
				}
				console.log('Done:' + site.get('siteId'));
				return site.save();
			});
	});
});


