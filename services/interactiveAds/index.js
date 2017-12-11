// Interactive ads main module

var commconConsts = require('./src/commonConsts'),
	emitter = require('./src/emitter'),
	events = require('./src/events'),
	adFormats = require('./src/adFormats');

events.onPageLoad(function(data) {
	emitter.publish(commconConsts.EVENTS.PAGE_LOAD, data);
});

var pageLoadEvent = emitter.subscribe(commconConsts.EVENTS.PAGE_LOAD, function(data) {
	//console.log(data);
	adFormats.createSitckyFooter([728, 90], '728x90');
});

//pageLoadEvent.unsubscribe();
