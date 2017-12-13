// Interactive ads main module

console.log('script loaded');

import './src/events';
import './src/helpers/polyfills';
import renderer from './src/renderer';

const commconConsts = require('./src/commonConsts'),
	emitter = require('./src/emitter');

module.exports = formats => {
	formats.forEach(format => {
		switch (format.event) {
			case commconConsts.EVENTS.DOM_LOAD:
				console.log(`subscribed to ${format.event} event`);

				const pageLoadEvent = emitter.subscribe(commconConsts.EVENTS.DOM_LOAD, data => {
					console.log(data);
					//renderer(config);
				});
		}
	});
};
