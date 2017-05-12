var Promise = require('bluebird'),
	extend = require('extend'),
	moment = require('moment'),
	_ = require('lodash'),
	uuid = require('uuid');

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
			// Below 'Deleted Zones' variation has been created to incorporate
			// zones which are deleted from AdPushup variations data (Channel document)
			// but appear in Geniee Reports API response
			var deletedZonesVariationData = {
				key: uuid.v4(),
				name: 'Deleted Zones'
			};

			computedData[pageGroupKey].variationData = {};

			_.forEach(pageGroupObj.zones, function(zonesObj) {
				_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
					_.forOwn(variationObj.sections, function(sectionObj, sectionKey) {
						_.forOwn(sectionObj.ads, function(adObj, adKey) {
							var isGenieeAd = !!(adObj.networkData && _.isObject(adObj.networkData) && adObj.networkData.zoneId),
								isZoneMatch = (isGenieeAd && (zonesObj.zoneId == adObj.networkData.zoneId)),
								isCustomAd = !!(!adObj.networkData && adObj.adCode),
								doesVariationNotExists = !!(!computedData[pageGroupKey].variationData.hasOwnProperty(variationKey) && !computedData[pageGroupKey].variationData[variationKey]),
								doesDeletedZonesVariationNotExists = !!(!computedData[pageGroupKey].variationData.hasOwnProperty(deletedZonesVariationData.key) && !computedData[pageGroupKey].variationData[deletedZonesVariationData.key]);

							if (isGenieeAd) {
								if (isZoneMatch) {
									if (doesVariationNotExists) {
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
								} else {
									const deletedZonesId = `${zonesObj.zoneId}-${zonesObj.date}`;

									if (doesDeletedZonesVariationNotExists) {
										computedData[pageGroupKey].variationData[deletedZonesVariationData.key] = {
											id: deletedZonesVariationData.key,
											name: deletedZonesVariationData.name,
											trafficDistribution: 0,
											zones: {}
										};
										const doesZoneNotExists = !!(!computedData[pageGroupKey].variationData[deletedZonesVariationData.key].zones.hasOwnProperty(deletedZonesId) && !computedData[pageGroupKey].variationData[deletedZonesVariationData.key].zones[deletedZonesId]);

										if (doesZoneNotExists) {
											computedData[pageGroupKey].variationData[deletedZonesVariationData.key].zones[deletedZonesId] = zonesObj;
										}
									} else {
										computedData[pageGroupKey].variationData[deletedZonesVariationData.key].zones[deletedZonesId] = zonesObj;
									}
								}
							} else if (isCustomAd) {
								if (doesVariationNotExists) {
									computedData[pageGroupKey].variationData[variationKey] = {
										id: variationObj.id,
										name: variationObj.name,
										trafficDistribution: variationObj.trafficDistribution,
										zones: [],
										isCustom: true
									};
								}
							}
						});
					});
				});
			});

			computedData[pageGroupKey].variationData[deletedZonesVariationData.key].zones = _.values(computedData[pageGroupKey].variationData[deletedZonesVariationData.key].zones);
		});

		return Promise.resolve(computedData);
	}
};
