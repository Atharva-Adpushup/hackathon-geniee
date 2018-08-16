// Adp Interactive ads main module

import $ from './src/$';
import './src/events';
import commonConsts from './src/commonConsts';
import emitter from './src/emitter';
import renderer from './src/renderer/index';
import config from './src/config';

const processInteractiveAds = interactiveAds => {
	window.adpushup.interactiveAds = $.extend({}, config, { adsRendered: 0 });

	interactiveAds.forEach(interactiveAd => {
		if (interactiveAd.formatData && interactiveAd.formatData.event) {
			const eventName = interactiveAd.formatData.event;

			switch (eventName) {
				case commonConsts.EVENTS.DOM_LOAD:
					emitter.subscribe(commonConsts.EVENTS.DOM_LOAD, eventData => {
						return renderer(interactiveAd);
					});
					break;
				case commonConsts.EVENTS.SCROLL:
					emitter.subscribe(commonConsts.EVENTS.SCROLL, eventData => {
						return renderer(interactiveAd);
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
