import Utils from '../libs/utils'
function getDefaultNetworkData(network, isResponsive) {
	let response = {};
	switch (network) {
		case 'adpTags':
			response = {
				priceFloor: 0,
				headerBidding: false
			};
			break;
		case 'adsense':
		case 'adx':
		case 'dfp':
		case 'custom':
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
