// DFP targeting module

var utils = require('./utils');
var constants = require('./constants');
var config = require('./config');
var adp = require('./adp');
var targeting = {
	getFloorWithGranularity: function(floor) {
		var val = parseFloat(Math.abs(floor).toFixed(2));

		if (val > 20) {
			return 20.0;
		} else if (val == 0) {
			val = 0.01;
		}

		utils.log('Sent floor : ' + val);
		return val;
	},
	setCustomSlotLevelTargeting: function(adpSlot) {
		/*
		Example (to be set in before js) -
			window.adpushup.customSlotLevelTargetingMap = {
				"ADP_37646_728X90_dca57618-e924-48f4-9993-d1274128f36c": {
					"adp_geo": window.adp_geo
				}
			};
		*/
		var customSlotLevelTargetingMap = window.adpushup.customSlotLevelTargetingMap;
		if (customSlotLevelTargetingMap) {
			var slotIds = Object.keys(customSlotLevelTargetingMap);

			if (slotIds.length) {
				slotIds.forEach(function(slotId) {
					if (slotId === adpSlot.containerId) {
						var slotTargeting = customSlotLevelTargetingMap[slotId];

						if (slotTargeting) {
							var targetingKeys = Object.keys(slotTargeting);

							if (targetingKeys.length) {
								targetingKeys.forEach(function(key) {
									adpSlot.gSlot.setTargeting(key, String(slotTargeting[key]));
								});
							}
						}
					}
				});
			}
		}
	},
	getAdserverTargeting: function(adpSlot) {
		if (adpSlot.optionalParam.headerBidding && adpSlot.bidders.length) {
			return window._apPbJs.getAdserverTargeting()[adpSlot.containerId];
		}

		return null;
	},
	setSlotLevel: function(adpSlot) {
		var keys = constants.ADSERVER_TARGETING_KEYS;
		var targeting = {
			[keys.ADPUSHUP_RAN]: 1,
			[keys.SITE_ID]: config.SITE_ID,
			[keys.HB_RAN]: 0,
			[keys.FLUID]: 0
		};
		var adServerTargeting = this.getAdserverTargeting(adpSlot);

		if (adpSlot.bidders.length) {
			Object.assign(targeting, { [keys.HB_RAN]: 1 });
		}

		if (adpSlot.optionalParam.fluid) {
			Object.assign(targeting, { [keys.FLUID]: 1 });
		}

		var slotRefreshData = utils.getSlotRefreshData(adpSlot);
		var refreshCount = slotRefreshData.exists
			? slotRefreshData.nextValue
			: slotRefreshData.defaultValue;

		Object.assign(targeting, {
			[keys.REFRESH_COUNT]: refreshCount
		});

		Object.assign(targeting, {
			[keys.REFRESH_RATE]: adpSlot.optionalParam.refreshInterval
		});

		if (adServerTargeting) {
			Object.assign(targeting, adServerTargeting);
		}

		// Set custom slot level targeting, if present
		this.setCustomSlotLevelTargeting(adpSlot);

		if (
			adpSlot.optionalParam.keyValues &&
			Object.keys(adpSlot.optionalParam.keyValues).length
		) {
			Object.assign(targeting, adpSlot.optionalParam.keyValues);
		}

		Object.keys(targeting).forEach(
			function(key) {
				// Check if any of keys belong to price floor key then set price using granularity function, so that it can match with price rules on server
				if (constants.TARGETING.ADX_FLOOR.priceFloorKeys.indexOf(key) !== -1) {
					if (parseInt(targeting[key], 10) === 0) {
						return true;
					}

					targeting[key] = this.getFloorWithGranularity(targeting[key]);
				}

				adpSlot.gSlot.setTargeting(key, String(targeting[key]));
			}.bind(this)
		);
	},
	setUTMLevel: function(googletag) {
		var urlParams = adp.utils.getQueryParams();
		var separator = ':';

		if (!Object.keys(urlParams).length) {
			var utmSessionCookie = adp.session.getCookie(constants.UTM_SESSION_COOKIE);

			if (utmSessionCookie) {
				var utmSessionCookieValues = adp.utils.base64Decode(
					utmSessionCookie.split('_=')[1]
				);
				urlParams = utmSessionCookieValues ? JSON.parse(utmSessionCookieValues) : {};
			}
		}

		// Set standard UTM targeting
		var standardTargeting = constants.TARGETING.UTM_LEVEL.STANDARD;
		Object.keys(standardTargeting).forEach(function(key) {
			var keyVal = standardTargeting[key],
				utmParam = urlParams[keyVal];

			googletag
				.pubads()
				.setTargeting(
					keyVal.trim().toLowerCase(),
					String(utmParam ? utmParam.trim().substr(0, 40) : null)
				);
		});

		// Set custom UTM targeting
		var customTargeting = constants.TARGETING.UTM_LEVEL.CUSTOM;
		Object.keys(customTargeting).forEach(function(key) {
			var keyName = key,
				keyTargets = customTargeting[key].TARGET,
				keyCombination = '';

			Object.keys(keyTargets).forEach(function(keyTarget) {
				var keyVal = keyTargets[keyTarget],
					utmParam = urlParams[keyVal];

				keyCombination += (utmParam ? utmParam : null) + separator;
			});

			keyCombination = keyCombination.substr(0, keyCombination.length - 1);
			googletag
				.pubads()
				.setTargeting(
					keyName.trim().toLowerCase(),
					String(keyCombination ? keyCombination.trim().substr(0, 40) : null)
				);
		});
	},
	setPageLevel: function(googletag) {
		let pageLevelTargeting = constants.TARGETING.PAGE_LEVEL;

		/*
            SAMPLE customPageLevelTargetingMap set through beforeJs
            window.adpushup.customPageLevelTargetingMap = {
                targeting: { adp_geo: window.adp_geo, key2: 'dsome val' },
                pagesToExclude: ['']
            };
     */

		if (window.adpushup.customPageLevelTargetingMap) {
			const {
				targeting: customPageLevelTargeting = {},
				pagesToExclude = []
			} = window.adpushup.customPageLevelTargetingMap;
			const pageUrl = window.location.href;

			const shouldSetCustomTargeting = !pagesToExclude.some(
				pageUrlPattern => !!pageUrl.match(new RegExp(pageUrlPattern))
			);

			if (shouldSetCustomTargeting) {
				pageLevelTargeting = { ...pageLevelTargeting, ...customPageLevelTargeting };
			}
		}

		for (var key in pageLevelTargeting) {
			googletag.pubads().setTargeting(key, String(pageLevelTargeting[key]));
		}
	}
};

module.exports = targeting;
