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
		window.timeout = window.timeout || null;

		console.log(window.timeout);
		if (this.elementInViewport(xPath)) {
			timeout = setTimeout(() => {
				if (window.timeout) {
					if (!window.seen) {
						window.seen = true;
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
			window.timeout = null;
			clearTimeout(timeout);
		}

		//parentNode = createParentNode(xPath, interactiveAd);
		// const inView = new InView(parentNode, interactiveAd, adCode);
	}
}

export default InView;
