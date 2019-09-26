// Slot inventory mapper

var adp = require('./adp');
var BACKWARD_COMPATIBLE_MAPPING = require('./constants').AD_SIZE_MAPPING.BACKWARD_COMPATIBLE_MAPPING;
var inventoryMapper = {
	get: function(inventory, size, optionalParam) {
		// Reset inventory as default if site is SPA
		if (adp.config.isSPA) {
			inventory = adp.$.extend(true, {}, window.adpushup.adpTags.defaultInventory);
		}

		var width = size[0];
		var height = size[1];
		var size = width + 'x' + height;
		var dfpAdUnit = null;
		var availableSlots = inventory.dfpAdUnits[size];
		var bidders = [];
		var hbConfig = inventory.hbcf;

		if (optionalParam.headerBidding && hbConfig && Object.keys(hbConfig).length) {
			var updatedSize = size;
			if (optionalParam.overrideActive && optionalParam.overrideSizeTo) {
				updatedSize = optionalParam.overrideSizeTo;
			}

			Object.keys(hbConfig).forEach(function(bidder) {
				var bidderData = hbConfig[bidder];

				if (!bidderData.isPaused) {
					if (bidderData.sizeLess) {
						bidders.push({
							bidder: bidder,
							params: bidderData.config
						});
					}

					function getOriginalOrDownwardSizeBidderParams(allSizesParams, inventorySize) {
						if (!allSizesParams || !Object.keys(allSizesParams).length) return;

						if (
							inventorySize === 'responsivexresponsive' &&
							allSizesParams['responsive']
						) return allSizesParams['responsive'];

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
					}

					if (
						!bidderData.sizeLess &&
						bidderData.reusable
					) {
						const bidderParams = getOriginalOrDownwardSizeBidderParams(bidderData.config, updatedSize);
						
						if (bidderParams) {
							bidders.push({
								bidder: bidder,
								params: bidderParams
							});
						}
					}
				}
			});
		}

		if (availableSlots.length) {
			if (optionalParam.dfpAdunit && availableSlots.indexOf(optionalParam.dfpAdunit) !== -1) {
				if (optionalParam.isManual) {
					dfpAdUnit = optionalParam.dfpAdunit;
				} else {
					dfpAdUnit = availableSlots.splice(
						availableSlots.indexOf(optionalParam.dfpAdunit),
						1
					)[0];
				}
			} else {
				dfpAdUnit = inventory.dfpAdUnits[size].pop();
			}
		}

		return {
			dfpAdUnit: dfpAdUnit,
			bidders: bidders
		};
	}
};

module.exports = inventoryMapper;
