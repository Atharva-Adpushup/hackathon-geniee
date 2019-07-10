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
	}

	sendFeedback(options) {
		if (adp && adp.utils && adp.utils.sendFeedback) {
			adp.utils.sendFeedback(options);
			adp.utils.sendFeedbackOld(options);
		}
	}

	createPoweredByBanner(formatData) {
		const { POWERED_BY_BANNER } = commonConsts;
		const $banner = $('<a />');
		const $logo = $('<img />');

		$logo
			.attr({ alt: 'AdPushup', src: POWERED_BY_BANNER.IMAGE })
			.css({ ...POWERED_BY_BANNER.CSS.LOGO });

		return $banner
			.attr({ href: POWERED_BY_BANNER.REDIRECT_URL, target: '_blank' })
			.css({ ...POWERED_BY_BANNER.CSS.COMMON })
			.text(POWERED_BY_BANNER.TEXT)
			.append($logo);
	}

	createCloseButton(formatData) {
		const { CLOSE_BUTTON } = commonConsts;
		const $closeButton = $(CLOSE_BUTTON.IMAGE);
		const formatDataCSS =
			formatData.placement === 'top' ? CLOSE_BUTTON.CSS.TOP : CLOSE_BUTTON.CSS.BOTTOM;

		return $closeButton
			.css({ ...CLOSE_BUTTON.CSS.COMMON, ...formatDataCSS })
			.on('click', this.closeAd);
	}

	closeAd() {
		$(this.parentNode).fadeOut(200);
	}

	render() {
		const { formatData, width, height, id } = this.interactiveAd;
		adp.interactiveAds.ads[id] = this.interactiveAd;

		if (this.interactiveAd.network === commonConsts.NETWORKS.ADPTAGS) {
			executeAdpTagsHeadCode([this.interactiveAd], {}); // This function expects an array of adpTags and optional adpKeyValues
		}

		const css = {
<<<<<<< HEAD
=======
			width,
			height: parseInt(height) + POWERED_BY_BANNER.HEIGHT,
			...formatData.css,
			...customCSS
		};

		const $format = $('<div />');

		let $banner = null;

		const $closeButton = this.createCloseButton(formatData);

		const feedbackOptions = {
			ads: [id],
			xpathMiss: [],
			eventType: 1,
			mode: 1, // Changed it 1 because Innovative Ad is now completely independent of AdPushup Layout Testing
			referrer: adp.config.referrer,
			tracking: false,
			variationId: !adp.config.manualModeActive
				? adp.config.selectedVariation
				: commonConsts.MANUAL_ADS.VARIATION
		};

		const $frame = $('<div />');

		$format.attr({ id, 'data-section': id, class: '_ap_apex_ad' });
		$frame.css({
>>>>>>> acf4b5b5f73efb26120936d47ce9b7e42b1f26b1
			width,
			height: parseInt(height) + POWERED_BY_BANNER.HEIGHT,
			...formatData.css,
			...customCSS
		};

		const $format = $('<div />');

		let $banner = null;

		const $closeButton = this.createCloseButton(formatData);

		const feedbackOptions = {
			ads: [id],
			xpathMiss: [],
			eventType: 1,
			mode: 1, // Changed it 1 because Innovative Ad is now completely independent of AdPushup Layout Testing
			referrer: adp.config.referrer,
			tracking: false,
			variationId: !adp.config.manualModeActive
				? adp.config.selectedVariation
				: commonConsts.MANUAL_ADS.VARIATION
		};

		const $frame = $('<div />');

		$format.attr({ id, 'data-section': id, class: '_ap_apex_ad' });

		adp.tracker.add(
			$format,
			(adId => {
				adp.utils.sendBeacon(adp.config.feedbackUrl, { eventType: 2, click: true, id: adId });
			}).bind(adp, id)
		);

		switch (formatData.type) {
			case commonConsts.FORMATS.STICKY.NAME:
				$format.css({
					...css,
					...commonConsts.FORMATS.STICKY.BASE_STYLES,
					...this.getPlacementCSS(formatData)
				});
				this.parentNode.append($format.append(this.adCode));
				break;

			case commonConsts.FORMATS.VIDEO.NAME:
				this.createPlayer();
				break;
		}

		adp.interactiveAds.adsRendered += 1;
		const apConfig = adp.config;

		const isConfig = !!apConfig;

		const isExperiment = !!(isConfig && apConfig.experiment);

		const isExperimentPlatform = !!(isExperiment && apConfig.experiment[apConfig.platform]);

		const isExperimentPageGroup = !!(
			isExperimentPlatform && apConfig.experiment[apConfig.platform][apConfig.pageGroup]
		);

		const isExperimentVariations = !!(
			isExperimentPageGroup && apConfig.experiment[apConfig.platform][apConfig.pageGroup].variations
		);

		const isSelectedVariation = !!apConfig.selectedVariation;

		if (
			Object.keys(adp.interactiveAds.ads).length === adp.interactiveAds.adsRendered &&
			!adp.afterJSExecuted &&
			isExperimentVariations &&
			isSelectedVariation
		) {
			const variations = apConfig.experiment[apConfig.platform][apConfig.pageGroup].variations;

			let variation = null;

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
