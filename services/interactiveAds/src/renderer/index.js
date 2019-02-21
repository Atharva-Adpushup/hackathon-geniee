// Interactive ads renderer

import commonConsts from '../commonConsts';
import Sticky from './components/Sticky/index';
//import Video from './components/Video/index';
import $ from '../$';
import config from '../config';
import { generateAdCode } from '../../../genieeAdSyncService/genieeAp/src/adCodeGenerator';

const createParentNode = (appendTo, interactiveAd, css) => {
		const $parentNode = $('<div/>'),
			{ id } = interactiveAd;

		$parentNode.attr({ class: commonConsts.DEFAULT_CLASSNAME });

		// Set CSS on parent node - required in case of video interactive ad format
		if (css && Object.keys(css).length) {
			$parentNode.css(css);
		}

		$(appendTo).append($parentNode);

		return $parentNode;
	},
	renderAd = interactiveAd => {
		const type = interactiveAd.formatData.type,
			adCode = generateAdCode(interactiveAd),
			{ value } = interactiveAd.formatData.eventData; // Value is the xpath

		interactiveAd.status = 1; // Mark interactive ad status as successful impression
		interactiveAd.services = [commonConsts.SERVICES.INTERACTIVE_AD]; // Set service id for interactive ads
		let parentNode = null;

		switch (type) {
			case commonConsts.FORMATS.STICKY.NAME:
				parentNode = createParentNode(value ? value : 'body', interactiveAd);
				const sticky = new Sticky(parentNode, interactiveAd, adCode);
				return sticky.render();

			// case commonConsts.FORMATS.VIDEO.NAME:
			// 	const { css } = interactiveAd;
			// 	parentNode = createParentNode(value, interactiveAd, css);
			// 	const video = new Video(parentNode, interactiveAd, adCode);
			// 	return video.render();
		}
	},
	renderer = interactiveAd => {
		if (interactiveAd && interactiveAd.formatData) {
			const adp = window.adpushup;

			if (adp.config.mode === 16) {
				if (
					adp.utils.isUrlMatching() &&
					adp.config.platform.toUpperCase() === interactiveAd.formatData.platform.toUpperCase()
				) {
					renderAd(interactiveAd);
				} else {
					return false;
				}
			} else {
				renderAd(interactiveAd);
			}
		}
	};

export default renderer;
