// Adp Interactive ads main module

import $ from './src/$';
import './src/events';
import commonConsts from './src/commonConsts';
import emitter from './src/emitter';
import { renderer } from './src/renderer/index';
import config from './src/config';
import InView from './src/renderer/components/InView/index';
// import { generateAdCode } from '../genieeAdSyncService/genieeAp/src/adCodeGenerator';

const createInViewAd = interactiveAd => {
		const parentNode = null;
		const adCode = window.adpushup.generateAdCode(interactiveAd);
		const inView = new InView(parentNode, interactiveAd, adCode);

		return inView;
	},
	processInteractiveAds = (interactiveAds, cb) => {
		const adp = window.adpushup;
		adp.interactiveAds = $.extend({}, config, { adsRendered: 0 });
		interactiveAds.forEach(interactiveAd => {
			adp.interactiveAds.ads[interactiveAd.id] = interactiveAd;
		});

		interactiveAds.forEach((interactiveAd, index) => {
			if (interactiveAd.formatData && interactiveAd.formatData.event) {
				const eventName = interactiveAd.formatData.event;

				if (interactiveAd.formatData.type === commonConsts.FORMATS.IN_VIEW.NAME) {
					interactiveAd.xPathViewed = false;

					const xPaths = interactiveAd.formatData.eventData.value.split(',');

					if (xPaths.length) {
						interactiveAd.formatData.xPaths = xPaths;

						let xPathViewability = {};
						xPaths.forEach(xPath => {
							xPathViewability[xPath] = false;
						});

						interactiveAd.formatData.xPathViewability = xPathViewability;
					}
				}

				switch (eventName) {
					case commonConsts.EVENTS.DOM_LOAD:
						emitter.subscribe(commonConsts.EVENTS.DOM_LOAD, eventData => {
							renderer(interactiveAd);
						});
						break;
					case commonConsts.EVENTS.SCROLL:
						emitter.subscribe(commonConsts.EVENTS.SCROLL, eventData => {
							renderer(interactiveAd, createInViewAd(interactiveAd));
						});
						break;
					case commonConsts.EVENTS.SCRIPT_LOAD:
						renderer(interactiveAd);
						break;
				}
			}
			return index === interactiveAds.length - 1 && cb && typeof cb === 'function' ? cb() : null;
		});
	};

window.adpushup = window.adpushup || {};
window.adpushup.processInnovativeAds = processInteractiveAds;

module.exports = processInteractiveAds;
