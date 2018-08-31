// In-view ad component

import $ from '../../../$';
import Component from '../Component';
import commonConsts from '../../../commonConsts';

class InView extends Component {
	constructor(parentNode, interactiveAd, adCode) {
		super(parentNode, interactiveAd, adCode);

		this.elementInViewport = this.elementInViewport.bind(this);
		this.initScrollListener = this.initScrollListener.bind(this);
	}

	elementInViewport(el) {
		const elementTop = $(el).offset().top,
			elementBottom = elementTop + $(el).outerHeight(),
			viewportTop = $(window).scrollTop(),
			viewportBottom = viewportTop + $(window).height();

		return elementBottom > viewportTop && elementTop < viewportBottom;
	}

	initScrollListener(interactiveAd) {
		const { xPaths } = interactiveAd.formatData;
		interactiveAd.timeout = interactiveAd.timeout || null;

		xPaths.forEach(xPath => {
			if (this.elementInViewport(xPath)) {
				interactiveAd.formatData.xPathViewability[xPath] = true;

				interactiveAd.timeout = setTimeout(() => {
					if (interactiveAd.timeout) {
						if (!interactiveAd.xPathViewed && this.elementInViewport(xPath)) {
							interactiveAd.xPathViewed = true;

							console.log('append');
							$(xPath).append(
								'<div style="margin: 0 auto; width: 300px; height: 250px; background: red">adcode</div>'
							);
						}
					}
				}, commonConsts.FORMATS.IN_VIEW.WAIT_TIMEOUT);
			} else {
				interactiveAd.formatData.xPathViewability[xPath] = false;
			}
		});

		let xPathViewable = false;
		Object.keys(interactiveAd.formatData.xPathViewability).forEach(key => {
			if (interactiveAd.formatData.xPathViewability[key]) {
				xPathViewable = true;
			}
		});

		if (!xPathViewable) {
			interactiveAd.timeout = null;
			clearTimeout(interactiveAd.timeout);
		}

		//parentNode = createParentNode(xPath, interactiveAd);
		// const inView = new InView(parentNode, interactiveAd, adCode);
	}
}

export default InView;
