const Promise = require('bluebird'),
	_ = require('lodash'),
	config = require('../../configs/config'),
	AdPushupError = require('../../helpers/AdPushupError'),
	siteModel = require('../../models/siteModel'),
	channelProcessing = channels => {
		let output = {};
		_.forEach(channels, channel => {
			let variations = channel.variations;
			if (variations && Object.keys(variations).length) {
				_.forEach(variations, variation => {
					let sections = variation.sections;
					if (sections && Object.keys(sections).length) {
						_.forEach(sections, section => {
							let ads = section.ads;
							if (ads && Object.keys(ads).length) {
								_.forEach(ads, ad => {
									if (ad.network == 'geniee' && ad.networkData && ad.networkData.dynamicAllocation) {
										output[ad.networkData.zoneId] = {
											dfpAdunit: ad.networkData.dfpAdunit || '',
											dfpAdunitCode: ad.networkData.dfpAdunitCode || '',
											variationId: variation.id,
											genieePageGroupId: channel.genieePageGroupId,
											dfpNetworkCode: config.dfpNetworkCodes.GENIEE
										};
									}
								});
							}
						});
					}
				});
			}
		});
		return Promise.resolve(output);
	},
	getChannels = siteId => {
		return siteModel.getSiteById(siteId).then(site => site.getAllChannels());
	},
	init = siteId => {
		return getChannels(siteId)
			.then(channelProcessing)
			.then(
				response =>
					Object.keys(response).length
						? response
						: {
								message: 'No Zones found'
							}
			);
	};

module.exports = init;
