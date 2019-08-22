// Top-level component

import commonConsts from '../../commonConsts';
import $ from '../../$';
// import { executeAdpTagsHeadCode } from '../../../../genieeAdSyncService/genieeAp/src/adCodeGenerator';
// import { executeAfterJS } from '../../../../genieeAdSyncService/genieeAp/src/adCreater';

const adp = window.adpushup;

class Component {
	constructor(parentNode, interactiveAd, adCode) {
		this.parentNode = parentNode;
		this.interactiveAd = interactiveAd;
		this.adCode = adCode;
		this.sendFeedback = this.sendFeedback.bind(this);
		this.createPoweredByBanner = this.createPoweredByBanner.bind(this);
		this.createCloseButton = this.createCloseButton.bind(this);
		this.closeAd = this.closeAd.bind(this);
	}

	sendFeedback(options) {
		if (adp && adp.utils && adp.utils.sendFeedback) {
			// adp.utils.sendFeedback(options);
			adp.utils.sendFeedbackOld(options);
		}
	}

	createPoweredByBanner(formatData) {
		const { POWERED_BY_BANNER } = commonConsts;
		const $banner = $('<a />');
		const $logo = $('<img />');

		$logo.attr({ alt: 'AdPushup', src: POWERED_BY_BANNER.IMAGE }).css({ ...POWERED_BY_BANNER.CSS.LOGO });

		return $banner
			.attr({ href: POWERED_BY_BANNER.REDIRECT_URL, target: '_blank' })
			.css({ ...POWERED_BY_BANNER.CSS.COMMON })
			.text(POWERED_BY_BANNER.TEXT)
			.append($logo);
	}

	createCloseButton(formatData) {
		const { CLOSE_BUTTON } = commonConsts;
		const $closeButton = $(CLOSE_BUTTON.IMAGE);
		const formatDataCSS = formatData.placement === 'top' ? CLOSE_BUTTON.CSS.TOP : CLOSE_BUTTON.CSS.BOTTOM;

		return $closeButton.css({ ...CLOSE_BUTTON.CSS.COMMON, ...formatDataCSS }).on('click', this.closeAd);
	}

	closeAd() {
		$(this.parentNode).fadeOut(200);
	}

	render() {
		const { formatData, width, height, id, css: customCSS } = this.interactiveAd;
		const { POWERED_BY_BANNER } = commonConsts;

		adp.interactiveAds.ads[id] = this.interactiveAd;

		if (this.interactiveAd.network === commonConsts.NETWORKS.ADPTAGS) {
			window.adpushup.executeAdpTagsHeadCode([this.interactiveAd], {}); // This function expects an array of adpTags and optional adpKeyValues
		}

		let css = { width, height: parseInt(height) + POWERED_BY_BANNER.HEIGHT, ...customCSS },
			$format = $('<div />'),
			$banner = null,
			$closeButton = this.createCloseButton(formatData),
			feedbackOptions = {
				// ads: [this.interactiveAd],
				xpathMiss: [],
				// eventType: commonConsts.ERROR_CODES.NO_ERROR,
				// mode: window.adpushup.config.mode,
				referrer: adp.config.referrer,
				tracking: false,
				variationId: !adp.config.manualModeActive
					? adp.config.selectedVariation
					: commonConsts.MANUAL_ADS.VARIATION
			},
			$frame = $('<div />'),
			newFeedbackAdObj = $.extend({}, this.interactiveAd);

		// New feedback
		newFeedbackAdObj.status = 1;
		newFeedbackAdObj.ads = [newFeedbackAdObj];
		feedbackOptions.newFeedbackAdObj = newFeedbackAdObj;

		feedbackOptions.eventType = 1;
		feedbackOptions.mode = 1;
		feedbackOptions.ads = [this.interactiveAd.id];

		$format.attr({ id, 'data-section': id, class: '_ap_apex_ad' });
		$frame.css({
			// width,
			...commonConsts.FRAME.CSS.COMMON,
			...commonConsts.FRAME.CSS[formatData.placement.toUpperCase()]
		});

		if (adp.config.poweredByBanner) {
			$banner = this.createPoweredByBanner(formatData);
			$frame.append($banner);
		} else {
			$frame.css({ ...commonConsts.FRAME.CSS.DISABLED_BANNER });
		}
		$frame.append($closeButton);
		// $frame.append('<div style="clear:both">&nbsp;</div>');
		$format.append($frame);

		// adp.tracker.add(
		// 	$format,
		// 	function(adId) {
		// 		adp.utils.sendBeacon(
		// 			adp.config.feedbackUrl,
		// 			{ eventType: 2, click: true, id: adId },
		// 			{},
		// 			commonConsts.BEACON_TYPE.AD_FEEDBACK
		// 		);
		// 	}.bind(adp, id)
		// );

		switch (formatData.type) {
			case commonConsts.FORMATS.STICKY.NAME:
				$format.css({
					...css,
					...commonConsts.FORMAT_CSS,
					...commonConsts.FORMATS.STICKY.BASE_STYLES,
					...this.getPlacementCSS(formatData)
				});
				formatData.placement.toLowerCase() === 'top' ? this.pushContent(formatData) : null;
				this.parentNode.append($format.append(this.adCode));
				break;

			case commonConsts.FORMATS.IN_VIEW.NAME:
				$format.css({
					...css,
					...commonConsts.FORMAT_CSS,
					...commonConsts.FORMATS.IN_VIEW.BASE_STYLES
				});
				this.parentNode.append(
					$format
						.append(this.adCode)
						.hide()
						.fadeIn()
				);
				break;

			case commonConsts.FORMATS.DOCKED.NAME:
				$format.css({
					...css,
					...commonConsts.FORMAT_CSS
				});
				this.parentNode.append($format.append(this.adCode));
				window.adpushup.utils.dockify.dockifyAd(`#${id}`, formatData, window.adpushup.utils);
				break;

			case commonConsts.FORMATS.VIDEO.NAME:
				this.createPlayer();
				break;
		}

		adp.interactiveAds.adsRendered += 1;
		const apConfig = adp.config,
			isConfig = !!apConfig,
			isExperiment = !!(isConfig && apConfig.experiment),
			isExperimentPlatform = !!(isExperiment && apConfig.experiment[apConfig.platform]),
			isExperimentPageGroup = !!(
				isExperimentPlatform && apConfig.experiment[apConfig.platform][apConfig.pageGroup]
			),
			isExperimentVariations = !!(
				isExperimentPageGroup && apConfig.experiment[apConfig.platform][apConfig.pageGroup].variations
			),
			isSelectedVariation = !!apConfig.selectedVariation;

		if (
			Object.keys(adp.interactiveAds.ads).length === adp.interactiveAds.adsRendered &&
			!adp.afterJSExecuted &&
			isExperimentVariations &&
			isSelectedVariation
		) {
			let variations = apConfig.experiment[apConfig.platform][apConfig.pageGroup].variations,
				variation = null;

			for (let i = 0; i < variations.length; i++) {
				if (variations[i].id === apConfig.selectedVariation) {
					variation = variations[i];
				}
			}

			if (variation.customJs.afterAp) {
				adp.executeAfterJS(variation);
			}
		}
		return this.sendFeedback(feedbackOptions);
	}
}

export default Component;
