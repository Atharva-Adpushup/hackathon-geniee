// Adp Interactive ads main module

import $ from './src/$';
import './src/events';
import commonConsts from './src/commonConsts';
import emitter from './src/emitter';
import renderer from './src/renderer/index';
import config from './src/config';
import InView from './src/renderer/components/InView/index';
import { generateAdCode } from '../genieeAdSyncService/genieeAp/src/adCodeGenerator';

window.seen = false;

const createInViewAd = interactiveAd => {
		const parentNode = null,
			adCode = generateAdCode(interactiveAd),
			inView = new InView(parentNode, interactiveAd, adCode);

		return inView;
	},
	processInteractiveAds = interactiveAds => {
		const adp = window.adpushup;
		adp.interactiveAds = $.extend({}, config, { adsRendered: 0 });

		interactiveAds.forEach(interactiveAd => {
			if (interactiveAd.formatData && interactiveAd.formatData.event) {
				adp.interactiveAds.ads[interactiveAd.id] = interactiveAd;
				const eventName = interactiveAd.formatData.event;

				if (interactiveAd.formatData.type === commonConsts.FORMATS.IN_VIEW.NAME) {
					interactiveAd.seen = false;
				}

				switch (eventName) {
					case commonConsts.EVENTS.DOM_LOAD:
						emitter.subscribe(commonConsts.EVENTS.DOM_LOAD, eventData => {
							return renderer(interactiveAd);
						});
						break;
					case commonConsts.EVENTS.SCROLL:
						emitter.subscribe(commonConsts.EVENTS.SCROLL, eventData => {
							return renderer(interactiveAd, createInViewAd(interactiveAd));
						});
						break;
					case commonConsts.EVENTS.SCRIPT_LOAD:
						return renderer(interactiveAd);
						break;
				}
			}
		});
	};

module.exports = processInteractiveAds;
