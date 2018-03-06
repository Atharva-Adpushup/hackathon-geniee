// Top-level component

import commonConsts from '../../commonConsts';
import $ from '../../$';

class Component {
	constructor(parentNode, interactiveAd, adCode) {
		this.parentNode = parentNode;
		this.interactiveAd = interactiveAd;
		this.adCode = adCode;
	}

	render() {
		const { formatData, width, height, id } = this.interactiveAd;
		window.adpInteractive.ads[id] = this.interactiveAd;

		let css = { width, height },
			$format = $('<div />');

		switch (formatData.type) {
			case commonConsts.FORMATS.STICKY.NAME:
				$format.css({
					...css,
					...commonConsts.FORMATS.STICKY.BASE_STYLES,
					...this.getPlacementCSS(formatData)
				});
				return this.parentNode.append($format.append(this.adCode));

			case commonConsts.FORMATS.VIDEO.NAME:
				return this.createPlayer();
				break;
		}
	}
}

export default Component;
