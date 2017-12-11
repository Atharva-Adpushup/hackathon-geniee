// Events module

var commonConsts = require('./commonConsts'),
	emitter = require('./emitter');

window.addEventListener(commonConsts.EVENTS.PAGE_LOAD, function(data) {
	emitter.publish(commonConsts.EVENTS.PAGE_LOAD, data);
});

window.addEventListener(commonConsts.EVENTS.DOM_LOAD, function(data) {
	emitter.publish(commonConsts.EVENTS.DOM_LOAD, data);
});

window.addEventListener(commonConsts.EVENTS.SCROLL, function(data) {
	emitter.publish(commonConsts.EVENTS.SCROLL, data);
});
