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
		}
	}

	render() {
		const { formatData, width, height, id } = this.interactiveAd;
		adp.interactiveAds.ads[id] = this.interactiveAd;

		if (this.interactiveAd.network === commonConsts.NETWORKS.ADPTAGS) {
			executeAdpTagsHeadCode([this.interactiveAd], {}); // This function expects an array of adpTags and optional adpKeyValues
		}

		let css = { width, height },
			$format = $('<div />'),
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
		$format.attr('data-section', id);

		adp.tracker.add(
			$format,
			function (adId) {
				adp.utils.sendBeacon(adp.config.feedbackUrl, { eventType: 2, click: true, id: adId });
			}.bind(adp, id)
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
		const apConfig = adp.config,
			isConfig = !!(apConfig),
			isExperiment = !!(isConfig && apConfig.experiment),
			isExperimentPlatform = !!(isExperiment && apConfig.experiment[apConfig.platform]),
			isExperimentPageGroup = !!(isExperimentPlatform && apConfig.experiment[apConfig.platform][apConfig.pageGroup]),
			isExperimentVariations = !!(isExperimentPageGroup && apConfig.experiment[apConfig.platform][apConfig.pageGroup].variations),
			isSelectedVariation = !!(apConfig.selectedVariation);

		if (Object.keys(adp.interactiveAds.ads).length === adp.interactiveAds.adsRendered && !adp.afterJSExecuted && isExperimentVariations && isSelectedVariation) {
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
