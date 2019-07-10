import _ from 'lodash';
import $ from 'jquery';
import Utils from '../libs/utils';

const getParsedQueryParam = hash => JSON.parse(decodeURIComponent(atob(hash))),
	getEncodedQueryParam = queryParamKey => {
		let encodedHash = Utils.queryParams()[queryParamKey];

		if (encodedHash) {
			// Replace whitespace characters
			encodedHash = encodedHash.replace(/\s/g, '+');

			return getParsedQueryParam(encodedHash);
		}

		return false;
	},
	openPageGroupIfPresent = initialData => {
		const computedData = $.extend(true, {}, initialData),
			updateHashData = getEncodedQueryParam('updateHash'),
			isChannelData = !!(computedData && computedData.channelData),
			isChannelPresent = !!(computedData.channelData.byIds && Object.keys(computedData.channelData.byIds).length),
			isAnyChannelPresent = !!(isChannelData && isChannelPresent),
			isUpdateHash = !!(updateHashData && Object.keys(updateHashData).length && updateHashData.pageGroups);

		if (isUpdateHash && isAnyChannelPresent) {
			_.forOwn(computedData.channelData.byIds, (channelData, channelId) => {
				if (updateHashData.pageGroups.indexOf(channelData.channelName) > -1) {
					computedData.channelData.byIds[channelId].isOpen = true;
					computedData.channelData.activeChannel = channelId;
				}
			});
		}

		return computedData;
	};

export { openPageGroupIfPresent };
