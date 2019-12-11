function getDefaultNetworkData(network) {
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
	return response;
}

export { getDefaultNetworkData };
