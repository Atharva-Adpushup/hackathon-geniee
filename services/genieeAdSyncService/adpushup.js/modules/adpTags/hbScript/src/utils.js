// Utility functions

var adp = require('./adp');
var find = require('lodash.find');
var $ = require('../../../../libs/jquery');
var config = require('./config');
var constants = require('./constants');
var { bidderParamsMapping } = require('./multiFormatConfig');
var isApLiteActive = window.adpushup.config.apLiteActive;
var globalSizes = config.SIZE_MAPPING.sizes || [];

var utils = {
	getVastClientType: function(vastXml, adTag) {
		var googleDomainsRegex = 'doubleclick.net|doubleclick.com|google.com|2mdn.net';
		var clientType = 'vast';

		if ((vastXml || adTag).match(new RegExp(googleDomainsRegex))) {
			clientType = 'googima';
		}
		return clientType;
	},
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
		const params = [];

		if (!allSizesParams || !Object.keys(allSizesParams).length) return params;

		if (inventorySize === 'responsivexresponsive') {
			return allSizesParams['responsive'] ? [allSizesParams['responsive']] : params;
		}

		const [width, height] = inventorySize.split('x');
		const BACKWARD_COMPATIBLE_MAPPING = this.getDownwardCompatibleSizesFromGlobalList(
			width,
			height
		);

		for (let size of BACKWARD_COMPATIBLE_MAPPING) {
			size = size.join('x');
			if (allSizesParams[size]) {
				params.push(allSizesParams[size]);
			}
		}

		return params;
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

							if (bidderParams.length) {
								//for (const params of bidderParams) {
								for (let index = 0; index < bidderParams.length; index++) {
									const params = bidderParams[index];
									if (params) {
										let bidderParams = params;

										if (bidderParamsMapping[bidder]) {
											formats.forEach(format => {
												bidderParams = {
													...this.getVideoOrNativeParams(format, bidder),
													...bidderParams
												};
											});
										}

										bidders.push({
											bidder,
											params: bidderParams
										});
									}
								}
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

		if (
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
		}
		if (
			highestWidthPossible >= highestHeightPossible &&
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
	},
	getHighestAliveBid: function(pbjs, adUnitCode, mediaTypesToFilter = []) {
		return pbjs
			.getBidResponsesForAdUnitCode(adUnitCode)
			.bids.filter(bid => {
				var isDesiredMediaType =
					Array.isArray(mediaTypesToFilter) &&
					(!mediaTypesToFilter.length ||
						mediaTypesToFilter.indexOf(bid.mediaType) !== -1);

				var isUnusedBid = bid.status !== 'rendered';

				// Check if bid is not expired
				function isBidAlive() {
					var timeNow = new Date();
					var bidResponseTime = new Date(bid.responseTimestamp);
					var bidAgeInMs = timeNow - bidResponseTime;
					var bidTtlInMs = (bid.ttl - 1) * 1000; // substracted 1s from bid ttl to adjust rendering time

					return bidAgeInMs <= bidTtlInMs;
				}

				return isDesiredMediaType && isUnusedBid && isBidAlive(); // check bid alive only in case of banner
			})
			.reduce((highestBid, currentBid) => {
				if (!highestBid || currentBid.cpm > highestBid.cpm) return currentBid;

				return highestBid;
			}, false);
	},
	getDownwardCompatibleSizes: function(
		maxWidth,
		maxHeight,
		addOriginalSize = true,
		sizes = globalSizes
	) {
		/*
			-	by original size, I mean the size that was used to filter the sizes
			-	we also need the original size in the compatible sizes in most of the cases
			-	for example, if 300 and 200 was used to find the smaller sizes, [300, 200] must also be added to the array
		*/
		let hasOriginalSizeBeenAdded = false;

		// maxHeight = Infinity if we don't find height for responsive ad container and size mapping is not found
		maxWidth = parseInt(maxWidth, 10);
		maxHeight = maxHeight === Infinity ? Infinity : parseInt(maxHeight, 10);

		const compatibleSizes = sizes.filter(size => {
			const [width, height] = size;

			if (width === maxWidth && height === maxHeight) {
				hasOriginalSizeBeenAdded = true;
			}

			return width <= maxWidth && height <= maxHeight;
		});

		if (addOriginalSize && !hasOriginalSizeBeenAdded && maxHeight !== Infinity) {
			compatibleSizes.push([maxWidth, maxHeight]);
		}

		return compatibleSizes.sort((a, b) => b[0] - a[0]);
	},
	getSizeMappingForCurrentViewport: function(sizeMapping) {
		let matchedSizeMapping = null;

		for (let i = 0; i < sizeMapping.length; i++) {
			const { viewportWidth } = sizeMapping[i];
			const mediaQuery = `(max-width:${viewportWidth}px)`;

			if (window.matchMedia(mediaQuery).matches) {
				matchedSizeMapping = sizeMapping[i];
				break;
			}
		}

		return matchedSizeMapping;
	},
	getDimensionsFromSizeMapping: function(slot) {
		let maxWidth = null,
			maxHeight = null;

		const { sizeMapping } = slot;
		const isValidSizeMapping = Array.isArray(sizeMapping) && sizeMapping.length > 0;

		if (isValidSizeMapping) {
			const matchedSizeMapping = this.getSizeMappingForCurrentViewport(sizeMapping);

			if (matchedSizeMapping) {
				({ maxWidth, maxHeight } = matchedSizeMapping);
			}
		}

		return [maxWidth, maxHeight];
	},
	getSizesComputedUsingSizeMappingOrAdUnitSize: function(
		slot,
		useAdUnitSize = true,
		sizes = globalSizes
	) {
		let [maxWidth, maxHeight] = this.getDimensionsFromSizeMapping(slot);

		//  maxWidth, maxHeight can also be 0
		if (maxWidth === null || maxHeight === null) {
			// specifically for apLite slots, since they don't have size
			if (!useAdUnitSize) return null;

			[maxWidth, maxHeight] = slot.size;
		}

		return this.getDownwardCompatibleSizes(maxWidth, maxHeight, true, sizes);
	}
};

module.exports = utils;
