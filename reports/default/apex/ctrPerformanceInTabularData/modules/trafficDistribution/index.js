var lodash = require('lodash'),
	Promise = require('bluebird');

module.exports = {
	getConfig: function(config, report) {
		var computedConfig = lodash.assign({}, config), rows = report.data.rows,
			variationKey;

		computedConfig.variations = [];
		rows.forEach(function(row) {
			variationKey = row[0];
			computedConfig.variations.push(variationKey);
		});

		return computedConfig;
	},
	set: function(report, trafficDistributionData) {
		var computedReport = lodash.assign({}, report), variationKey, variationObj;

		computedReport.data.rows.forEach(function(row, idx) {
			variationKey = row[0];
			variationObj = trafficDistributionData[variationKey];

			if (trafficDistributionData.hasOwnProperty(variationKey) && variationObj) {
				// Set variation name and its traffic distribution value
				computedReport.data.rows[idx][0] = variationObj.name;
				computedReport.data.rows[idx][2] = variationObj.value;
			} else {
				computedReport.data.rows.splice(idx, 1);
			}
		});

		// Set traffic distribution data in computed report
		computedReport.data.trafficDistribution = trafficDistributionData;
		return Promise.resolve(computedReport);
	}
};
