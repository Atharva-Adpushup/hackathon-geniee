// Sticky ad component

import commonConsts from '../../../commonConsts';
import Component from '../Component';

class Sticky extends Component {
	constructor(parentNode, interactiveAd, adCode) {
		super(parentNode, interactiveAd, adCode);

		this.getPlacementCSS = this.getPlacementCSS.bind(this);
	}

	getPlacementCSS(formatData) {
		const placementCSS = commonConsts.FORMATS.STICKY.PLACEMENT_CSS;

		switch (formatData.placement) {
			case 'top':
				return placementCSS.TOP;
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
