var Promise = require('bluebird');

module.exports = {
	calculate: function(pageViews, earnings) {
		var rpm = ((earnings / pageViews) * 1000);

		rpm = Number(rpm.toFixed(2));
		return Promise.resolve(rpm);
	}
};
