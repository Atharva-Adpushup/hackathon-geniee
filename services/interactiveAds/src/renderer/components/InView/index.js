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
		const xPath = '.box_wrapper:eq(2)';
		interactiveAd.timeout = interactiveAd.timeout || null;

		console.log(interactiveAd.timeout);
		if (this.elementInViewport(xPath)) {
			interactiveAd.timeout = setTimeout(() => {
				if (interactiveAd.timeout) {
					console.log(interactiveAd.seen);
					if (!interactiveAd.seen) {
						interactiveAd.seen = true;

						console.log('append');
						$(xPath)
							.append(
								'<div style="margin: 0 auto; width: 300px; height: 250px; background: red">adcode</div>'
							)
							.hide()
							.fadeIn(500);
					}
				}
			}, commonConsts.FORMATS.IN_VIEW.WAIT_TIMEOUT);
		} else {
			interactiveAd.timeout = null;
			clearTimeout(interactiveAd.timeout);
		}

		//parentNode = createParentNode(xPath, interactiveAd);
		// const inView = new InView(parentNode, interactiveAd, adCode);
	}
}

export default InView;
