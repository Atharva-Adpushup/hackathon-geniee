var _ = require('lodash'),
	Promise = require('bluebird'),
	AdPushupError = require('../../../../../helpers/AdPushupError'),
	extend = require('extend');

module.exports = {
	getMetrics: function(reportData) {
		var computedData = {};

		if (!reportData || !reportData.rows || !reportData.trafficDistribution) {
			throw new AdPushupError('Apex service data should not be empty');
		}

		_.forEach(reportData.rows, function(rowData) {
			_.forOwn(reportData.trafficDistribution, function(variationObj, variationKey) {
				if (!_.has(computedData, variationKey)) {
					computedData[variationKey] = {
						id: variationObj.id,
						name: variationObj.name,
						trafficDistribution: variationObj.value
					};
				}

				if (variationObj.name === rowData[1]) {
					computedData[variationKey].ctr = rowData[2];
					computedData[variationKey].click = reportData.tracked[rowData[2]].adClicks;
				}
			});
		});

		return computedData;
	}
};
