// Sticky ad component

import commonConsts from '../../commonConsts';

const $ = window.adpushup.$ || window.$,
	getPlacementCSS = formatData => {
		const placementCSS = commonConsts.FORMATS.STICKY.PLACEMENT_CSS;

		switch (formatData.placement) {
			case 'bottom':
				return placementCSS.BOTTOM;
			case 'left':
				return placementCSS.LEFT;
			case 'right':
				return placementCSS.RIGHT;
		}
	},
	Sticky = interactiveAd => {
		const { formatData } = interactiveAd,
			css = {
				width: interactiveAd.width,
				height: interactiveAd.height,
				...commonConsts.FORMATS.STICKY.BASE_STYLES,
				...getPlacementCSS(formatData)
			},
			Sticky = $('<div />');

		Sticky.css(css);
		return Sticky;
	};

export default Sticky;
