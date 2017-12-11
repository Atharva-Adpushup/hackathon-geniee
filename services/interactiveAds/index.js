// Interactive ads main module

require('./src/events');
require('./src/helpers/polyfills');

window.$ = require('jquery');

var commconConsts = require('./src/commonConsts'),
	emitter = require('./src/emitter'),
	adFormats = require('./src/adFormats');

var pageLoadEvent = emitter.subscribe(commconConsts.EVENTS.PAGE_LOAD, function(data) {
	//console.log(data);
	adFormats.createSitckyFooter([728, 90], '728x90');
});

//pageLoadEvent.unsubscribe();
