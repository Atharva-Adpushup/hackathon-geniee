// In-view ad component

import commonConsts from '../../../commonConsts';
import Component from '../Component';

class InView extends Component {
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
				return placementCSS.LEFT;
			case 'right':
				return placementCSS.RIGHT;
		}
	}
}

export default InView;
