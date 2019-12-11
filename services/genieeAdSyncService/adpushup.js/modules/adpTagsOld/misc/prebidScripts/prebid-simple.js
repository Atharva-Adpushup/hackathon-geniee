// Prebid simple setup for tripbuzz.com

var utils = require('../../../../libs/utils');
var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

var PREBID_TIMEOUT = 7000;

// Prebid ad units setup with bidders
var adUnits = [
	{
		code: 'hb-ad-div',
		sizes: [[300, 250]],
		bids: [
			{
				bidder: 'pulsepoint',
				params: { cp: 560684, cf: '300X250', ct: 574151 }
			},
			{
				bidder: 'wideorbit',
				params: { pbId: 577, pId: 95524375 }
			},
			{
				bidder: 'adpushup',
				params: { siteId: 14217, section: 'LISTING_ADRECOVER' }
			},
			{
				bidder: 'aol',
				params: { placement: 4391141, network: 10864.1 }
			}
		]
	}
];

// Callback to be called when all bids have been received
function getAllBids() {
	utils.log(pbjs.getBidResponses());
}

// Prebid method to request bids
pbjs.que.push(function() {
	pbjs.addAdUnits(adUnits);
	pbjs.requestBids({
		timeout: PREBID_TIMEOUT,
		bidsBackHandler: getAllBids
	});
});
