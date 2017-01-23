var extend = require('extend'),
	lodash = require('lodash'),
	Promise = require('bluebird'),
	channelModel = require('../../../../../../models/channelModel'),
	adCodeSlots = {
		get: function(config, site) {
			var channelList = site.get('channels'),
				isChannelPresent = (channelList.indexOf(config.channelKey) > -1),
				self = this;

			if (isChannelPresent) {
				return channelModel.getChannel(config.siteId, config.platform, config.pageGroup)
					.then(self.extract.bind(self, config));
			}
		},
		extract: function(config, channel) {
			var channelJSON = extend(true, {}, channel.toJSON()),
				adCodeArr = [], adCodeSlotArr;

			lodash.forOwn(channelJSON.variations, function(variationObj, variationKey) {
				if (config.variationKey === variationKey.toString()) {
					lodash.forOwn(variationObj.sections, function(sectionObj, sectionKey) {
						lodash.forOwn(sectionObj.ads, function(adObj, adKey) {
							adCodeArr.push(adObj.adCode);
						});
					});
				}
			});

			adCodeSlotArr = lodash.uniq(lodash.compact(lodash.map(adCodeArr, function(adCode) {
				var adCodeSlot, base64DecodedAdCode, isAdSlotPresent;

				base64DecodedAdCode = new Buffer(adCode, 'base64').toString('ascii');
				isAdSlotPresent = (base64DecodedAdCode.match(/data-ad-slot="\d*"/));

				if (isAdSlotPresent) {
					adCodeSlot = (base64DecodedAdCode.match(/data-ad-slot="\d*"/)[0]).replace('data-ad-slot="', '').replace('"', '');
					return adCodeSlot;
				}

				return false;
			})));

			return Promise.resolve(adCodeSlotArr);
		},
		getTotalEarnings: function(data) {
			var totalEarnings = 0;

			lodash.forEach(data.rows, function(row) {
				var earningsItem = Number(row[(row.length - 1)]);
				totalEarnings += earningsItem;
			});

			totalEarnings = Math.round(totalEarnings);
			return Promise.resolve(totalEarnings);
		}
	};

module.exports = adCodeSlots;
