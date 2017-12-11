// Events module

var commonConsts = require('./commonConsts'),
	events = {
		onPageLoad: function(callback) {
			window.addEventListener(commonConsts.EVENTS.PAGE_LOAD, function(event) {
				return callback(event);
			});
		}
	};

module.exports = events;
