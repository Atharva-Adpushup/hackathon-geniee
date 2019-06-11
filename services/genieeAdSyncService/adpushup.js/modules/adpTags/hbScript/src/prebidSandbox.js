// Prebid sandboxing module

var prebidAdTemplate = require('./prebidAdTemplate'),
	adpRender = require('./adpRender'),
	config = require('./config'),
	responsiveAds = require('./responsiveAds'),
	adp = require('./adp').adp,
	__FRAME_PREFIX__ = '__adp_frame__',
	utils = require('../helpers/utils'),
	createPrebidContainer = function(adpSlotsBatch) {
		var adUnitCodeForPrebid = [],
			adpBatchId = adpSlotsBatch[0].batchId;

		adpSlotsBatch.forEach(function(adpSlot) {
			var responsiveSizes = [];
			if (adpSlot.isResponsive) {
				responsiveSizes = responsiveAds.getAdSizes(adpSlot.optionalParam.adId).collection;
				adpSlot.computedSizes = responsiveSizes;
			}

			if (!adpSlot.bidders || !adpSlot.bidders.length) {
				return true;
			}

			var size = adpSlot.size,
				computedSizes = adpSlot.isResponsive ? responsiveSizes : adpSlot.computedSizes,
				prebidSizes = computedSizes.length ? computedSizes : [size];
			if (adpSlot.optionalParam.overrideActive && adpSlot.optionalParam.overrideSizeTo) {
				size = adpSlot.optionalParam.overrideSizeTo.split('x');
			}

			adUnitCodeForPrebid.push({
				code: adpSlot.containerId,
				mediaTypes: {
					banner: {
						sizes: prebidSizes
					}
				},
				bids: adpSlot.bidders
			});
		});

		//In case we don't have any bidders available for any of the adslots,
		//this may be due to non availablity of inventory or HB not required option used by user
		if (!adUnitCodeForPrebid.length) {
			return prebidFinishCallback(adpBatchId);
		}

		var prebidHtml = prebidAdTemplate
			.replace('__AD_UNIT_CODE__', JSON.stringify(adUnitCodeForPrebid))
			.replace('__ADP_BATCH_ID__', adpBatchId)
			.replace('__PB_TIMEOUT__', config.PREBID_TIMEOUT)
			.replace('__PAGE_URL__', window.location.href);

		var iframeEl = document.createElement('iframe');
		iframeEl.style.display = 'none';
		iframeEl.id = __FRAME_PREFIX__ + adpBatchId;

		iframeEl.onload = function() {
			//window['__adp_frame_context_' + Math.abs(utils.hashCode(containerId))] = iframeEl.contentWindow;

			if (iframeEl._adp_loaded === undefined) {
				var iframeDoc = iframeEl.contentDocument;
				iframeDoc.open();
				iframeDoc.write(prebidHtml);
				iframeDoc.close();
			}

			iframeEl._adp_loaded = true;
		};

		var waitUntil = setInterval(function() {
			if (document.body) {
				clearInterval(waitUntil);

				var adUnits = utils.getBatchAdUnits(adpSlotsBatch).join(',');
				document.body.appendChild(iframeEl);
			}
		}, 50);
	},
	removeHBIframe = function(adpBatchId) {
		var iframe = document.getElementById(__FRAME_PREFIX__ + adpBatchId);
		document.body.removeChild(iframe);
	},
	// Callback function to set pbjs keys on parent - fired when prebid sandboxing completes
	prebidFinishCallback = function(adpBatchId, timeout) {
		var adpSlots = utils.getCurrentAdpSlotBatch(adp.adpTags.adpBatches, adpBatchId),
			adUnits = utils.getBatchAdUnits(adpSlots).join(',');

		adp.adpTags.batchPrebiddingComplete = true;
		if (Object.keys(adpSlots).length) {
			//function sets google targeting and render the slot, also handle if google slot not available
			adpRender.afterBiddingProcessor(adpSlots);
		}
		return;
	},
	// Callback function to set timeout feedback of bidders - fired when prebid auction times out
	prebidTimeoutCallback = function(adpBatchId, timedOutBidders, timeout) {
		var adpSlots = utils.getCurrentAdpSlotBatch(adp.adpTags.adpBatches, adpBatchId);

		adpSlots.forEach(function(adpSlot) {
			if (adpSlot.bidders && adpSlot.bidders.length) {
				adpSlot.feedback.timedOutBidders = utils.getUniqueValuesArray(timedOutBidders, 'bidder');
				adpSlot.feedback.timeout = timeout;
				adpSlot.hasTimedOut = true;
			}
		});
	};

window.__prebidFinishCallback = prebidFinishCallback;
window.__prebidTimeoutCallback = prebidTimeoutCallback;

module.exports = {
	createPrebidContainer: createPrebidContainer,
	removeHBIframe: removeHBIframe
};
