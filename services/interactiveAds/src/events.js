// Events module

var commonConsts = require('./commonConsts'),
	events = {
		onPageLoad: function(callback) {
			window.addEventListener(commconConsts.EVENTS.PAGE_LOAD, function(event) {
				return callback(event);
			});
		}
	};

module.exports = events;
