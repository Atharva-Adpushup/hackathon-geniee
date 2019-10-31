import $ from 'jquery';
import _ from 'lodash';

import Utils from './utils';
import Event from './event';


var isStringParseable = function (str) {
	return str.indexOf('{') === 0 || str.indexOf("[") === 0;
};

var deepJsonParse = function (stringifiedData) {
	var data = null;
	if (typeof stringifiedData === 'string' && isStringParseable(stringifiedData)) {
		try {
			data = JSON.parse(stringifiedData);
		} catch (d) {
			return null;
		}
	} else {
		data = stringifiedData;
	}

	if (data && typeof data === 'object' && !Array.isArray(data)) {
		_.forEach(data, (value, key) => {
			data[key] = deepJsonParse(value);
		});
	}
	return data;
};

const Messenger = (function ($, Utils, Event) {
	const Messenger = function (target, origin) {
		this.id = Utils.getRandomNumber();
		this.messageQueue = [];
		this.responseQueue = [];
		this.onMessage = new Event();
		this.target = target || window.top;
		this.origin = origin || window.ADP_ORIGIN;
		this.alternateOrigin = window.ADP_SITE_DOMAIN
			? Utils.urlInfo(window.ADP_SITE_DOMAIN).domain
			: false;
		this.messageHandler = Utils.bind(this.handleMessage, this);
		$(window).bind('message', this.messageHandler);
	};

	Messenger.prototype.setTarget = function (target) {
		this.target = target;
	};

	Messenger.prototype.setOrigin = function (origin) {
		this.origin = origin;
	};

	Messenger.prototype.dispose = function () {
		$(window).unbind('message', this.handleMessage);
		this.target = null;
	};
	Messenger.prototype.sendMessage = function (cmd, data) {
		const req = { data: data || {}, cmd, id: this.id };
		this.target.postMessage(JSON.stringify(req), '*');
	};
	Messenger.prototype.isOriginValid = function (e) {
		return true;
		return (
			/.adpushup.com/gi.test(e.origin) ||
			(this.alternateOrigin && Utils.urlInfo(e.origin).domain.indexOf(this.alternateOrigin) !== -1)
		);
	};

	Messenger.prototype.handleMessage = function (e, s) {
		e = e.originalEvent || s;
		if (this.isOriginValid(e)) {
			let req = null;
			try {
				/**
				 * There are some websites which custom implements Array.prototype.toJSON which is called by the JSON.stringify
				 * This leads to either custom/double/nested stringification of the values.
				 * Hence, we are deep parsing any json received from inner js. 
				 */
				// req = JSON.parse(e.data);
				req = deepJsonParse(e.data);
			} catch (d) { }
			if (!req || !req.cmd) {
				// some issue with google.com that's why introduces this check
				return false;
			}
			//console.log(req);
			this.onMessage.fire(req.cmd, req.data);
		}
	};

	return Messenger;
})($, Utils, Event);

export default Messenger;
