/**
 * Created by Dhiraj on 3/4/2016.
 */
var url = require('url'),
	// logger = require('./logger'),
	CryptoJS = require('crypto-js'),
	Promise = require('bluebird'),
	randomStore = [],
	_ = require('lodash'),
	API = {
		getPageGroupHash: function(pageGroup, platform) {
			var name = pageGroup + '_' + platform,
				object = { pageGroups: [name] };

			return this.btoa(this.encodeString(JSON.stringify(object)));
		},
		numberFormatter: num => {
			if (num >= 1000000000) {
				return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
			}
			if (num >= 1000000) {
				return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
			}
			if (num >= 1000) {
				return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
			}
			return num;
		},
		encodeString: function(string) {
			return encodeURIComponent(string);
		},
		btoa: function(stringifiedData) {
			return new Buffer(stringifiedData).toString('base64');
		},
		convertPagegroupLink: function(pageGroupId, pageGroupName, siteId) {
			return '<a href="/user/site/' + siteId + '/pagegroup/' + pageGroupId + '">' + pageGroupName + '</a>';
		},
		getPageGroupPattern: function(pageGroup, platform, patterns) {
			if (Object.keys(patterns).length) {
				const matchedPagegroup = _.find(patterns[platform], p => {
					return p.pageGroup === pageGroup;
				});
				return matchedPagegroup ? matchedPagegroup.pattern : '';
			}
		},
		random: function(low, high) {
			return Math.floor(Math.random() * (high - low) + low);
		},
		getRandomNumber: function() {
			var number = Math.floor(Math.random() * (100000 - 100 + 1)) + 100;
			var isThere = randomStore[number];
			if (isThere) this.getRandomNumber();
			else {
				randomStore[number] = 1;
				return number;
			}
		},
		randomString: function(len) {
			len = len && this.toNumber(len) && len > 1 ? len : 10;

			return Math.random()
				.toString(16)
				.substr(2, len);
		},
		domanize: function(domain) {
			return domain
				? API.rightTrim(
						domain
							.replace('http://', '')
							.replace('https://', '')
							.replace('www.', ''),
						'/'
					)
				: '';
		},
		rightTrim: function(string, s) {
			return string ? string.replace(new RegExp(s + '*$'), '') : '';
		},
		getDomain: function(u) {
			var parsedUrl = url.parse(u);
			return parsedUrl.protocol + '//' + parsedUrl.hostname;
		},
		toNumber: function(a) {
			a = parseInt(a, 10);
			return isNaN(a) ? 0 : a;
		},
		htmlEntities: function(str) {
			return String(str)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		},
		toFloat: function(a, precison) {
			a = parseFloat(a);
			return isNaN(a) || 0 ? 0 : parseFloat(a.toFixed(precison || 2));
		},
		logInfo: function(message) {
			logger.info(message);
		},
		logError: function(err) {
			//logger.log('error', err);
		},
		getHmacSHA256: function(message, secretKey) {
			var hash = CryptoJS.HmacSHA256(message, secretKey),
				hashInHex = CryptoJS.enc.Hex.stringify(hash);

			return hashInHex;
		},
		sanitiseString: function(str) {
			return str.trim().toLowerCase();
		},
		trimString: function(str) {
			return str.trim();
		},
		// getSafeUrl, Generates a safe url by using url.parse
		// @return String
		// @param String
		getSafeUrl: function(unsafeUrl) {
			var str = url.parse(typeof unsafeUrl === 'string' ? unsafeUrl.trim() : '');

			return str.href;
		},
		getSiteDomain: function(link) {
			return url.parse(link).hostname;
		},
		/**
		 * OBJECTIVE: Sequentially iterate array values with a promise function
		 * IMPLEMENTATION: Iterate array values by a recursive function that invokes
		 * a Promise function
		 * @param {array} Array to iterate upon
		 * @param {fn} Promise function to get invoked with array values
		 * @returns {null} An empty Promise response
		 */
		syncArrayPromise: function(array, fn) {
			var index = 0;

			return new Promise(function(resolve, reject) {
				function next() {
					if (index < array.length) {
						fn(array[index++]).then(next, reject);
					} else {
						resolve();
					}
				}
				next();
			});
		},
		getLanguageLocale: (mappingObject, locale) => {
			let selectedLocale = '';

			Object.keys(mappingObject).forEach(languageCode => {
				const languageArray = mappingObject[languageCode];

				if (languageArray.indexOf(locale) > -1) {
					selectedLocale = languageCode;
					return false;
				}
			});

			return selectedLocale;
		},
		getMetricComparison: (lastWeek, thisWeek) => {
			const resultData = {
					percentage: 0,
					change: 'remain unchanged'
				},
				difference = thisWeek - lastWeek;

			let percentage = Number((difference / lastWeek * 100).toFixed(2)),
				isNoChange,
				isPositiveChange,
				change;

			percentage = isNaN(percentage) ? 0 : percentage;
			isNoChange = !!(percentage === 0);
			isPositiveChange = !!(percentage && percentage > 0);

			if (isNoChange) {
				change = 'remain unchanged';
			} else if (isPositiveChange) {
				change = 'increased';
			} else {
				change = 'decreased';
			}

			resultData.percentage = Math.abs(percentage);
			resultData.change = change;
			return resultData;
		},
		// Utility method to match a string in regex array
		isValueInPatternList: (list, value) => {
			return list.some(function(pattern) {
				return pattern.test(value);
			});
		}
	};

module.exports = API;
