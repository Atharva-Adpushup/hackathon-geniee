// In-view ad component

import Component from '../Component';
import commonConsts from '../../../commonConsts';
import { createParentNode } from '../../index';

const adp = window.adpushup;

class InView extends Component {
	constructor(parentNode, interactiveAd, adCode) {
		super(parentNode, interactiveAd, adCode);

		this.elementInViewport = this.elementInViewport.bind(this);
		this.initScrollListener = this.initScrollListener.bind(this);
		this.placeInViewAd = this.placeInViewAd.bind(this);
	}

	elementInViewport(el) {
		const elementTop = adp.$(el).offset().top,
			elementBottom = elementTop + adp.$(el).outerHeight(),
			viewportTop = adp.$(window).scrollTop(),
			viewportBottom = viewportTop + adp.$(window).height();

		return elementBottom > viewportTop && elementTop < viewportBottom;
	}

	placeInViewAd(xPath) {
		const { interactiveAd, adCode } = this,
			parentNode = createParentNode(xPath, interactiveAd),
			inView = new InView(parentNode, interactiveAd, adCode);

		return inView.render();
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

							return this.placeInViewAd(xPath);
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
	}
}

export default InView;
