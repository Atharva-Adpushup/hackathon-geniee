// Interactive ads main module

console.log('script loaded');

import './src/events';
import './src/helpers/polyfills';
import commconConsts from './src/commonConsts';
import emitter from './src/emitter';
import renderer from './src/renderer';

const processFormats = formats => {
	formats.forEach(format => {
		switch (format.event) {
			case commconConsts.EVENTS.DOM_LOAD:
				console.log(`subscribed to ${format.event} event`);

				console.log(emitter);
				const pageLoadEvent = emitter.subscribe(commconConsts.EVENTS.DOM_LOAD, data => {
					console.log(data);
					//renderer(config);
				});
		}
	});
};

module.exports = processFormats;
