// Interactive ads renderer

import commonConsts from '../commonConsts';
import Sticky from './components/Sticky/index';
import Docked from './components/Docked/index';
//import Video from './components/Video/index';
import $ from '../$';
import config from '../config';
import { generateAdCode } from '../../../genieeAdSyncService/genieeAp/src/adCodeGenerator';

const createParentNode = (appendTo, interactiveAd, css = {}, operation = 'append') => {
		const $parentNode = $('<div/>'),
			{ id } = interactiveAd;

		$parentNode.attr({ class: commonConsts.DEFAULT_CLASSNAME });

		// Set CSS on parent node - required in case of video interactive ad format
		if (css && Object.keys(css).length) {
			$parentNode.css(css);
		}

		switch (operation.toLowerCase()) {
			case 'prepend':
				$(appendTo).prepend($parentNode);
				break;
			case 'insertbefore':
				$(appendTo).before($parentNode);
				break;
			case 'insertafter':
				$(appendTo).after($parentNode);
				break;
			case 'append':
			default:
				$(appendTo).append($parentNode);
		}

		return $parentNode;
	},
	renderAd = (interactiveAd, adInstance) => {
		const type = interactiveAd.formatData.type;
		const adCode = generateAdCode(interactiveAd);
		const { value: xPath } = interactiveAd.formatData.eventData; // Value is the xPath

		interactiveAd.status = 1; // Mark interactive ad status as successful impression
		interactiveAd.services = [commonConsts.SERVICES.INTERACTIVE_AD]; // Set service id for interactive ads
		let parentNode = null;

		switch (type) {
			case commonConsts.FORMATS.STICKY.NAME:
				parentNode = createParentNode(xPath ? xPath : 'body', interactiveAd);
				const sticky = new Sticky(parentNode, interactiveAd, adCode);
				return sticky.render();

			case commonConsts.FORMATS.IN_VIEW.NAME:
				return adInstance.initScrollListener(interactiveAd, adCode); // Initialise scroll listener from previously created ad instance

			case commonConsts.FORMATS.DOCKED.NAME:
				const { xpath: adXpath, operation } = interactiveAd.formatData;
				parentNode = createParentNode(adXpath, interactiveAd, {}, operation);
				const docked = new Docked(parentNode, interactiveAd, adCode);
				return docked.render();

			// case commonConsts.FORMATS.VIDEO.NAME:
			// 	const { css } = interactiveAd;
			// 	parentNode = createParentNode(xPath, interactiveAd, css);
			// 	const video = new Video(parentNode, interactiveAd, adCode);
			// 	return video.render();
		}
	},
	renderer = (interactiveAd, adInstance = null) => {
		if (interactiveAd && interactiveAd.formatData) {
			const adp = window.adpushup;

			// if (adp.config.mode === 16) {
			if (
				adp.utils.isUrlMatching() &&
				adp.config.platform.toUpperCase() === interactiveAd.formatData.platform.toUpperCase()
			) {
				renderAd(interactiveAd, adInstance);
			} else {
				return false;
			}
			// } else {
			// 	renderAd(interactiveAd, adInstance);
			// }
		}
	};

export { renderer, createParentNode };
