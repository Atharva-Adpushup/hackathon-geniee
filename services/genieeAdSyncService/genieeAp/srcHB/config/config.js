var __config = require('./hbConfig');

__config.getTargetingAdSizes = function(){
	var biddingPartnersSizes = Object.keys(this.biddingPartners);

	return biddingPartnersSizes.map(function( adSize ) {
		var splitSize = adSize.split('x');

		return [+splitSize[0], +splitSize[1]];
	});
};
module.exports = __config;
