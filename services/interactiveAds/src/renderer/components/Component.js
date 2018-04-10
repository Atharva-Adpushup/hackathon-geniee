// Top-level component

import commonConsts from '../../commonConsts';
import $ from '../../$';

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
		window.adpInteractive.ads[id] = this.interactiveAd;

		let css = { width, height },
			$format = $('<div />'),
			feedbackOptions = {
				ads: [id],
				xpathMiss: [],
				eventType: 1,
				mode: window.adpushup.config.mode,
				referrer: adp.config.referrer,
				tracking: false,
				variationId: adp.config.selectedVariation
			};

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

		return this.sendFeedback(feedbackOptions);
	}
}

export default Component;
