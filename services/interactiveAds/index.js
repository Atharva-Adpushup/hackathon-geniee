// Interactive ads main module

require('./src/events');
require('./src/helpers/polyfills');
import { h, render } from 'preact';
import App from './src/components/App';
window.$ = require('jquery');

var commconConsts = require('./src/commonConsts'),
	emitter = require('./src/emitter'),
	adFormats = require('./src/adFormats'),
	config = {
		format: 'stickyFooter'
	};

var pageLoadEvent = emitter.subscribe(commconConsts.EVENTS.PAGE_LOAD, function(data) {
	//console.log(data);
	// adFormats.createSitckyFooter([728, 90], '728x90');
	var node = document.createElement('div');

	document.body.appendChild(node);
	render(<App {...config} />, node);
});

//pageLoadEvent.unsubscribe();
