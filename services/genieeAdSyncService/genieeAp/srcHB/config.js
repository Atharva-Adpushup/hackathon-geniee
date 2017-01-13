var __config = {
		siteId           : __PB_SITE_ID__,
		siteDomains      : __PB_SITE_DOMAINS__,
		biddingPartners  : __PB_BIDDING_PARTNERS__,
		prebidTimeout    : __PB_TIMEOUT__,
		e3FeedbackUrl		 : "//x3.adpushup.com/ApexWebService/feedback"
};

__config.getTargetingAdSizes = function(){
	var biddingPartnersSizes = Object.keys(this.biddingPartners);

	return biddingPartnersSizes.map(function( adSize ) {
		var splitSize = adSize.split('x');

		return [+splitSize[0], +splitSize[1]];
	});
};
module.exports = __config;