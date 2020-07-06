const config = require("./config");
const constants = require("./constants");
const bidders = config.PREBID_CONFIG.hbcf;
const isS2SActive = config.S2S_ENABLED;
const s2sBidders = []

for(var bidder in bidders) {
  if (bidders[bidder].isS2SActive) {
    s2sBidders.push(bidder);
  }
}

function generateS2SConfig() {
  if(!isS2SActive || s2sBidders.length === 0) {
    return null;
  }
  return {
    accountId: "1001",
    enabled: true,
    bidders: s2sBidders,
    timeout: constants.PREBID.TIMEOUT,
    adapter: "prebidServer",
    endpoint: config.S2S_AUCTION_ENDPOINT,
    syncEndpoint: config.S2S_SYNC_ENDPOINT,
    extPrebid: {
      targeting: {
        includebidderkeys: false,
        includewinners: true,
      },
    },
  };
}

module.exports = {
  generateS2SConfig
};
