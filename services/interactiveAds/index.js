// Adp Interactive ads main module

import './src/events';
import commonConsts from './src/commonConsts';
import emitter from './src/emitter';
import renderer from './src/renderer/index';
import config from './src/config';

const processInteractiveAds = interactiveAds => {
	window.adpInteractive = config;

	interactiveAds.forEach(interactiveAd => {
		if (interactiveAd.formatData && interactiveAd.formatData.event) {
			const eventName = interactiveAd.formatData.event;

			switch (eventName) {
				case commonConsts.EVENTS.DOM_LOAD:
					const pageLoadEvent = emitter.subscribe(commonConsts.EVENTS.DOM_LOAD, eventData => {
						renderer(interactiveAd);
					});
					break;
				case commonConsts.EVENTS.SCRIPT_LOAD:
					renderer(interactiveAd);
					break;
			}
		}
	});
};

module.exports = processInteractiveAds;
