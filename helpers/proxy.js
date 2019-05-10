var request = require('request-promise'),
	utils = require('../helpers/utils'),
	_ = require('lodash'),
	cheerio = require('cheerio'),
	crypto = require('crypto'),
	Promise = require('bluebird'),
	soap = require('soap'),
	config = require('../configs/config');
API = {
	load: function(url, userAgent, fullResponse) {
		userAgent = userAgent
			? userAgent
			: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
		return request({
			uri: url,
			jar: true,
			strictSSL: false,
			resolveWithFullResponse: fullResponse ? true : false,
			headers: {
				'User-Agent': userAgent,
				'Accept-Encoding': 'identity'
			}
		});
	},
	detectWp: function(url) {
		return API.load(utils.rightTrim(url, '/') + '/wp-trackback.php').then(
			function(body) {
				if (body.indexOf('I really need an ID for this to work') === -1) {
					return false;
				}
				return true;
			},
			function(err) {
				if (
					err.message.indexOf('I really need an ID for this to work') === -1
				) {
					return false;
				}
				return true;
			}
		);
	},
	detectCustomAp: function(url) {
		return API.load(url).then(function(body) {
			var apCodeDetected =
				body.match('//optimize.adpushup.com') ||
				body.match('//apex.adpushup.com') ||
				body.match('//cdn.adpushup.com');
			return apCodeDetected ? true : false;
		});
	},
	detectAdPushup: function(url) {
		return API.load(url).then(function(body) {
			var $ = cheerio.load(body),
				json = null,
				finalData;
			$('noscript').each(function(index, el) {
				var html = $(el)
					.text()
					.trim();
				if (html.indexOf('_ap_ufes') === -1) {
					return true;
				}
				html = _.trimStart(html, '_ap_ufes');
				html = _.trimEnd(html, '_ap_ufee');
				json = JSON.parse(html);
				return false;
			});
			if (!json) {
				return false;
			}
			finalData = { cmsName: 'wordpress', pageGroups: [] };
			Object.keys(json.urls).forEach(function(key) {
				finalData.pageGroups.push({
					pageGroup: key.toUpperCase(),
					sampleUrl: json.urls[key]
				});
			});
			return finalData;
		});
	},
	checkIfBillingProfileComplete: email => {
		var tipaltiConfig = config.tipalti,
			url = tipaltiConfig.soapUrl,
			payeeId = encodeURIComponent(
				crypto
					.createHash('md5')
					.update(email)
					.digest('hex')
					.substr(0, 64)
			),
			payer = tipaltiConfig.payerName,
			date = Math.floor(+new Date() / 1000),
			paramsStr = payer + payeeId + date + '25',
			key = tipaltiConfig.key,
			hash = crypto
				.createHmac('sha256', key)
				.update(paramsStr.toString('utf-8'))
				.digest('hex'),
			requestArgs = {
				payerName: payer,
				idap: payeeId,
				timestamp: date,
				key: hash,
				amount: '100'
			},
			createClient = Promise.promisify(soap.createClient);

		return createClient(url)
			.then(function(client) {
				var method = client['PayeePayable'];
				method = Promise.promisify(method);
				return method(requestArgs);
			})
			.then(function(result) {
				return result.PayeePayableResult && result.PayeePayableResult.b;
			})
			.catch(function() {
				return 'some error occured';
			});
	}
};

module.exports = API;
