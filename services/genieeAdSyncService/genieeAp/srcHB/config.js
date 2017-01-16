var __config = {
		siteId           : 17432,
		siteDomains      : ['moneycontrol.com', 'www.moneycontrol.com'],
		biddingPartners  : {
		 "300x250":[[
			{
				bidder:"pulsepoint",
				params:{
					cf:"300X250",
					cp:560684,
					ct:544725
				}
			},{
				bidder:"sekindoUM",
				params:{
					spaceId:76690
				}
			},
			{
				bidder:"wideorbit",
				params:{
					pbId: 577,
					pId: 96826180
				}
			},
			{
				bidder:"aol",
				params:{
					placement:4416019,
					network:"10864.1",
					server:"adserver.adtechus.com"
				}
			},
			{
				bidder:"sonobi",
				params:{
					ad_unit: "__AD_UNIT__"
				}
			}
		 ]],
		 "728x90":[
			{
				bidder: 'pulsepoint',
				params: {
					cf: '728X90',
					cp: 560684,
					ct: 544724
				}
			}, {
				bidder: 'wideorbit',
				params: {
					pbId: 577,
					pId: 96826182
				}
			}, {
				 bidder:"aol",
				 params:{
					placement:4416020,
					network:"10864.1",
					server:"adserver.adtechus.com"
				 }
			},{
				bidder:"sonobi",
				params:{
					ad_unit: "__AD_UNIT__"
				}
			}
		 ],
		 "300x600":[
			{
				bidder: 'pulsepoint',
				params: {
					cf: '300X600',
					cp: 560684,
					ct: 544733
				}
			},
			{
				bidder:"wideorbit",
				params:{
					pbId:577,
					pId:96826180
				}
			},
			{
				bidder:"aol",
				params:{
					placement:4416022,
					network:"10864.1",
					server:"adserver.adtechus.com"
				}
			},{
				bidder:"sonobi",
				params:{
					ad_unit: "__AD_UNIT__"
				}
			}
		 ],
		 "970x90":[
			{
				bidder: 'pulsepoint',
				params: {
					cf: '970X90',
					cp: 560684,
					ct: 544731
				}
			},
			{
			 bidder:"aol",
			 params:{
				placement:4416021,
				network:"10864.1",
				server:"adserver.adtechus.com"
			 }
		},{
			bidder:"sonobi",
			params:{
				ad_unit: "__AD_UNIT__"
			}
		}
	 ]
	},
	prebidTimeout   : 3000,
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
