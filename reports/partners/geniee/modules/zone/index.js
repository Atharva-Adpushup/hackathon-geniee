var Promise = require('bluebird'),
	extend = require('extend'),
	moment = require('moment'),
	_ = require('lodash');

module.exports = {
	removeUnnecessaryZones: function(data) {
		var computedData = {};

		_.forEach(data, function(zonesObj, rootKey) {
			var formattedDate = moment(zonesObj.date.toString()).format('YYYY-MM-DD'),
				validZones = _.filter(zonesObj.zones, 'type');
			
			if (!validZones || !validZones.length) {
				return true;
			}

			computedData[formattedDate] = validZones;
		});

		return Promise.resolve(computedData);
	},
	getZoneVariations: function(pageGroupData) {
		var computedData = extend(true, {}, pageGroupData);

		_.forOwn(pageGroupData, function(pageGroupObj, pageGroupKey) {
			computedData[pageGroupKey].variationData = {};

			_.forEach(pageGroupObj.zones, function(zonesObj) {
				_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
					_.forOwn(variationObj.sections, function(sectionObj, sectionKey) {
						_.forOwn(sectionObj.ads, function(adObj, adKey) {
							if (adObj.networkData && _.isObject(adObj.networkData) && adObj.networkData.zoneId) {
								if (zonesObj.zoneId == adObj.networkData.zoneId) {
									if (!computedData[pageGroupKey].variationData.hasOwnProperty(variationKey) && !computedData[pageGroupKey].variationData[variationKey]) {
										computedData[pageGroupKey].variationData[variationKey] = {
											id: variationObj.id,
											name: variationObj.name,
											trafficDistribution: variationObj.trafficDistribution,
											zones: []
										};
										computedData[pageGroupKey].variationData[variationKey].zones.push(zonesObj);
									} else {
										computedData[pageGroupKey].variationData[variationKey].zones.push(zonesObj);
									}
								}
							}
						});
					});
				});
			});
		});

		return Promise.resolve(computedData);
	}
};
