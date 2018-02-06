// Sticky ad component

import commonConsts from '../../commonConsts';
import Component from './Component';

class Sticky extends Component {
	constructor(parentNode, interactiveAd, adCode) {
		super();

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
}	

export default Sticky;
