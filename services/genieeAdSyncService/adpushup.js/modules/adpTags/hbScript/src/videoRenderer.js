// @ts-check
var $ = require('../../../../libs/jquery');
var debounce = require('lodash.debounce');
var utils = require('./utils');
var refreshAdSlot = require('../../../../src/refreshAdSlot');
var prebidDataCollector = require('./prebidDataCollector');
var apUtils = require('../../../../libs/utils');
var config = require('./config');
const multiFormatConfig = require('./multiFormatConfig');

module.exports = function videoRenderer(adpSlot, playerSize, bid) {
	var pbjs = window._apPbJs;
	var container = $(`#${adpSlot.containerId}`);
	var bluebillywig = (window.bluebillywig = window.bluebillywig || {});
	bluebillywig.cmd = bluebillywig.cmd || [];
	var bidWonTime = +new Date();

	function getBbPlayerConfig(bid) {
		const config = {
			code: bid.adUnitCode // Mandatory for stats
		};

		if (bid.vastXml) {
			if (bid.adUnitCode === 'ADP_37780_336X280_1bd7736f-7392-442c-8af5-f7439cb63894') {
				config.vastXml = `<?xml version='1.0' encoding='UTF-8'?>
					<VAST version="2.0">
						<Ad>
							<InLine>
								<AdSystem>onetag</AdSystem>
								<AdTitle><![CDATA[Prebid Video Skippable -- Avocados From Mexico]]></AdTitle>
								<!-- <Impression><![CDATA[https://onetag-sys.com/ping/7hOU6HVGJaq_BQjX42ZcaGM7_ylaJGaAjSKYhuGKykU_pOsyxVAxiBfQdlvo9WWVSikeOIwftlIXtOtYpdS-mzMUjo9AMFkTIUD9KE89j_xGKkqHrmpJHW_2wyha0vndk7tUvqczYpcR2tNgxszsNyE2F0x-FqWEi5tG4RPdHPKCuNMewEaWccIZVqa-KqvkQLO_sgYi6WwN4GIKHK5IfpKSZxZBlhpl4v4Tw-_VSzU;KChyv57HW1MsnxCE9Blq2ctZ_bFb5E5iQRE_gcFAcwbg-80DjzBzCPR5PRxlq0q6:oAaCmRV6kxPamcl72AknUZ1T9wn6ZER8p9AqcqA8UYbWxQULeWgdNMEic6norf0bleEiLG2Hoac1sg82istJHvb8m2gHyxZP4cOPC2Cq6lpFBJ59cbEytrUN9o-guHd7TefSDJz6ECSm7zOZM43KetMp0ESTNaOLi1CmKTCWFF2wvq0lueafz9KZnDl9EbIWImfyKci3XD0-ZOgI7HdJF41ivET0DWBo4xqXMJppBi-jxEgF3_zfMQIcA85eM41q94wJIZIJZJiqZiAorKHpoOUHPyB0EG4A_q_gS35T03EaUxKZlYQy5FtbiwNxNWntG6Bct50eCLDXtuViUL3SN4H3Hpdm9DEJbi9BatqNpb9ikN6LLjHUG0wAiwRhEnZzVZnQBKOOQm6bHj-q8CBzngXzxC_UIcMQ2L249PopGS1V3tRqwxxF2aZ-dLbSsykH:115:0:0:0:0:0:0:0:70c37cdd-a840-476d-8b04-69f3218358d9]]></Impression>
								<Impression><![CDATA[https://onetag-sys.com/ping/7hOU6HVGJaq_BQjX42ZcaGM7_ylaJGaAjSKYhuGKykU_pOsyxVAxiBfQdlvo9WWVSikeOIwftlIXtOtYpdS-mzMUjo9AMFkTIUD9KE89j_xGKkqHrmpJHW_2wyha0vndk7tUvqczYpcR2tNgxszsNyE2F0x-FqWEi5tG4RPdHPKCuNMewEaWccIZVqa-KqvkQLO_sgYi6WwN4GIKHK5IfpKSZxZBlhpl4v4Tw-_VSzU;KChyv57HW1MsnxCE9Blq2ctZ_bFb5E5iQRE_gcFAcwbg-80DjzBzCPR5PRxlq0q6:oAaCmRV6kxPamcl72AknUZ1T9wn6ZER8p9AqcqA8UYbWxQULeWgdNMEic6norf0bleEiLG2Hoac1sg82istJHvb8m2gHyxZP4cOPC2Cq6lpFBJ59cbEytrUN9o-guHd7TefSDJz6ECSm7zOZM43KetMp0ESTNaOLi1CmKTCWFF2wvq0lueafz9KZnDl9EbIWImfyKci3XD0-ZOgI7HdJF41ivET0DWBo4xqXMJppBi-jxEgF3_zfMQIcA85eM41q94wJIZIJZJiqZiAorKHpoOUHPyB0EG4A_q_gS35T03EaUxKZlYQy5FtbiwNxNWntG6Bct50eCLDXtuViUL3SN4H3Hpdm9DEJbi9BatqNpb9ikN6LLjHUG0wAiwRhEnZzVZnQBKOOQm6bHj-q8CBzngXzxC_UIcMQ2L249PopGS1V3tRqwxxF2aZ-dLbSsykH:1:0:0:0:0:0:0:0:70c37cdd-a840-476d-8b04-69f3218358d9]]></Impression>
								<Impression><![CDATA[https://onetag-sys.com/ping/7hOU6HVGJaq_BQjX42ZcaGM7_ylaJGaAjSKYhuGKykU_pOsyxVAxiBfQdlvo9WWVSikeOIwftlIXtOtYpdS-mzMUjo9AMFkTIUD9KE89j_xGKkqHrmpJHW_2wyha0vndk7tUvqczYpcR2tNgxszsNyE2F0x-FqWEi5tG4RPdHPKCuNMewEaWccIZVqa-KqvkQLO_sgYi6WwN4GIKHK5IfpKSZxZBlhpl4v4Tw-_VSzU;KChyv57HW1MsnxCE9Blq2ctZ_bFb5E5iQRE_gcFAcwbg-80DjzBzCPR5PRxlq0q6:oAaCmRV6kxPamcl72AknUZ1T9wn6ZER8p9AqcqA8UYbWxQULeWgdNMEic6norf0bleEiLG2Hoac1sg82istJHvb8m2gHyxZP4cOPC2Cq6lpFBJ59cbEytrUN9o-guHd7TefSDJz6ECSm7zOZM43KetMp0ESTNaOLi1CmKTCWFF2wvq0lueafz9KZnDl9EbIWImfyKci3XD0-ZOgI7HdJF41ivET0DWBo4xqXMJppBi-jxEgF3_zfMQIcA85eM41q94wJIZIJZJiqZiAorKHpoOUHPyB0EG4A_q_gS35T03EaUxKZlYQy5FtbiwNxNWntG6Bct50eCLDXtuViUL3SN4H3Hpdm9DEJbi9BatqNpb9ikN6LLjHUG0wAiwRhEnZzVZnQBKOOQm6bHj-q8CBzngXzxC_UIcMQ2L249PopGS1V3tRqwxxF2aZ-dLbSsykH:128:0:0:0:0:0:0:0:70c37cdd-a840-476d-8b04-69f3218358d9]]></Impression>
								<Impression><![CDATA[http://track.adform.net/adfserve/?bn=41297041;srctype=4;ord=1604492842411]]></Impression> -->
								<Creatives>
									<Creative id="1">
										<Linear skipoffset="00:00:05">
											<Duration>00:00:20</Duration>
											<TrackingEvents>
												<!-- <Tracking event="start"><![CDATA[https://onetag-sys.com/ping/7hOU6HVGJaq_BQjX42ZcaGM7_ylaJGaAjSKYhuGKykU_pOsyxVAxiBfQdlvo9WWVSikeOIwftlIXtOtYpdS-mzMUjo9AMFkTIUD9KE89j_xGKkqHrmpJHW_2wyha0vndk7tUvqczYpcR2tNgxszsNyE2F0x-FqWEi5tG4RPdHPKCuNMewEaWccIZVqa-KqvkQLO_sgYi6WwN4GIKHK5IfpKSZxZBlhpl4v4Tw-_VSzU;KChyv57HW1MsnxCE9Blq2ctZ_bFb5E5iQRE_gcFAcwbg-80DjzBzCPR5PRxlq0q6:oAaCmRV6kxPamcl72AknUZ1T9wn6ZER8p9AqcqA8UYbWxQULeWgdNMEic6norf0bleEiLG2Hoac1sg82istJHvb8m2gHyxZP4cOPC2Cq6lpFBJ59cbEytrUN9o-guHd7TefSDJz6ECSm7zOZM43KetMp0ESTNaOLi1CmKTCWFF2wvq0lueafz9KZnDl9EbIWImfyKci3XD0-ZOgI7HdJF41ivET0DWBo4xqXMJppBi-jxEgF3_zfMQIcA85eM41q94wJIZIJZJiqZiAorKHpoOUHPyB0EG4A_q_gS35T03EaUxKZlYQy5FtbiwNxNWntG6Bct50eCLDXtuViUL3SN4H3Hpdm9DEJbi9BatqNpb9ikN6LLjHUG0wAiwRhEnZzVZnQBKOOQm6bHj-q8CBzngXzxC_UIcMQ2L249PopGS1V3tRqwxxF2aZ-dLbSsykH:20:0:0:0:0:0:0:0:70c37cdd-a840-476d-8b04-69f3218358d9]]></Tracking>
												<Tracking event="firstQuartile"><![CDATA[https://onetag-sys.com/ping/7hOU6HVGJaq_BQjX42ZcaGM7_ylaJGaAjSKYhuGKykU_pOsyxVAxiBfQdlvo9WWVSikeOIwftlIXtOtYpdS-mzMUjo9AMFkTIUD9KE89j_xGKkqHrmpJHW_2wyha0vndk7tUvqczYpcR2tNgxszsNyE2F0x-FqWEi5tG4RPdHPKCuNMewEaWccIZVqa-KqvkQLO_sgYi6WwN4GIKHK5IfpKSZxZBlhpl4v4Tw-_VSzU;KChyv57HW1MsnxCE9Blq2ctZ_bFb5E5iQRE_gcFAcwbg-80DjzBzCPR5PRxlq0q6:oAaCmRV6kxPamcl72AknUZ1T9wn6ZER8p9AqcqA8UYbWxQULeWgdNMEic6norf0bleEiLG2Hoac1sg82istJHvb8m2gHyxZP4cOPC2Cq6lpFBJ59cbEytrUN9o-guHd7TefSDJz6ECSm7zOZM43KetMp0ESTNaOLi1CmKTCWFF2wvq0lueafz9KZnDl9EbIWImfyKci3XD0-ZOgI7HdJF41ivET0DWBo4xqXMJppBi-jxEgF3_zfMQIcA85eM41q94wJIZIJZJiqZiAorKHpoOUHPyB0EG4A_q_gS35T03EaUxKZlYQy5FtbiwNxNWntG6Bct50eCLDXtuViUL3SN4H3Hpdm9DEJbi9BatqNpb9ikN6LLjHUG0wAiwRhEnZzVZnQBKOOQm6bHj-q8CBzngXzxC_UIcMQ2L249PopGS1V3tRqwxxF2aZ-dLbSsykH:21:0:0:0:0:0:0:0:70c37cdd-a840-476d-8b04-69f3218358d9]]></Tracking>
												<Tracking event="midpoint"><![CDATA[https://onetag-sys.com/ping/7hOU6HVGJaq_BQjX42ZcaGM7_ylaJGaAjSKYhuGKykU_pOsyxVAxiBfQdlvo9WWVSikeOIwftlIXtOtYpdS-mzMUjo9AMFkTIUD9KE89j_xGKkqHrmpJHW_2wyha0vndk7tUvqczYpcR2tNgxszsNyE2F0x-FqWEi5tG4RPdHPKCuNMewEaWccIZVqa-KqvkQLO_sgYi6WwN4GIKHK5IfpKSZxZBlhpl4v4Tw-_VSzU;KChyv57HW1MsnxCE9Blq2ctZ_bFb5E5iQRE_gcFAcwbg-80DjzBzCPR5PRxlq0q6:oAaCmRV6kxPamcl72AknUZ1T9wn6ZER8p9AqcqA8UYbWxQULeWgdNMEic6norf0bleEiLG2Hoac1sg82istJHvb8m2gHyxZP4cOPC2Cq6lpFBJ59cbEytrUN9o-guHd7TefSDJz6ECSm7zOZM43KetMp0ESTNaOLi1CmKTCWFF2wvq0lueafz9KZnDl9EbIWImfyKci3XD0-ZOgI7HdJF41ivET0DWBo4xqXMJppBi-jxEgF3_zfMQIcA85eM41q94wJIZIJZJiqZiAorKHpoOUHPyB0EG4A_q_gS35T03EaUxKZlYQy5FtbiwNxNWntG6Bct50eCLDXtuViUL3SN4H3Hpdm9DEJbi9BatqNpb9ikN6LLjHUG0wAiwRhEnZzVZnQBKOOQm6bHj-q8CBzngXzxC_UIcMQ2L249PopGS1V3tRqwxxF2aZ-dLbSsykH:22:0:0:0:0:0:0:0:70c37cdd-a840-476d-8b04-69f3218358d9]]></Tracking>
												<Tracking event="thirdQuartile"><![CDATA[https://onetag-sys.com/ping/7hOU6HVGJaq_BQjX42ZcaGM7_ylaJGaAjSKYhuGKykU_pOsyxVAxiBfQdlvo9WWVSikeOIwftlIXtOtYpdS-mzMUjo9AMFkTIUD9KE89j_xGKkqHrmpJHW_2wyha0vndk7tUvqczYpcR2tNgxszsNyE2F0x-FqWEi5tG4RPdHPKCuNMewEaWccIZVqa-KqvkQLO_sgYi6WwN4GIKHK5IfpKSZxZBlhpl4v4Tw-_VSzU;KChyv57HW1MsnxCE9Blq2ctZ_bFb5E5iQRE_gcFAcwbg-80DjzBzCPR5PRxlq0q6:oAaCmRV6kxPamcl72AknUZ1T9wn6ZER8p9AqcqA8UYbWxQULeWgdNMEic6norf0bleEiLG2Hoac1sg82istJHvb8m2gHyxZP4cOPC2Cq6lpFBJ59cbEytrUN9o-guHd7TefSDJz6ECSm7zOZM43KetMp0ESTNaOLi1CmKTCWFF2wvq0lueafz9KZnDl9EbIWImfyKci3XD0-ZOgI7HdJF41ivET0DWBo4xqXMJppBi-jxEgF3_zfMQIcA85eM41q94wJIZIJZJiqZiAorKHpoOUHPyB0EG4A_q_gS35T03EaUxKZlYQy5FtbiwNxNWntG6Bct50eCLDXtuViUL3SN4H3Hpdm9DEJbi9BatqNpb9ikN6LLjHUG0wAiwRhEnZzVZnQBKOOQm6bHj-q8CBzngXzxC_UIcMQ2L249PopGS1V3tRqwxxF2aZ-dLbSsykH:23:0:0:0:0:0:0:0:70c37cdd-a840-476d-8b04-69f3218358d9]]></Tracking>
												<Tracking event="complete"><![CDATA[https://onetag-sys.com/ping/7hOU6HVGJaq_BQjX42ZcaGM7_ylaJGaAjSKYhuGKykU_pOsyxVAxiBfQdlvo9WWVSikeOIwftlIXtOtYpdS-mzMUjo9AMFkTIUD9KE89j_xGKkqHrmpJHW_2wyha0vndk7tUvqczYpcR2tNgxszsNyE2F0x-FqWEi5tG4RPdHPKCuNMewEaWccIZVqa-KqvkQLO_sgYi6WwN4GIKHK5IfpKSZxZBlhpl4v4Tw-_VSzU;KChyv57HW1MsnxCE9Blq2ctZ_bFb5E5iQRE_gcFAcwbg-80DjzBzCPR5PRxlq0q6:oAaCmRV6kxPamcl72AknUZ1T9wn6ZER8p9AqcqA8UYbWxQULeWgdNMEic6norf0bleEiLG2Hoac1sg82istJHvb8m2gHyxZP4cOPC2Cq6lpFBJ59cbEytrUN9o-guHd7TefSDJz6ECSm7zOZM43KetMp0ESTNaOLi1CmKTCWFF2wvq0lueafz9KZnDl9EbIWImfyKci3XD0-ZOgI7HdJF41ivET0DWBo4xqXMJppBi-jxEgF3_zfMQIcA85eM41q94wJIZIJZJiqZiAorKHpoOUHPyB0EG4A_q_gS35T03EaUxKZlYQy5FtbiwNxNWntG6Bct50eCLDXtuViUL3SN4H3Hpdm9DEJbi9BatqNpb9ikN6LLjHUG0wAiwRhEnZzVZnQBKOOQm6bHj-q8CBzngXzxC_UIcMQ2L249PopGS1V3tRqwxxF2aZ-dLbSsykH:24:0:0:0:0:0:0:0:70c37cdd-a840-476d-8b04-69f3218358d9]]></Tracking> -->
											</TrackingEvents>
											<VideoClicks>
												<!-- <ClickThrough><![CDATA[https://track.adform.net/C/?bn=41297041]]></ClickThrough>
												<ClickTracking><![CDATA[https://onetag-sys.com/ping/7hOU6HVGJaq_BQjX42ZcaGM7_ylaJGaAjSKYhuGKykU_pOsyxVAxiBfQdlvo9WWVSikeOIwftlIXtOtYpdS-mzMUjo9AMFkTIUD9KE89j_xGKkqHrmpJHW_2wyha0vndk7tUvqczYpcR2tNgxszsNyE2F0x-FqWEi5tG4RPdHPKCuNMewEaWccIZVqa-KqvkQLO_sgYi6WwN4GIKHK5IfpKSZxZBlhpl4v4Tw-_VSzU;KChyv57HW1MsnxCE9Blq2ctZ_bFb5E5iQRE_gcFAcwbg-80DjzBzCPR5PRxlq0q6:oAaCmRV6kxPamcl72AknUZ1T9wn6ZER8p9AqcqA8UYbWxQULeWgdNMEic6norf0bleEiLG2Hoac1sg82istJHvb8m2gHyxZP4cOPC2Cq6lpFBJ59cbEytrUN9o-guHd7TefSDJz6ECSm7zOZM43KetMp0ESTNaOLi1CmKTCWFF2wvq0lueafz9KZnDl9EbIWImfyKci3XD0-ZOgI7HdJF41ivET0DWBo4xqXMJppBi-jxEgF3_zfMQIcA85eM41q94wJIZIJZJiqZiAorKHpoOUHPyB0EG4A_q_gS35T03EaUxKZlYQy5FtbiwNxNWntG6Bct50eCLDXtuViUL3SN4H3Hpdm9DEJbi9BatqNpb9ikN6LLjHUG0wAiwRhEnZzVZnQBKOOQm6bHj-q8CBzngXzxC_UIcMQ2L249PopGS1V3tRqwxxF2aZ-dLbSsykH:2:0:0:0:0:0:0:0:70c37cdd-a840-476d-8b04-69f3218358d9]]></ClickTracking> -->
											</VideoClicks>
											<MediaFiles>
												<MediaFile id="1" delivery="progressive" type="video/mp4" bitrate="529" width="640" height="360" scalable="true" maintainAspectRatio="true"><![CDATA[http://staging.adpushup.com:8022/single-video/mp4.mp4]]></MediaFile>
											</MediaFiles>
										</Linear>
									</Creative>
								</Creatives>
							</InLine>
						</Ad>
					</VAST>`;
			} else {
				config.vastXml = bid.vastXml;
			}
		} else if (bid.vastUrl) {
			config.vastUrl = bid.vastUrl;
		} else {
			return false;
		}

		return config;
	}

	function getBbPlayerRendererId() {
		const { PUBLICATION } = multiFormatConfig.BB_PLAYER_CONFIG;
		return `${PUBLICATION}-${bid.adUnitCode}`; // This is convention to find the renderer on the page
	}

	function getBbPlayerRenderer() {
		const rendererId = getBbPlayerRendererId();

		return bluebillywig.renderers.find(renderer => renderer._id === rendererId);
	}

	function renderBbPlayer(bbPlayerConfig, slotEl) {
		const renderer = getBbPlayerRenderer();
		if (!renderer) return;

		renderer.bootstrap(bbPlayerConfig, slotEl);
	}

	function getBbPlayerId() {
		return '/p/inarticle/a/' + bid.adUnitCode;
	}

	function customizeBbPlayer(playerApi, slotAttributesToMigrate, preservedSlotElDataset) {
		const [width, height] = playerSize;
		// Resize player to ad size
		bluebillywig
			.jQuery(playerApi.getWrapper())
			.data('Sizer')
			.setWrapperSize(width, height);

		playerApi.setFitMode('FIT_SMART');

		// var playerElem = document.getElementById(bid.adUnitCode);

		// // Center Align BB Player
		// playerElem.style.margin = '0 auto';

		// // migrate slot attributes to player el
		// slotAttributesToMigrate.forEach(
		// 	attrName =>
		// 		preservedSlotElDataset[attrName] !== undefined &&
		// 		(playerElem.dataset[attrName] = preservedSlotElDataset[attrName])
		// );
	}

	function removeBbPlayer(playerApi) {
		playerApi.destruct();

		// Remove queue handlers that shouldn't exist anymore
		if (
			Array.isArray(bluebillywig._cmdQueueHandlers) &&
			bluebillywig._cmdQueueHandlers.length
		) {
			bluebillywig._cmdQueueHandlers.shift();
		}
	}

	function cleanBbPlayerAndRenderBid(playerApi, bid, refreshData = {}) {
		// clean container
		removeBbPlayer(playerApi);

		var { adId, refreshTimeoutId, refreshExtendTimeInMs } = refreshData;

		if (adId && refreshTimeoutId && refreshExtendTimeInMs) {
			// clear existing refresh timeout
			clearTimeout(refreshTimeoutId);

			// set new refresh timeout
			refreshAdSlot.setRefreshTimeOutByAdId(adId, refreshExtendTimeInMs);
		}

		pbjs.renderAd(utils.getIframeDocument(container), bid.adId);
	}

	var setupPlayerEvents = function(playerApi) {
		// setup listener for adstarted event to send bid won feedback for video bids.
		playerApi.on('adstarted', function() {
			prebidDataCollector.collectBidWonData(bid);
		});

		// listen video finished event
		playerApi.on('adfinished', function() {
			// check if there is any another highest alive unused bid in cache
			var highestAliveBid = utils.getHighestAliveBid(pbjs, bid.adUnitCode);

			if (highestAliveBid) {
				var refreshData = refreshAdSlot.getRefreshDataByAdId(adpSlot.optionalParam.adId);

				if (!refreshData) return;

				var { refreshTimeLeftInMs, refreshTimeoutId } = refreshData;
				var minRefreshTimeoutForImpInMs = 1000;

				// If refresh time left is greater than 1s
				if (refreshTimeLeftInMs >= minRefreshTimeoutForImpInMs) {
					cleanBbPlayerAndRenderBid(playerApi, highestAliveBid);
				}
				// If refresh time left is less than 1s
				else if (
					refreshTimeLeftInMs < minRefreshTimeoutForImpInMs &&
					refreshTimeLeftInMs >= 0
				) {
					// Render cached bid
					cleanBbPlayerAndRenderBid(playerApi, highestAliveBid, {
						adId: adpSlot.optionalParam.adId,
						refreshTimeoutId,
						refreshExtendTimeInMs: minRefreshTimeoutForImpInMs
					});
				}
			}
		});

		// ad-hoc data logging
		var bbPlayerEvents = ['error', 'aderror', 'adstarted'];
		bbPlayerEvents.forEach(function(eventName) {
			playerApi.on(eventName, function(e) {
				console.log(`bbPlayer: ${eventName} event fired for ${bid.adUnitCode}: `, e);

				// window.adpushup.$.ajax({
				// 	type: 'POST',
				// 	// TODO: bbPlayer: vast dump service endpoints need to be udpated according to new event names
				// 	url: '//vastdump-staging.adpushup.com/' + eventName,
				// 	data: JSON.stringify({
				// 		data: JSON.stringify(e), // TODO: bbPlayer: `e` is the refrence to DOM, stringify is throwing "Uncaught TypeError: Converting circular structure to JSON"
				// 		bid: JSON.stringify(bid),
				// 		eventTime: +new Date(),
				// 		bidWonTime: bidWonTime,
				// 		auctionId: bid.auctionId || '',
				// 		requestId: bid.requestId || ''
				// 	}),
				// 	contentType: 'application/json',
				// 	processData: false,
				// 	dataType: 'json'
				// });
			});
		});
	};

	function preserveSlotData(slotEl) {
		return {
			preservedSlotElDataset:
				(slotEl && {
					...slotEl.dataset
				}) ||
				{},
			slotAttributesToMigrate: ['renderTime', 'refreshTime', 'timeout']
		};
	}

	function renderVideoBid() {
		// TODO: bbPlayer: temp, remove bbCounter
		// if (!window.bbCounter) window.bbCounter = 0;
		// window.bbCounter++;
		// if (window.bbCounter > 1) {
		// 	return;
		// }
		// if (bid.adUnitCode === 'ADP_37780_728X90_560740ef-114b-4b94-8a1b-52dc344b2054') {
		// 	console.log('video rendering started');
		// } else {
		// 	return;
		// }

		// push to render queue because bbPlayer may not be loaded yet.
		bid.renderer.push(() => {
			var bbPlayerApi;
			var slotEl = document.getElementById(bid.adUnitCode);

			// remove if player has already rendered
			// TODO: bbPlayer: review if there is any case where bbPlayerApi.getState() is returning falsy value
			if (bbPlayerApi && !!bbPlayerApi.getState()) {
				removeBbPlayer(bbPlayerApi);
			}

			// get existing refresh data from slot (not container)
			var { preservedSlotElDataset, slotAttributesToMigrate } = preserveSlotData(slotEl);

			var bbPlayerConfig = getBbPlayerConfig(bid);
			if (!bbPlayerConfig) return; // TODO: bbPlayer: review this

			window.instantiateBbPlayer(bid.adUnitCode);
			renderBbPlayer(bbPlayerConfig, slotEl);

			// Get BB Player Instance
			bluebillywig.cmd.push({
				playerId: getBbPlayerId(),
				callback: function(playerApi) {
					console.log(`bbPlayer: cmd que fired`);

					bbPlayerApi = playerApi;

					customizeBbPlayer(playerApi, slotAttributesToMigrate, preservedSlotElDataset);

					setupPlayerEvents(playerApi);
				}
			});
		});
	}

	var videoSlotInViewWatcher = (function() {
		var bannerAdRenderedTime = new Date();
		var watcherExpiryTimeInMs = 1000;
		var watcherInterval = 50;
		var timeoutId;
		var scrollEventListener;

		return function watcher() {
			var currentTime = new Date();
			var timeSpentInMs = currentTime - bannerAdRenderedTime;

			if (
				!apUtils.checkElementInViewPercent(container) &&
				(config.VIDEO_WAIT_LIMIT_DISABLED ||
					(timeSpentInMs < watcherExpiryTimeInMs && !timeoutId))
			) {
				var computedWatcherInterval = config.VIDEO_WAIT_LIMIT_DISABLED
					? watcherInterval
					: watcherExpiryTimeInMs - timeSpentInMs;

				timeoutId = setTimeout(() => {
					watcher();
				}, computedWatcherInterval);

				var inViewCheck = () => {
					if (apUtils.checkElementInViewPercent(container)) {
						watcher();
					}
				};

				if (!config.VIDEO_WAIT_LIMIT_DISABLED) {
					scrollEventListener = debounce(inViewCheck, 50);
					window.addEventListener('scroll', scrollEventListener);
				}
			} else {
				/**
				 * Clear timeout and scroll event listners
				 * first before rendering video bid
				 */
				if (timeoutId) clearTimeout(timeoutId);
				if (scrollEventListener) window.removeEventListener('scroll', scrollEventListener);

				adpSlot.feedbackSent = false; // reset feedbackSent status for current slot

				renderVideoBid();
			}
		};
	})();

	var highestAliveBannerBid = utils.getHighestAliveBid(pbjs, bid.adUnitCode, ['banner']);

	renderVideoBid();

	// slot is not in view
	// and have alive banner bid then render banner bid
	// if (!apUtils.checkElementInViewPercent(container) && highestAliveBannerBid) {
	// 	console.log(`bbPlayer: ${bid.adUnitCode} is not in view`);
	// 	pbjs.renderAd(utils.getIframeDocument(container), highestAliveBannerBid.adId);

	// 	// send banner bid won feedback
	// 	prebidDataCollector.collectBidWonData(highestAliveBannerBid);

	// 	// Replace it with video ad when slot come back in view
	// 	videoSlotInViewWatcher();
	// }
	// // otherwise render video
	// else {
	// 	console.log(`bbPlayer: ${bid.adUnitCode} is in view`);
	// 	renderVideoBid();
	// }
};
