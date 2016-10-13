var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	adPushup = null;

function AdPushupEvent() {
	EventEmitter.call(this);
}
util.inherits(AdPushupEvent, EventEmitter);
adPushup = new AdPushupEvent();
adPushup.setMaxListeners(0);
module.exports = adPushup;
