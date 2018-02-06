// Sticky ad component

import commonConsts from '../../commonConsts';
const $ = window.adpushup.$ || window.$;

class Sticky {
	constructor(parentNode, interactiveAd, adCode) {
		this.parentNode = parentNode;
		this.interactiveAd = interactiveAd;
		this.adCode = adCode;

		this.getPlacementCSS = this.getPlacementCSS.bind(this);
	}

	getPlacementCSS(formatData) {
		const placementCSS = commonConsts.FORMATS.STICKY.PLACEMENT_CSS;

		switch (formatData.placement) {
			case 'bottom':
				return placementCSS.BOTTOM;
			case 'left':
				return placementCSS.LEFT;
			case 'right':
				return placementCSS.RIGHT;
		}
	}

	render() {
		const { formatData, width, height } = this.interactiveAd,
			css = {
				width,
				height,
				...commonConsts.FORMATS.STICKY.BASE_STYLES,
				...this.getPlacementCSS(formatData)
			},
			sticky = $('<div />');

		sticky.css(css);
		return this.parentNode.append(sticky.append(this.adCode));
	}
}	

export default Sticky;
