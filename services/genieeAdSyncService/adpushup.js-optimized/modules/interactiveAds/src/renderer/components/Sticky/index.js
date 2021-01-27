// Sticky ad component

import commonConsts from '../../../commonConsts';
import Component from '../Component';

class Sticky extends Component {
	constructor(parentNode, interactiveAd, adCode) {
		super(parentNode, interactiveAd, adCode);

		this.getPlacementCSS = this.getPlacementCSS.bind(this);
	}

	pushContent(formatData) {
		const { contentOffset = 110, contentXpath = '' } = formatData;
		contentOffset && contentXpath
			? window.adpushup.$(contentXpath).css('margin-top', `${contentOffset}px`)
			: null;
	}

	getPlacementCSS(formatData) {
		const placementCSS = commonConsts.FORMATS.STICKY.PLACEMENT_CSS;

		switch (formatData.placement) {
			case 'top':
				const { topOffset = 0 } = this.interactiveAd.formatData;
				return { ...placementCSS.TOP, top: `${topOffset}px` };
			case 'bottom':
				return placementCSS.BOTTOM;
			case 'left':
			case 'right':
				const { height } = this.interactiveAd;
				const css = { top: (window.innerHeight - height) / 2 };
				return { ...placementCSS[formatData.placement.toUpperCase()], ...css };
		}
	}
}

export default Sticky;
