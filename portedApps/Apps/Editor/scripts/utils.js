import Utils from '../libs/utils'
function getDefaultNetworkData(network, networkData) {
	let response = {};
	let { isResponsive, refreshSlot, headerBidding, refreshInterval, adCode, adunitId } = networkData;
	let defaultRefreshSlot = refreshSlot ? refreshSlot : false;
	let defaultHeaderBidding = headerBidding ? headerBidding : false;
	let defaultRefreshInterval = refreshInterval ? refreshInterval : null;
	let defaultAdCode = adCode ? adCode : null;
	let defaultAdunitId = adunitId ? adunitId : null;
	switch (network) {
		case 'adpTags':
			response = {
				priceFloor: 0,
				headerBidding: defaultHeaderBidding,
				refreshSlot: defaultRefreshSlot,
				refreshInterval: defaultRefreshInterval
			};
			break;
		case 'adsense': 
		case 'adx':
		case 'dfp':
			response = {
				adCode: defaultAdCode,
				adunitId: defaultAdunitId
			};
			break;
		case 'custom':
			response = {
				refreshSlot: defaultRefreshSlot,
				refreshInterval: defaultRefreshInterval,
				adCode: defaultAdCode,
			};
			break;
		default:
			response = {};
			break;
	}
	if(Utils.isDef(isResponsive)) {
		response.isResponsive = isResponsive;
	}
	return response;
}

export { getDefaultNetworkData };
