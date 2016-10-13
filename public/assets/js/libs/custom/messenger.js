var Utils = require('./utils'),
	Event = require('./event'),
	$ = require('libs/third-party/jquery');


module.exports = (function($, Utils, Event) {
	var Messenger = function(target, origin) {
		this.id = Utils.getRandomNumber();
		this.messageQueue = [];
		this.responseQueue = [];
		this.onMessage = new Event();
		this.target = target || window.top;
		this.origin = origin || window.ADP_ORIGIN;
		this.alternateOrigin = window.ADP_SITE_DOMAIN ? Utils.urlInfo(window.ADP_SITE_DOMAIN).domain : false;
		this.messageHandler = Utils.bind(this.handleMessage, this);
		$(window).bind('message', this.messageHandler);
	};

	Messenger.prototype.setTarget = function(target) {
		this.target = target;
	};

	Messenger.prototype.setOrigin = function(origin) {
		this.origin = origin;
	};

	Messenger.prototype.dispose = function() {
		$(window).unbind('message', this.handleMessage);
		this.target = null;
	};
	Messenger.prototype.sendMessage = function(cmd, data) {
		var req = {data: data || {}, cmd: cmd, id: this.id};
		this.target.postMessage(JSON.stringify(req), '*');
	};
	Messenger.prototype.isOriginValid = function(e) {
		return ((/.adpushup.com/gi).test(e.origin) ||
		(this.alternateOrigin && Utils.urlInfo(e.origin).domain.indexOf(this.alternateOrigin) !== -1));
	};

	Messenger.prototype.handleMessage = function(e, s) {
		e = e.originalEvent || s;
		if (this.isOriginValid(e)) {
			var req = null;
			try {
				req = JSON.parse(e.data);
			} catch (d) {
			}
			if (!req || !req.cmd) // some issue with google.com that's why introduces this check
				return false;
			this.responseQueue.push(req);
			var cmd = req.cmd, data = req.data;
			this.onMessage.fire(cmd, data);
		}
	};

	return Messenger;
})( $, Utils, Event );
