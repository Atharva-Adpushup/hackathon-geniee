// Interactive ads main module

var commconConsts = require('./commonConsts'),
	emitter = require('./emitter');

window.addEventListener(commconConsts.EVENTS.PAGE_LOAD, function(event) {
	//emitter.publish(commconConsts.EVENTS.PAGE_LOAD, event);
});

var e = emitter.subscribe(commconConsts.EVENTS.PAGE_LOAD, function(data) {
	console.log(data);
});

e.unsubscribe();

console.log(emitter);
