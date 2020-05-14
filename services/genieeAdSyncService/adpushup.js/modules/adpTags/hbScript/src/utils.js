// Utility functions

var adp = require('./adp');
var find = require('lodash.find');
var $ = require('../../../../libs/jquery');
var config = require('./config');
var BACKWARD_COMPATIBLE_MAPPING = require('./constants').AD_SIZE_MAPPING.IAB_SIZES
	.BACKWARD_COMPATIBLE_MAPPING;
var constants = require('./constants');
var { bidderParamsMapping } = require('./multiFormatConfig');
var isApLiteActive = window.adpushup.config.apLiteActive;
var utils = {
	randomAlphaNumericString: function(length) {
		var allChars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			allCharsLength = allChars.length,
			randomString = '';
		for (var i = length; i > 0; --i)
			randomString += allChars[Math.floor(Math.random() * allCharsLength)];
		return randomString;
	},
	currencyConversionActive: function(inputObject) {
		var isValidAdserverCurrency =
				inputObject.adServerCurrency &&
				typeof inputObject.adServerCurrency === 'string' &&
				inputObject.adServerCurrency.length === 3,
			isValidGranularityMultiplier =
				typeof inputObject.granularityMultiplier === 'number' &&
				!isNaN(inputObject.granularityMultiplier);

		return isValidAdserverCurrency && isValidGranularityMultiplier;
	},
	getActiveDFPNetwork: function() {
		if (adp && adp.config) {
			return adp.config.activeDFPNetwork;
		}

		return null;
	},
	getSectionId: function(containerId) {
		if (document.getElementById(containerId)) {
			var parent = document.getElementById(containerId).parentNode;

			if (parent && parent.hasAttribute('data-section')) {
				return parent.getAttribute('data-section');
			}
		}
		return null;
	},
	hashCode: function(str) {
		var hash = 0;
		var char;
		if (str.length === 0) return hash;
		for (var i = 0; i < str.length; i++) {
			char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}

		return hash;
	},
	removeElementArrayFromCollection: function(collection, elArray) {
		var inputCollection = collection.concat([]),
			isValidCollection = !!inputCollection.length,
			isElArray = !!(elArray && elArray.length);

		if (!isValidCollection) {
			return null;
		}

		inputCollection.forEach(function(item, idx) {
			var isElArrayMatch = !!(
				item &&
				isElArray &&
				item[0] === elArray[0] &&
				item[1] === elArray[1]
			);

			if (isElArrayMatch) {
				collection.splice(idx, 1);
				return false;
			}
		});

		return collection;
	},
	addBatchIdToAdpSlots: function(adpSlots, batchId) {
		Object.keys(adpSlots).forEach(function(slot) {
			adpSlots[slot].batchId = batchId;
		});
	},
	getCurrentAdpSlotBatch: function(adpBatches, batchId) {
		return find(adpBatches, function(batch) {
			return batch.batchId === batchId;
		});
	},
	log: function() {
		var queryParams = this.getQueryParams();
		var isQueryParams = !!(
				queryParams &&
				$.isPlainObject(queryParams) &&
				!$.isEmptyObject(queryParams)
			),
			isapDebugParam = !!(isQueryParams && queryParams.apDebug);

		if (typeof console !== 'undefined' && console.log && isapDebugParam)
			console.log.call(console, 'AP:', ...arguments);
	},
	getQueryParams: function() {
		var str = window.location.search,
			objURL = {};

		str.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function($0, $1, $2, $3) {
			var queryStringKey = $1 || '',
				queryStringValue = $3 || '';

			objURL[queryStringKey] = window.decodeURIComponent(
				queryStringValue.replace(/\+/g, ' ')
			);
		});

		return objURL;
	},
	getOriginalOrDownwardSizeBidderParams: function(allSizesParams, inventorySize) {
		if (!allSizesParams || !Object.keys(allSizesParams).length) return;

		if (inventorySize === 'responsivexresponsive' && allSizesParams['responsive'])
			return allSizesParams['responsive'];

		if (allSizesParams[inventorySize]) return allSizesParams[inventorySize];

		for (const originalSize in BACKWARD_COMPATIBLE_MAPPING) {
			const formattedOriginalSize = originalSize.replace(',', 'x');
			if (
				formattedOriginalSize === inventorySize &&
				BACKWARD_COMPATIBLE_MAPPING[originalSize].length
			) {
				const backwardSizes = BACKWARD_COMPATIBLE_MAPPING[originalSize];

				for (let backwardSize of backwardSizes) {
					backwardSize = backwardSize.join('x');
					if (allSizesParams[backwardSize]) return allSizesParams[backwardSize];
				}

				return;
			}
		}
	},
	getVideoOrNativeParams: function(format, bidder) {
		switch (format) {
			case 'video':
				return bidderParamsMapping[bidder].videoParams || {};

			case 'native':
				return bidderParamsMapping[bidder].nativeParams || {};

			default:
				return {};
		}
	},
	getBiddersForSlot: function(size, formats) {
		var width = size[0];
		var height = size[1];
		var size = width + 'x' + height;
		var bidders = [];
		var prebidConfig = config.PREBID_CONFIG;
		var hbConfig = prebidConfig.hbcf;

		if (hbConfig && Object.keys(hbConfig).length) {
			Object.keys(hbConfig).forEach(
				function(bidder) {
					var bidderData = hbConfig[bidder];

					if (!bidderData.isPaused) {
						if (bidderData.sizeLess) {
							var computedBidderObj = {
								bidder: bidder,
								params: bidderData.config
							};

							if (bidderParamsMapping[bidder]) {
								formats.forEach(format => {
									computedBidderObj.params = {
										...this.getVideoOrNativeParams(format, bidder),
										...computedBidderObj.params
									};
								});
							}

							bidders.push(computedBidderObj);
						}

						if (!bidderData.sizeLess && bidderData.reusable) {
							var bidderParams = this.getOriginalOrDownwardSizeBidderParams(
								bidderData.config,
								size
							);

							if (bidderParams) {
								if (bidderParamsMapping[bidder]) {
									formats.forEach(format => {
										bidderParams = {
											...this.getVideoOrNativeParams(format, bidder),
											...bidderParams
										};
									});
								}

								bidders.push({
									bidder: bidder,
									params: bidderParams
								});
							}
						}
					}
				}.bind(this)
			);
		}

		return bidders;
	},
	isPrebidHbEnabled: function(slot) {
		return (
			window.adpushup.services.HB_ACTIVE &&
			slot &&
			slot.headerBidding &&
			slot.bidders &&
			slot.bidders.length
		);
	},
	isAmazonUamEnabled: function(slot) {
		return window.adpushup.services.HB_ACTIVE && slot && slot.headerBidding;
	},
	getVideoPlayerSize: function(prebidSizes) {
		const { VIDEO_PLAYER_EXCEPTION_SIZES } = constants;
		const multipliedValue = prebidSizes.map(val => val.reduce((a, b) => a * b));
		const index = multipliedValue.indexOf(Math.max(...multipliedValue));
		const highestSizeAvailable = prebidSizes[index];

		const highestWidthPossible = highestSizeAvailable[0];
		const highestHeightPossible = highestSizeAvailable[1];
		let playerWidth = highestWidthPossible;
		let playerHeight = highestHeightPossible;
		let gcd;

		/*if (
			highestWidthPossible < highestHeightPossible &&
			highestHeightPossible >= 16 &&
			highestWidthPossible >= 9 &&
			!JSON.stringify(VIDEO_PLAYER_EXCEPTION_SIZES).includes(
				JSON.stringify(highestSizeAvailable)
			)
		) {
			//9:16 aspect ratio
			gcd = parseInt(highestHeightPossible / 16);
			playerHeight = gcd * 16;
			playerWidth = gcd * 9;

			if (highestWidthPossible < playerWidth) {
				gcd = parseInt(highestWidthPossible / 9);
				playerHeight = gcd * 16;
				playerWidth = gcd * 9;
			}
		}*/
		if (
			//highestWidthPossible >= highestHeightPossible &&
			highestWidthPossible >= 16 &&
			highestHeightPossible >= 9 &&
			!JSON.stringify(VIDEO_PLAYER_EXCEPTION_SIZES).includes(
				JSON.stringify(highestSizeAvailable)
			)
		) {
			//16:9 aspect ratio
			gcd = parseInt(highestWidthPossible / 16);
			playerWidth = gcd * 16;
			playerHeight = gcd * 9;

			if (highestHeightPossible < playerHeight) {
				gcd = parseInt(highestHeightPossible / 9);
				playerHeight = gcd * 9;
				playerWidth = gcd * 16;
			}
		}

		return [playerWidth, playerHeight];
	},
	isSlotATF: function(slot) {
		if (!slot) return;

		if (slot.adType === 'sticky') {
			return true;
		}

		var containerId = slot.containerId;
		var $container = $('#' + containerId);

		if ($container.length) {
			if (isApLiteActive && utils.isStickyContainer($container)) {
				return true;
			}

			var aboveTheFoldHeight = $(window).height();

			if (aboveTheFoldHeight) {
				var containerOffsetTop = $container.offset().top,
					containerHeight = $container.height(),
					containerWidth = $container.width();

				var containerOffsetBottom = containerOffsetTop + containerHeight;

				if (containerOffsetTop >= aboveTheFoldHeight) {
					return false;
				}

				if (containerOffsetBottom < aboveTheFoldHeight) {
					return true;
				}

				var containerInViewHeight = aboveTheFoldHeight - containerOffsetTop,
					containerPixel = containerHeight * containerWidth,
					inViewPixel = containerInViewHeight * containerWidth,
					percentageInView = (inViewPixel * 100) / containerPixel;

				return containerPixel < 242000 ? percentageInView >= 50 : percentageInView >= 30;
			}
		}
	},
	isStickyContainer: function($container) {
		/*
			either container should have position fixed
			or any of its parents until body should have position fixed
		*/

		var containerPosition = $container.css('position');
		if (containerPosition === 'fixed') {
			return true;
		}

		var fixedContainerParents = $container.parentsUntil('body').filter(function() {
			return $(this).css('position') === 'fixed';
		});

		if (fixedContainerParents.length) {
			return true;
		}

		return false;
	},
	getSlotRefreshData: function(adpSlot) {
		var keys = constants.ADSERVER_TARGETING_KEYS,
			data = {
				exists: false,
				currentValue: null,
				nextValue: null,
				defaultValue: 0
			},
			existingTargeting = (adpSlot.gSlot && adpSlot.gSlot.getTargetingMap()) || {};

		if (
			!existingTargeting[keys.REFRESH_COUNT] ||
			!existingTargeting[keys.REFRESH_COUNT].length
		) {
			return data;
		}

		data.exists = true;
		data.currentValue = existingTargeting[keys.REFRESH_COUNT][0];

		var parsedCurrentValue = parseInt(data.currentValue, 10);

		if (!isNaN(parsedCurrentValue)) {
			data.currentValue = parsedCurrentValue;
		}

		data.nextValue =
			!isNaN(parsedCurrentValue) && parsedCurrentValue < 20
				? parsedCurrentValue + 1
				: 'more_than_20';

		return data;
	}
};

module.exports = utils;
