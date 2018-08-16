// In-view ad component

import commonConsts from '../../../commonConsts';
import Component from '../Component';

class InView extends Component {
	constructor(parentNode, interactiveAd, adCode) {
		super(parentNode, interactiveAd, adCode);

		this.initScrollListener = this.initScrollListener.bind(this);
	}

	initScrollListener(interactiveAd) {
		console.log(interactiveAd);
		//parentNode = createParentNode(xPath, interactiveAd);
		// const inView = new InView(parentNode, interactiveAd, adCode);
	}
}

export default InView;
