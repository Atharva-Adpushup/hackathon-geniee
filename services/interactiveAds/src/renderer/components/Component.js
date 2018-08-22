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
		const $closeButton = $('<button>'),
			{ CLOSE_BUTTON } = commonConsts,
			formatDataCSS = formatData.placement === 'top' ? CLOSE_BUTTON.CSS.TOP : CLOSE_BUTTON.CSS.BOTTOM;

		return $closeButton
			.css({ ...CLOSE_BUTTON.CSS.COMMON, ...formatDataCSS })
			.text('x')
			.on('click', this.closeAd);
	}

	closeAd() {
		$(this.parentNode).fadeOut(200);
	}

	render() {
		const { formatData, width, height, id } = this.interactiveAd;

		if (this.interactiveAd.network === commonConsts.NETWORKS.ADPTAGS) {
			executeAdpTagsHeadCode([this.interactiveAd], {}); // This function expects an array of adpTags and optional adpKeyValues
		}

		let css = { width, height },
			$format = $('<div />'),
			$banner = null,
			$closeButton = this.createCloseButton(formatData),
			feedbackOptions = {
				ads: [id],
				xpathMiss: [],
				eventType: 1,
				mode: window.adpushup.config.mode,
				referrer: adp.config.referrer,
				tracking: false,
				variationId: !adp.config.manualModeActive
					? adp.config.selectedVariation
					: commonConsts.MANUAL_ADS.VARIATION
			};

		if (adp.config.poweredByBanner) {
			$banner = this.createPoweredByBanner(formatData);
			$format.append($banner);
		}
		$format.append($closeButton);

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

			case commonConsts.FORMATS.IN_VIEW:
				this.initScrollListener();
				break;

			case commonConsts.FORMATS.VIDEO.NAME:
				this.createPlayer();
				break;
		}

		adp.interactiveAds.adsRendered += 1;
		if (Object.keys(adp.interactiveAds.ads).length === adp.interactiveAds.adsRendered && !adp.afterJSExecuted) {
			let variations = adp.config.experiment[adp.config.platform][adp.config.pageGroup].variations,
				variation = null;

			for (let i = 0; i < variations.length; i++) {
				if (variations[i].id === adp.config.selectedVariation) {
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
