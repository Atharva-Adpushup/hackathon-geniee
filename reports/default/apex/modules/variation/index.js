var _ = require('lodash'),
	Promise = require('bluebird'),
	AdPushupError = require('../../../../../helpers/AdPushupError'),
	extend = require('extend');

module.exports = {
	getMetrics: function(reportData) {
		var computedData = {};

		if (!reportData || !reportData.data || !reportData.data.rows || !reportData.data.trafficDistribution) {
			throw new AdPushupError('Apex service data should not be empty');
		}

		_.forEach(reportData.data.rows, function(rowData) {
			_.forOwn(reportData.data.trafficDistribution, function(variationObj, variationKey) {
				if (!_.has(computedData, variationKey)) {
					computedData[variationKey] = {
						id: variationObj.id,
						name: variationObj.name,
						trafficDistribution: variationObj.value
					};
				}

				if (variationObj.name === rowData[1]) {
					computedData[variationKey].ctr = rowData[2];
					computedData[variationKey].click = reportData.data.tracked[rowData[2]].adClicks;
				}
			});
		});

		return computedData;
	},
	getFinalData: function(reportData) {
		var computedData = {};

		_.forEach(reportData, function(pageGroupVariationsObj) {
			computedData = extend(true, computedData, pageGroupVariationsObj);
		});

		return computedData;
	},
	computeReportData: function(channel, computedVariationsData) {
		var channelKey = channel.pageGroup + "_" + channel.platform,
			computedVariationsObj = {
				pageGroups: {}
			};

		computedVariationsObj.pageGroups[channelKey] = {
			'variations': {}
		};

		return _.reduce(computedVariationsData, function(hashMap, obj) {
			var key = channelKey;

			hashMap.pageGroups[key].variations = extend(true, hashMap.pageGroups[key].variations, obj);
			return hashMap;
		}, computedVariationsObj);
	}
};
