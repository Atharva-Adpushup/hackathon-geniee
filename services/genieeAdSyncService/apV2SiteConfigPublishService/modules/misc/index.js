module.exports = {
	isRequirePostScribe: function(ads) {
		var isRequired = false,
			iterator,
			adsLength;

		for (iterator = 0, adsLength = ads.length; iterator < adsLength; iterator++) {
			if (!ads[iterator].syncStatus || !ads[iterator].adslot) {
				isRequired = true;
				break;
			}
		}

		return isRequired;
	},
	getSetupMap: function(channels) {
		var setupMap = {},
			iterator,
			channelsLength,
			channelArray,
			platform,
			pageGroup;

		for (iterator = 0, channelsLength = channels.length; iterator < channelsLength; iterator++) {
			channelArray = channels[iterator].split(':');
			platform = channelArray[0];
			pageGroup = channelArray[1];

			if (!setupMap[platform]) {
				setupMap[platform] = [];
			}

			setupMap[platform].push(pageGroup);
		}

		return setupMap;
	}
};
