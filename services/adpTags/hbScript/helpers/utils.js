var config = require('../src/config'),
	find = require('lodash.find'),
	$ = require('../src/adp').$,
	adp = require('../src/adp').adp,
	apConfig = adp.config;

module.exports = {
	hashCode: function(str) {
		var hash = 0;
		if (str.length === 0) return hash;
		for (i = 0; i < str.length; i++) {
			char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	},
	createEmptyIframe: function() {
		var f = document.createElement('iframe');

		f.id = '_adp_frame_' + ((Math.random() * 1000) | 0);
		f.height = 0;
		f.width = 0;
		f.border = '0px';
		f.hspace = '0';
		f.vspace = '0';
		f.marginWidth = '0';
		f.marginHeight = '0';
		f.style.border = '0';
		f.scrolling = 'no';
		f.frameBorder = '0';
		f.src = 'about:blank';

		return f;
	},
	getCurrentAdpSlotBatch: function(adpBatches, batchId) {
		return find(adpBatches, function(batch) {
			return batch.batchId === batchId;
		}).adpSlots;
	},
	isSupportedBrowser: function() {
		var ua = navigator.userAgent;

		// Check for MSIE v7-10 in UA string
		if (ua.indexOf('MSIE') !== -1) {
			var re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})'),
				ieVersion = Number(re.exec(ua)[1]);

			return ieVersion >= 9 ? true : false;
		}
		return true;
	},
	getBrowser: function() {
		if (window.navigator) {
			var ua = navigator.userAgent,
				tem,
				M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
			if (/trident/i.test(M[1])) {
				tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
				return 'IE ' + (tem[1] || '');
			}
			if (M[1] === 'Chrome') {
				tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
				if (tem != null)
					return tem
						.slice(1)
						.join(' ')
						.replace('OPR', 'Opera');
			}
			M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
			if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
			return M.join(' ');
		} else {
			return 'unknown';
		}
	},
	getUaString: function() {
		if (window.navigator) {
			if (window.navigator.userAgent) {
				return window.navigator.userAgent;
			} else if (window.navigator.appVersion) {
				return window.navigator.appVersion;
			}
		}
		return null;
	},
	sendFeedback: function(feedback) {
		$.post(config.FEEDBACK_URL, JSON.stringify(feedback.data));
	},
	getBatchAdUnits: function(adpSlots) {
		var adUnits = [];
		adpSlots.forEach(function(adpSlot) {
			adUnits.push(adpSlot.containerId);
		});
		return adUnits;
	},
	stringifyJSON: function(json) {
		var dataString = '?',
			keys = Object.keys(json);

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];

			if (keys.length > 1 && i !== keys.length - 1) {
				dataString += key + '=' + json[key] + '&';
			} else {
				dataString += key + '=' + json[key];
			}
		}

		return dataString;
	},
	generateUUID: function(placeholder) {
		return placeholder
			? (placeholder ^ ((Math.random() * 16) >> (placeholder / 4))).toString(16)
			: ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, this.generateUUID);
	},
	getRandomNumber: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	getSectionId: function(el) {
		if (document.getElementById(el)) {
			var parent = document.getElementById(el).parentNode;

			if (parent && parent.hasAttribute('data-section')) {
				return parent.getAttribute('data-section');
			}
		}
		return null;
	},
	getVariationId: function() {
		try {
			if (adp) {
				var variationId = apConfig.selectedVariation;

				if (variationId) {
					return variationId;
				}
			}
		} catch (error) {}
		return null;
	},
	getPageGroup: function() {
		if (adp) {
			var pageGroup = apConfig.pageGroup;

			if (pageGroup) {
				return pageGroup;
			}
		}
		return null;
	},
	getPlatform: function() {
		if (adp) {
			var platform = apConfig.platform;

			if (platform) {
				return platform;
			}
		}
		return null;
	},
	getActiveDFPNetwork: function() {
		if (adp && apConfig) {
			return apConfig.activeDFPNetwork;
		}
		return null;
	},
	getUniqueValuesArray: function(collection, value) {
		var uniqueVales = {};

		collection.forEach(function(colData) {
			var data = colData[value];
			if (!uniqueVales.hasOwnProperty(data)) {
				uniqueVales[data] = true;
			}
		});

		return Object.keys(uniqueVales);
	},
	hasMultipleDfpAccounts: function() {
		try {
			var dfpAdSlots = window.googletag.pubads().getSlots(),
				dfpNetworkIdMap = {};

			dfpAdSlots.forEach(function(dfpAdSlot) {
				var dfpNetworkId = dfpAdSlot.getAdUnitPath().match(/\/(.*?)\//)[1];

				if (!dfpNetworkIdMap.hasOwnProperty(dfpNetworkId)) {
					dfpNetworkIdMap[dfpNetworkId] = 1;
				} else {
					dfpNetworkIdMap[dfpNetworkId] += 1;
				}
			});

			if (Object.keys(dfpNetworkIdMap).length > 1) {
				return true;
			}

			return false;
		} catch (e) {
			return false;
		}
	},
	removeElementArrayFromCollection: function(collection, elArray) {
		var inputCollection = collection.concat([]),
			isValidCollection = !!inputCollection.length,
			isElArray = !!(elArray && elArray.length);

		if (!isValidCollection) {
			return null;
		}

		inputCollection.forEach(function(item, idx) {
			var isElArrayMatch = !!(item && isElArray && item[0] === elArray[0] && item[1] === elArray[1]);

			if (isElArrayMatch) {
				collection.splice(idx, 1);
				return false;
			}
		});

		return collection;
	},
	isValidThirdPartyDFPAndCurrencyConfig: function(inputObject) {
		var inputObject = inputObject || apConfig,
			isActiveDFPNetwork = !!(inputObject.activeDFPNetwork && inputObject.activeDFPNetwork.length),
			isActiveDFPCurrencyCode = !!(
				inputObject.activeDFPCurrencyCode &&
				inputObject.activeDFPCurrencyCode.length &&
				inputObject.activeDFPCurrencyCode.length === 3
			),
			isPrebidGranularityMultiplier = !!(
				inputObject.prebidGranularityMultiplier && Number(inputObject.prebidGranularityMultiplier)
			),
			isActiveDFPCurrencyExchangeRate = !!(
				inputObject.activeDFPCurrencyExchangeRate &&
				Object.keys(inputObject.activeDFPCurrencyExchangeRate).length
			),
			isValidResult = !!(
				isActiveDFPNetwork &&
				isActiveDFPCurrencyCode &&
				isPrebidGranularityMultiplier &&
				isActiveDFPCurrencyExchangeRate
			);

		return isValidResult;
	}
};
