// In-view ad component

import $ from '../../../$';
import Component from '../Component';

class InView extends Component {
	constructor(parentNode, interactiveAd, adCode) {
		super(parentNode, interactiveAd, adCode);

		this.elementInViewport = this.elementInViewport.bind(this);
		this.initScrollListener = this.initScrollListener.bind(this);
	}

	elementInViewport(el) {
		var elementTop = $(el).offset().top;
		var elementBottom = elementTop + $(el).outerHeight();

		var viewportTop = $(window).scrollTop();
		var viewportBottom = viewportTop + $(window).height();

		return elementBottom > viewportTop && elementTop < viewportBottom;
	}

	initScrollListener(interactiveAd) {
		const xPath = '.box_wrapper:eq(2)';

		if (this.elementInViewport(xPath)) {
			console.log(interactiveAd);
		}

		//parentNode = createParentNode(xPath, interactiveAd);
		// const inView = new InView(parentNode, interactiveAd, adCode);
	}
}

export default InView;
