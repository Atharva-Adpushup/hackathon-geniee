// Prebid sandboxing module

var adRenderingTemplate = require('./config').PREBID_AD_TEMPLATE,
	adpRender = require('./adpRender'),
	config = require('./config'),
	find = require('lodash.find'),
	__FRAME_PREFIX__ = '__adp_frame__',
	logger = require('../helpers/logger'),
	utils = require('../helpers/utils'),
	// hbStatus = require('./hbStatus'),
	createPrebidContainer = function(adpSlotsBatch) {
		var adUnitCodeForPrebid = [],
			adpBatchId = adpSlotsBatch[0].batchId;

		adpSlotsBatch.forEach(function(adpSlot) {
			if (!adpSlot.bidders || !adpSlot.bidders.length) {
				return true;
			}
			adUnitCodeForPrebid.push({
				code: adpSlot.containerId,
				sizes: [adpSlot.size],
				bids: adpSlot.bidders
			});
		});

		//In case we don't have any bidders available for any of the adslots,
		//this may be due to non availablity of inventory or HB not required option used by user
		if (!adUnitCodeForPrebid.length) {
			return prebidFinishCallback({}, adpBatchId);
		}

		var c1xSiteId =
				config.INVENTORY.hbConfig && config.INVENTORY.hbConfig.additionalOptions
					? config.INVENTORY.hbConfig.additionalOptions.c1xSiteId
					: '',
			prebidHtml = adRenderingTemplate
				.replace('__AD_UNIT_CODE__', JSON.stringify(adUnitCodeForPrebid))
				.replace('__ADP_BATCH_ID__', adpBatchId)
				.replace('__PB_TIMEOUT__', config.PREBID_TIMEOUT)
				.replace('__C1X_PIXEL_ID__', config.C1X.pixelId)
				.replace('__C1X_SITE_ID__', c1xSiteId)
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
				logger.log('Running bid auction...');

				var adUnits = utils.getBatchAdUnits(adpSlotsBatch).join(',');
				// hbStatus.hbStart(adUnits);

				document.body.appendChild(iframeEl);
			}
		}, 50);
	},
	removeHBIframe = function(adpBatchId) {
		var iframe = document.getElementById(__FRAME_PREFIX__ + adpBatchId);
		document.body.removeChild(iframe);
	},
	setPbjsKeys = function(pbjsParams) {
		Object.keys(pbjsParams).forEach(function(pbjsKey) {
			pbjs[pbjsKey] = pbjsParams[pbjsKey].concat(pbjs[pbjsKey]);
		});
	},
	// Callback function to set pbjs keys on parent - fired when prebid sandboxing completes
	prebidFinishCallback = function(pbjsParams, adpBatchId, timeout) {
		var adpSlots = utils.getCurrentAdpSlotBatch(adpTags.adpBatches, adpBatchId),
			adUnits = utils.getBatchAdUnits(adpSlots).join(',');
		// hbStatus.hbEnd(adUnits);

		adpTags.batchPrebiddingComplete = true;
		if (Object.keys(adpSlots).length) {
			logger.log('Bidding complete');
			pbjs.que.push(function() {
				setPbjsKeys(pbjsParams);
				//removeHBIframe(adpBatchId);
			});
			//function sets google targeting and render the slot, also handle if google slot not available
			adpRender.afterBiddingProcessor(adpSlots);
		}
		return;
	},
	// Callback function to set timeout feedback of bidders - fired when prebid auction times out
	prebidTimeoutCallback = function(adpBatchId, timedOutBidders, timeout) {
		logger.log('Bid request timed out');
		logger.log(timedOutBidders);

		var adpSlots = utils.getCurrentAdpSlotBatch(adpTags.adpBatches, adpBatchId);

		adpSlots.forEach(function(adpSlot) {
			if (adpSlot.bidders && adpSlot.bidders.length) {
				adpSlot.feedback.timedOutBidders = timedOutBidders;
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
