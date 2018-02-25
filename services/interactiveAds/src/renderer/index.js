// Interactive ads renderer

import commonConsts from '../commonConsts';
import Sticky from './components/Sticky/index';
import Video from './components/Video/index';
import $ from '../$';
import config from '../config';
import { generateAdCode } from '../../../genieeAdSyncService/genieeAp/src/adCodeGenerator';

const createParentNode = (appendTo, interactiveAd, css) => {
		const parentNode = $('<div/>'),
			{ id } = interactiveAd;

		parentNode.attr({ class: commonConsts.DEFAULT_CLASSNAME });

		// Set CSS on parent node - required in case of video interactive ad format
		if (css && Object.keys(css).length) {
			parentNode.css(css);
		}

		$(appendTo).append(parentNode);

		return parentNode;
	},
	renderer = interactiveAd => {
		if (interactiveAd && interactiveAd.formatData) {
			const type = interactiveAd.formatData.type,
				adCode = generateAdCode(interactiveAd);

			let parentNode = null;

			switch (type) {
				case commonConsts.FORMATS.STICKY.NAME:
					parentNode = createParentNode('body', interactiveAd);
					const sticky = new Sticky(parentNode, interactiveAd, adCode);
					return sticky.render();

				case commonConsts.FORMATS.VIDEO.NAME:
					const { value } = interactiveAd.formatData.eventData, // Value is the xpath
						{ css } = interactiveAd;
					parentNode = createParentNode(value, interactiveAd, css);
					const video = new Video(parentNode, interactiveAd, adCode);
					return video.render();
			}
		}
	};

export default renderer;
