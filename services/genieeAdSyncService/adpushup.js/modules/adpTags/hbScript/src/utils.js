// Utility functions

var adp = require('./adp');
var find = require('lodash.find');
var $ = require('../../../../libs/jquery');
var config = require('./config');
var BACKWARD_COMPATIBLE_MAPPING = require('./constants').AD_SIZE_MAPPING.IAB_SIZES
	.BACKWARD_COMPATIBLE_MAPPING;
var { bidderParamsMapping } = require('./multiFormatConfig');
var utils = {
	currencyConversionActive: function(inputObject) {
		var inputObject = inputObject || adp.config,
			isActiveDFPNetwork = !!(
				inputObject.activeDFPNetwork && inputObject.activeDFPNetwork.length
			),
			isActiveDFPCurrencyCode = !!(
				inputObject.activeDFPCurrencyCode &&
				inputObject.activeDFPCurrencyCode.length &&
				inputObject.activeDFPCurrencyCode.length === 3
			),
			isPrebidGranularityMultiplier = !!(
				inputObject.prebidGranularityMultiplier &&
				Number(inputObject.prebidGranularityMultiplier)
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
		}).adpSlots;
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
			console.log.apply(console, arguments);
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
			if (
				originalSize === inventorySize &&
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
	getVideoPlayerSize: function(prebidSizes) {
		const exceptionSizes = [[300, 250], [480, 320], [320, 480], [320, 50]];

		const multipliedValue = prebidSizes.map(val => val.reduce((a, b) => a * b));
		const index = multipliedValue.indexOf(Math.max(...multipliedValue));
		const highestSizeAvailable = prebidSizes[index];

		const width = highestSizeAvailable[0];
		const height = highestSizeAvailable[1];
		let highestWidthPossible = width;
		let highestHeightPossible = height;
		let n1, n2;

		if (
			width < height &&
			!JSON.stringify(exceptionSizes).includes(JSON.stringify(highestSizeAvailable))
		) {
			//9:16 aspect ratio
			n1 = height / 16;
			highestHeightPossible = parseInt(n1) * 16;
			highestWidthPossible = parseInt(n1) * 9;

			if (width < highestWidthPossible) {
				n2 = width / 9;
				highestHeightPossible = parseInt(n2) * 16;
				highestWidthPossible = parseInt(n2) * 9;
			}
		}
		if (
			width >= height &&
			!JSON.stringify(exceptionSizes).includes(JSON.stringify(highestSizeAvailable))
		) {
			//16:9 aspect ratio
			n1 = width / 16;
			highestWidthPossible = parseInt(n1) * 16;
			highestHeightPossible = parseInt(n1) * 9;

			if (height < highestHeightPossible) {
				n2 = height / 9;
				highestHeightPossible = parseInt(n2) * 9;
				highestWidthPossible = parseInt(n2) * 16;
			}
		}

		return [highestWidthPossible, highestHeightPossible];
	}
};

module.exports = utils;
