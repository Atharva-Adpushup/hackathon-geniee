var google = require('googleapis'),
	Promise = require('bluebird'),
	moment = require('moment'),
	_ = require('lodash'),
	googOauthHelper = require('../helpers/googleOauth'),
	AdPushupError = require('../helpers/AdPushupError'),
	Adsense = google.adsense('v1.4'),
	adsenseHost = google.adsensehost('v4.1'),
	adUnits = Promise.promisifyAll(adsenseHost.accounts.adunits),
	Accounts = Promise.promisifyAll(Adsense.accounts),
	adclients = Promise.promisifyAll(Adsense.adclients),
	Reports = Promise.promisifyAll(Adsense.reports),
	AdsenseApi = function(user, accountId, oauthClient) {
		this.user = user;
		this.accountId = accountId;
		this.adClientId = 'ca-' + accountId;
		this.oauthClient = oauthClient;
		google.options({ auth: oauthClient });
	};

function processReports(metric, data) {
	var finalData, averages, currency, headers;

	finalData = _.map(data.rows, function(rowNum) {
		switch (metric) {
			case 'AD_REQUESTS':
				return [rowNum[0], Number(rowNum[1]), Number(rowNum[2]), Number(parseFloat(rowNum[3] * 100).toFixed(2)), Number(parseFloat(rowNum[4]).toFixed(2)), Number(parseFloat(rowNum[5]).toFixed(2)), Number(parseFloat(rowNum[6]).toFixed(2))];

			case 'PAGE_VIEWS':
				return [rowNum[0], Number(rowNum[1]), Number(rowNum[2]), Number(parseFloat(rowNum[3] * 100).toFixed(2)), Number(parseFloat(rowNum[4]).toFixed(2)), Number(parseFloat(rowNum[5]).toFixed(2)), Number(parseFloat(rowNum[6]).toFixed(2))];

			case 'INDIVIDUAL_AD_IMPRESSIONS':
				return [rowNum[0], Number(rowNum[1]), Number(rowNum[2]), Number(parseFloat(rowNum[3] * 100).toFixed(2)), Number(parseFloat(rowNum[4]).toFixed(2)), Number(parseFloat(rowNum[5]).toFixed(2)), Number(parseFloat(rowNum[6]).toFixed(2))];

			default:
				break;
		}
	});

	averages = _.map(data.averages, function(avg) {
		return avg;
	});

	currency = data.headers[5].currency;
	headers = ['DATE', 'PAGE VIEWS', 'CLICKS', 'CTR (%)', 'CPC (' + currency + ')', 'RPM (' + currency + ')', 'EARNINGS (' + currency + ')'];

	return { rows: finalData, footer: averages, header: headers };
}

AdsenseApi.prototype = {
	listAccounts: function() {
		return Accounts.listAsync({ auth: this.oauthClient })
			.then(function(json) {
				if (json.items) {
					return json.items;
				}
				throw new AdPushupError('No accounts found.');
			});
	},
	doesAccountExists: function(pubId) {
		return Accounts.getAsync({ accountId: pubId }).then(function() {
			return true;
		}).catch(function(err) {
			// obvious error is 404 but if some other error then console log it
			if (err.code !== 404) {
				console.log(err);
			}
			return false;
		});
		/* return this.listAccounts()
			.then(function(accounts) {
				return _.find(accounts, { id: pubId }) ? true : false;
			})*/
	},
	getDomains: function() {
		return Reports.generateAsync({
			accountId: this.accountId,
			dimension: 'DOMAIN_NAME',
			metric: 'INDIVIDUAL_AD_IMPRESSIONS',
			sort: 'DOMAIN_NAME',
			startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
			endDate: 'today'
		});
	},
	getAdclients: function() {
		return adclients.listAsync();
	},
	generate: function(config) {
		if (!config.accountId) {
			config.accountId = this.accountId;
		}
		return Reports.generateAsync(config)
			.then(function(data) {
				return data;
			});
	},
	getReport: function(config) {
		return this.generate(config)
			.then(function(data) {
				return processReports(config.metric[0], data);
			});
	},
	getStats: function(config) {
		return this.generate(config)
			.then(function(data) {
				return data.rows;
			});
	},
	createAd: function(adObj) {
		return adUnits.insertAsync({
			accountId: this.accountId,
			adClientId: this.adClientId,
			resource: adObj.getAdsenseFormatJson()
		});
	}

};

module.exports = {
	getAdsense: function(user) {
		return googOauthHelper.getClient(user, true)
			.spread(function(oauthClient, accountId) {
				return new AdsenseApi(user, accountId, oauthClient);
			});
	},
	prepareQuery: function(config) {
		var adsenseConfig = {
			startDate: moment.unix(config.startDate / 1000).format('YYYY-MM-DD'),
			endDate: moment.unix(config.endDate / 1000).format('YYYY-MM-DD'),
			useTimezoneReporting: true,
			filter: [],
			metric: []
		};

		if (config.platform) {
			if (config.platform.toLowerCase() === 'mobile') {
				adsenseConfig.filter.push('PLATFORM_TYPE_CODE==HighEndMobile');
			} else if (config.platform.toLowerCase() === 'tablet') {
				adsenseConfig.filter.push('PLATFORM_TYPE_CODE==Tablet');
			} else if (config.platform.toLowerCase() === 'desktop') {
				adsenseConfig.filter.push('PLATFORM_TYPE_CODE==Desktop');
			}
		}

		if (config.adCodeSlot) {
			adsenseConfig.filter.push('AD_UNIT_CODE==' + config.adCodeSlot);
		}

		if (config.adsenseDomain && config.adsenseDomain !== 'All Domains') {
			adsenseConfig.filter.push('DOMAIN_NAME==' + config.adsenseDomain);
		}

		switch (config.adsenseMetric) {
			case 'AD REQUESTS':
				adsenseConfig.metric = [
					'AD_REQUESTS',
					'CLICKS',
					'AD_REQUESTS_CTR',
					'COST_PER_CLICK',
					'AD_REQUESTS_RPM',
					'EARNINGS'
				];
				break;
			case 'AD IMPRESSIONS':
				adsenseConfig.metric = [
					'INDIVIDUAL_AD_IMPRESSIONS',
					'CLICKS',
					'INDIVIDUAL_AD_IMPRESSIONS_CTR',
					'COST_PER_CLICK',
					'INDIVIDUAL_AD_IMPRESSIONS_RPM',
					'EARNINGS'
				];
				break;
			default:
				adsenseConfig.metric = [
					'PAGE_VIEWS',
					'CLICKS',
					'PAGE_VIEWS_CTR',
					'COST_PER_CLICK',
					'PAGE_VIEWS_RPM',
					'EARNINGS'
				];
				break;
		}

		if (config.step === '1M') {
			adsenseConfig.dimension = 'MONTH';
		} else if (config.step === '7d') {
			adsenseConfig.dimension = 'WEEK';
		} else {
			adsenseConfig.dimension = 'DATE';
		}

		if (!adsenseConfig.filter.length) {
			delete adsenseConfig.filter;
		}

		return Promise.resolve(adsenseConfig);
	}
};
