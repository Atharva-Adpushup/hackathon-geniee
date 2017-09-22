const Promise = require('bluebird'),
	extend = require('extend'),
	moment = require('moment'),
	_ = require('lodash'),
	uuid = require('uuid'),
	{ fileLogger } = require('../../../../../helpers/logger/file/index');

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

		fileLogger.info(`Geniee Report Service: GetZoneVariations: Module initialisation`);
		_.forOwn(pageGroupData, function(pageGroupObj, pageGroupKey) {
			// Below 'Deleted Zones' variation has been created to incorporate
			// zones which are deleted from AdPushup variations data (Channel document)
			// but appear in Geniee Reports API response
			var deletedZonesVariationData = {
					key: uuid.v4(),
					name: 'Deleted Zones'
				},
				genieeMatchedZones = [],
				deletedZones;

			computedData[pageGroupKey].variationData = {};
			fileLogger.info(`Geniee Report Service: GetZoneVariations: All valid zones`);
			fileLogger.info(pageGroupObj.zones);

			_.forEach(pageGroupObj.zones, function(zonesObj) {
				_.forOwn(pageGroupObj.variations, function(variationObj, variationKey) {
					_.forOwn(variationObj.sections, function(sectionObj, sectionKey) {
						_.forOwn(sectionObj.ads, function(adObj, adKey) {
							var isGenieeAd = !!(
									adObj.networkData &&
									_.isObject(adObj.networkData) &&
									adObj.networkData.zoneId
								),
								isZoneMatch = isGenieeAd && zonesObj.zoneId == adObj.networkData.zoneId,
								isCustomAd = !!(!adObj.networkData && adObj.adCode);

							if (isGenieeAd) {
								if (isZoneMatch) {
									if (
										!computedData[pageGroupKey].variationData.hasOwnProperty(variationKey) &&
										!computedData[pageGroupKey].variationData[variationKey]
									) {
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

									genieeMatchedZones.push(zonesObj);
								}
							} else if (isCustomAd) {
								if (
									!computedData[pageGroupKey].variationData.hasOwnProperty(variationKey) &&
									!computedData[pageGroupKey].variationData[variationKey]
								) {
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

			fileLogger.info(`Geniee Report Service: GetZoneVariations: All matched zones`);
			fileLogger.info(genieeMatchedZones);

			deletedZones = _.reduce(
				genieeMatchedZones,
				(allZones, arrayItem) => {
					return _.reject(allZones, arrayItem);
				},
				pageGroupObj.zones
			);

			fileLogger.info(`Geniee Report Service: GetZoneVariations: All deleted zones`);
			fileLogger.info(deletedZones);

			if (deletedZones && deletedZones.length) {
				computedData[pageGroupKey].variationData[deletedZonesVariationData.key] = {
					id: deletedZonesVariationData.key,
					name: deletedZonesVariationData.name,
					trafficDistribution: 0,
					zones: deletedZones
				};
			}
		});

		return Promise.resolve(computedData);
	}
};
