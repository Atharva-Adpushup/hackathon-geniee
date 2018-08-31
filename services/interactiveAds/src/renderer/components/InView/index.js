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
		const xPathsArr = interactiveAd.formatData.eventData.value.split(',');
		interactiveAd.timeout = interactiveAd.timeout || null;

		xPathsArr.forEach(xPath => {
			console.log(interactiveAd.timeout);
			if (this.elementInViewport(xPath)) {
				interactiveAd.formatData.xPathViewability[xPath] = true;
				interactiveAd.timeout = setTimeout(() => {
					if (interactiveAd.timeout) {
						console.log(interactiveAd.seen);
						if (!interactiveAd.seen && this.elementInViewport(xPath)) {
							interactiveAd.seen = true;

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
			console.log('cancel timeout');
			interactiveAd.timeout = null;
			clearTimeout(interactiveAd.timeout);
		}

		//parentNode = createParentNode(xPath, interactiveAd);
		// const inView = new InView(parentNode, interactiveAd, adCode);
	}
}

export default InView;
