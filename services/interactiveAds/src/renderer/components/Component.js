// Top-level component

import commonConsts from '../../commonConsts';
import $ from '../../$';
import { executeAdpTagsHeadCode } from '../../../../genieeAdSyncService/genieeAp/src/adCodeGenerator';
import { executeAfterJS } from '../../../../genieeAdSyncService/genieeAp/src/adCreater';

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
			adp.utils.sendFeedback(options);
		}
	}

	createPoweredByBanner(formatData) {
		const $banner = $('<a />'),
			{ POWERED_BY_BANNER } = commonConsts,
			formatDataCSS = formatData.placement === 'top' ? POWERED_BY_BANNER.CSS.TOP : POWERED_BY_BANNER.CSS.BOTTOM;

		return $banner
			.attr({ href: POWERED_BY_BANNER.REDIRECT_URL, target: '_blank' })
			.css({ ...POWERED_BY_BANNER.CSS.COMMON, ...formatDataCSS })
			.text(POWERED_BY_BANNER.TEXT);
	}

	createCloseButton(formatData) {
		const $closeButton = $(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 15 15"><path d="M3.25,3.25l8.5,8.5M11.75,3.25l-8.5,8.5"></path></svg>'
		);
		const { CLOSE_BUTTON } = commonConsts;
		const formatDataCSS = formatData.placement === 'top' ? CLOSE_BUTTON.CSS.TOP : CLOSE_BUTTON.CSS.BOTTOM;

		return $closeButton.css({ ...CLOSE_BUTTON.CSS.COMMON, ...formatDataCSS }).on('click', this.closeAd);
	}

	closeAd() {
		$(this.parentNode).fadeOut(200);
	}

	render() {
		const { formatData, width, height, id, css: customCSS } = this.interactiveAd;

		if (this.interactiveAd.network === commonConsts.NETWORKS.ADPTAGS) {
			executeAdpTagsHeadCode([this.interactiveAd], {}); // This function expects an array of adpTags and optional adpKeyValues
		}

		let css = { width, height, ...customCSS },
			$format = $('<div />'),
			$banner = null,
			$closeButton = this.createCloseButton(formatData),
			feedbackOptions = {
				ads: [id],
				xpathMiss: [],
				eventType: 1,
				mode: 1, // Changed it 1 because Innovative Ad is now completely independent of AdPushup Layout Testing
				referrer: adp.config.referrer,
				tracking: false,
				variationId: !adp.config.manualModeActive
					? adp.config.selectedVariation
					: commonConsts.MANUAL_ADS.VARIATION
			},
			$frame = $('<div />');

		$format.attr({ 'data-section': id, class: '_ap_apex_ad' });
		$frame.css({ width, ...commonConsts.FRAME.CSS });

		if (adp.config.poweredByBanner) {
			$banner = this.createPoweredByBanner(formatData);
			$frame.append($banner);
		}
		$frame.append($closeButton);
		$format.append($frame);

		adp.tracker.add(
			$format,
			function(adId) {
				adp.utils.sendBeacon(adp.config.feedbackUrl, { eventType: 2, click: true, id: adId });
			}.bind(adp, id)
		);

		switch (formatData.type) {
			case commonConsts.FORMATS.STICKY.NAME:
				$format.css({
					...css,
					...commonConsts.FORMAT_CSS,
					...commonConsts.FORMATS.STICKY.BASE_STYLES,
					...this.getPlacementCSS(formatData)
				});
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
				executeAfterJS(variation);
			}
		}
		return this.sendFeedback(feedbackOptions);
	}
}

export default Component;
