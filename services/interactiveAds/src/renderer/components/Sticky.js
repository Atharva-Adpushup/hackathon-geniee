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
	Sticky = (parentNode, interactiveAd, adCode) => {
		const { formatData } = interactiveAd,
			css = {
				width: interactiveAd.width,
				height: interactiveAd.height,
				...commonConsts.FORMATS.STICKY.BASE_STYLES,
				...getPlacementCSS(formatData)
			},
			sticky = $('<div />');

		sticky.css(css);
		return parentNode.append(sticky.append(adCode));
	};

export default Sticky;
