const config = require('./config');
const bidders = config.PREBID_CONFIG.hbcf;
const isS2SActive = config.S2S_CONFIG.S2S_ENABLED;
const s2sBidders = [];

for (var bidder in bidders) {
	if (bidders[bidder].isS2SActive) {
		s2sBidders.push(bidder);
	}
}

function generateS2SConfig(prebidClientTimeout) {
	let computedS2STimeout = parseInt(prebidClientTimeout, 10);

	if (!isS2SActive || s2sBidders.length === 0 || isNaN(computedS2STimeout)) {
		return null;
	}

	// adjust s2s timeout so that s2s auction completes before prebid client auction timeout
	computedS2STimeout = prebidClientTimeout - 250;

	return {
		accountId: config.S2S_CONFIG.S2S_ACCOUNT_ID,
		enabled: true,
		bidders: s2sBidders,
		timeout: computedS2STimeout,
		adapter: 'prebidServer',
		endpoint: config.S2S_CONFIG.S2S_AUCTION_ENDPOINT,
		syncEndpoint: config.S2S_CONFIG.S2S_SYNC_ENDPOINT,
		extPrebid: {
			targeting: {
				includebidderkeys: false,
				includewinners: true
			}
		}
	};
}

module.exports = {
	generateS2SConfig
};
