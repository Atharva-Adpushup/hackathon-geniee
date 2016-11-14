var google = require('googleapis'),
	Promise = require('bluebird'),
	moment = require('moment'),
	_ = require('lodash'),
	config = require('../configs/config'),
	OAuth2 = google.auth.OAuth2,
	oauth2Client = new OAuth2(config.googleOauth.OAUTH_CLIENT_ID, config.googleOauth.OAUTH_CLIENT_SECRET, config.googleOauth.OAUTH_CALLBACK),
	refreshToken = '1/4JM5-Cho76rP4sH0eocCzrJ-_O7ULnJpBHRXDje9xhA',
	accessToken = 'ya29.Ci8dA-lK8RQJzu87Tg51yBYGbeOSV0NIVh4TJTvBacR4kC8Kcg9p6iCVQaepOBlj-Q',
	adx = google.adexchangeseller('v2.0'),
	adxReports = Promise.promisifyAll(adx.accounts.reports);

oauth2Client = Promise.promisifyAll(oauth2Client);



function processReports(data) {
	// eslint-disable-next-line no-unused-vars
	var finalData, totals, row = data.totals,
		averages, currency, headers;

	finalData = _.map(data.rows, function(rowNum) {
		rowNum[2] = parseFloat(rowNum[2]);
		return rowNum;
	});

	totals = [row[1], parseFloat(row[2] * 100), Number(row[3]), parseFloat(row[4] * 100), parseFloat(row[5]), parseFloat(row[6])];

	averages = _.map(data.averages, function(avg) {
		return avg;
	});

	currency = data.headers[6].currency;
	headers = ['DATE', 'IMPRESSIONS', 'CPC (' + currency + ')', 'CLICKS', 'CTR (%)', 'RPM (' + currency + ')', 'EARNINGS (' + currency + ')'];

	return { rows: finalData, footer: averages, header: headers };
}

function prepareQuery(config) {
	var adxConfig = {
		startDate: moment.unix(config.startDate / 1000).format('YYYY-MM-DD'),
		endDate: moment.unix(config.endDate / 1000).format('YYYY-MM-DD'),
		filter: [],
		accountId: 'pub-8933329999391104',
		dimension: 'DATE',
		metric: [
			'AD_IMPRESSIONS',
			'COST_PER_CLICK',
			'CLICKS',
			'MATCHED_AD_REQUESTS_CTR',
			'MATCHED_AD_REQUESTS_RPM',
			'EARNINGS'
		]
	};

	if (config.platform) {
		if (config.platform.toLowerCase() === 'mobile') {
			adxConfig.filter.push('PLATFORM_TYPE_NAME==High-end mobile devices');
		} else if (config.platform.toLowerCase() === 'tablet') {
			adxConfig.filter.push('PLATFORM_TYPE_NAME==Tablets');
		} else if (config.platform.toLowerCase() === 'desktop') {
			adxConfig.filter.push('PLATFORM_TYPE_NAME==Desktop');
		}
	}

	if (config.adsenseDomain) {
		adxConfig.filter.push('DOMAIN_NAME==' + config.adsenseDomain);
	}

	return Promise.resolve(adxConfig);
}

function getOauth2Client() {
	oauth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken
	});
	return oauth2Client.refreshAccessTokenAsync()
		.then(function(newCreds) {
			oauth2Client.setCredentials(newCreds);
			google.options({ auth: oauth2Client });
			return oauth2Client;
		});
}


module.exports = {
	getDomains: function() {
		return getOauth2Client()
			.then(function() {
				return adxReports.generateAsync({
					startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
					endDate: moment().format('YYYY-MM-DD'),
					accountId: 'pub-8933329999391104',
					dimension: 'DOMAIN_NAME',
					metric: ['EARNINGS']
				});
			})
			.then(function(data) {
				// return the domains which are the first element in the row
				return data.rows && Array.isArray(data.rows) ? data.rows.map(function(val) { return val[0]; }) : [];
			});
	},
	getReport: function(cf) {
		return getOauth2Client()
			.then(prepareQuery.bind(this, cf))
			.then(function(finalConfig) {
				return adxReports.generateAsync(finalConfig)
					.then(function(data) {
						return processReports(data);
					});
			});
	}

};