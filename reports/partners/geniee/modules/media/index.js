var _ = require('lodash');

module.exports = {
	getMediaMetrics: function(data) {
		var computedData = {
			"click": 0,
			"pageViews": 0,
			"pageRPM": 0,
			"pageCTR": 0,
			"revenue": 0.0,
			"ctr": 0.0
		};

		_.forEach(_.keys(data), function(dateKey) {
			var zonesArr = data[dateKey];

			_.forEach(zonesArr, function(zoneObj, zoneKey) {
				computedData.click += Number(zoneObj.click);
				computedData.revenue += Number(zoneObj.revenue);
				computedData.ctr += Number(zoneObj.ctr);
			});
		});

		computedData.revenue = Number(computedData.revenue.toFixed(2));
		computedData.ctr = Number(computedData.ctr.toFixed(2));

		return computedData;
	}
};
