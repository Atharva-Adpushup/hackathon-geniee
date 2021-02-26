// Top-level component
import constants from '../../../../../config/commonConsts';
import commonConsts from '../../commonConsts';
import adCodeGenerator from '../../../../../src/adCodeGenerator';
// import { executeAdpTagsHeadCode } from '../../../../genieeAdSyncService/genieeAp/src/adCodeGenerator';
// import { executeAfterJS } from '../../../../genieeAdSyncService/genieeAp/src/adCreater';

const adp = window.adpushup;

class Component {
	constructor(parentNode, interactiveAd, adCode) {
		this.parentNode = parentNode;
		this.interactiveAd = interactiveAd;
		this.adCode = adCode;
		this.sendFeedback = this.sendFeedback.bind(this);
		this.createCloseButton = this.createCloseButton.bind(this);
		this.closeAd = this.closeAd.bind(this);
	}

	sendFeedback(options) {
		if (adp && adp.utils && adp.utils.sendFeedback) {
			//adp.utils.sendFeedbackOld(options);
			adp.utils.sendFeedback(options);
		}
	}

	createCloseButton(formatData) {
		const { CLOSE_BUTTON } = commonConsts;
		const $closeButton = adp.$(CLOSE_BUTTON.IMAGE);
		const formatDataCSS =
			formatData.placement === 'top' ? CLOSE_BUTTON.CSS.TOP : CLOSE_BUTTON.CSS.BOTTOM;

		return $closeButton
			.css({ ...CLOSE_BUTTON.CSS.COMMON, ...formatDataCSS })
			.on('click', this.closeAd);
	}

	closeAd() {
		adp.$(this.parentNode).fadeOut(200);
	}

	render() {
		const { formatData, width, height, id, css: customCSS, poweredByBanner = true, networkData } = this.interactiveAd;
		const shouldShowPoweredByBanner = adp.config.poweredByBanner 
			&& poweredByBanner
			&& constants.POWERED_BY_BANNER.SUPPORTED_PLATFORMS.includes(formatData.platform.toUpperCase())
			&& constants.POWERED_BY_BANNER.SUPPORTED_FORMATS.includes(formatData.format.toUpperCase())

		adp.interactiveAds.ads[id] = this.interactiveAd;

		if (this.interactiveAd.network === commonConsts.NETWORKS.ADPTAGS) {
			window.adpushup.executeAdpTagsHeadCode([this.interactiveAd], {}); // This function expects an array of adpTags and optional adpKeyValues
		}

		// const css = { width, height: parseInt(height) + POWERED_BY_BANNER.HEIGHT, ...customCSS };
		const css = { width, height: parseInt(height), ...customCSS };
		const $format = adp.$('<div />');

		// uncomment the below when re-thinking poweredByAdPushup logic
		// const $closeButton = this.createCloseButton(formatData);

		let feedbackOptions = {
			// ads: [this.interactiveAd],
			// xpathMiss: [],
			errorCode: 1,
			//mode: window.adpushup.config.mode,
			mode: 1,
			// referrer: adp.config.referrer,
			// tracking: false,
			variationId: !adp.config.manualModeActive
				? adp.config.selectedVariation
				: commonConsts.MANUAL_ADS.VARIATION
		};

		let feedbackMetaData =
			(adp &&
				adp.utils &&
				adp.utils.getPageFeedbackMetaData &&
				adp.utils.getPageFeedbackMetaData()) ||
			{};

		feedbackOptions = adp.$.extend({}, feedbackOptions, feedbackMetaData);

		// uncomment the below when re-thinking poweredByAdPushup logic
		// const $frame = adp.$('<div />');
		// const newFeedbackAdObj = adp.$.extend({}, this.interactiveAd);
		const adObj = adp.$.extend({}, this.interactiveAd);

		// New feedback
		adObj.status = 1;
		adObj.adUnitType = constants.AD_UNIT_TYPE_MAPPING[formatData.type.toUpperCase()] 
			|| constants.AD_UNIT_TYPE_MAPPING.DISPLAY; // default to display incase of video ads or in view ads.
		//newFeedbackAdObj.ads = [newFeedbackAdObj];
		feedbackOptions.ads = [adObj];

		//feedbackOptions.eventType = 1;
		//feedbackOptions.mode = 1;
		//feedbackOptions.ads = [this.interactiveAd.id];

		$format.attr({ id, 'data-section': id, class: '_ap_apex_ad' });
		// uncomment the below when re-thinking poweredByAdPushup logic
		// $frame.css({
		// 	...commonConsts.FRAME.CSS.COMMON,
		// 	...commonConsts.FRAME.CSS[formatData.placement.toUpperCase()]
		// });
		// if (adp.config.poweredByBanner) {
		// 	$banner = this.createPoweredByBanner(formatData);
		// 	$frame.append($banner);
		// } else {
		// 	$frame.css({ ...commonConsts.FRAME.CSS.DISABLED_BANNER });
		// }
		// $frame.append($closeButton);
		// $format.append($frame);

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

		const $bottomStickyBg = adp.$('<div />')
			.attr('id', `bg-sticky-${networkData.dfpAdunit}`)
			.attr('data-unitheight', height)
			.css({
				width: '100%',
				height,
				background: 'rgba(247,247,247,.9)',
				bottom: 0,
				left: 0,
				right: 0,
				position: 'fixed',
				'margin-left': 'auto',
				'margin-right': 'auto'
			});

		if (shouldShowPoweredByBanner) {
			const bannerFrame = adCodeGenerator.generatePoweredByBanner(networkData.dfpAdunit, {
				...commonConsts.FRAME.CSS.COMMON,
				...commonConsts.FRAME.CSS[formatData.placement.toUpperCase()],
				bottom: `${height}px`
			});
			$format.append(bannerFrame);
		}

		switch (formatData.type) {
			case commonConsts.FORMATS.STICKY.NAME:
				const shouldAppendStickyBg = formatData.placement.toLowerCase() === 'bottom' && !formatData.disableStickyBg;
				$format.css({
					...commonConsts.FORMAT_CSS,
					...commonConsts.FORMATS.STICKY.BASE_STYLES,
					...this.getPlacementCSS(formatData),
					...css
				});
				formatData.placement.toLowerCase() === 'top' ? this.pushContent(formatData) : null;
				shouldAppendStickyBg
					? this.parentNode.append($bottomStickyBg)
					: null;
				this.parentNode.append($format.append(this.adCode));
				break;

			case commonConsts.FORMATS.IN_VIEW.NAME:
				$format.css({
					...commonConsts.FORMAT_CSS,
					...commonConsts.FORMATS.IN_VIEW.BASE_STYLES,
					...css
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
					...commonConsts.FORMAT_CSS,
					...css
				});
				this.parentNode.append($format.append(this.adCode));
				window.adpushup.utils.dockify.dockifyAd(`#${id}`, formatData, window.adpushup.utils);
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
				adp.executeAfterJS(variation);
			}
		}
		return this.sendFeedback(feedbackOptions);
	}
}

export default Component;