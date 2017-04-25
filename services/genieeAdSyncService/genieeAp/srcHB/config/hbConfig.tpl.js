module.exports = {
	/* numeric id of the target site */
 	"siteId"             : __HB_SITE_ID__,

	/* array of domains of site where DFP hooking is needed.
		only applicable when DFP Hooking is in place */
 	"siteDomains"        : __HB_SITE_DOMAINS__,

	/* object having configuration sets of various bidding partners.
		The "key" is the ad size and the "value" is array of partner
		configuration. The code tries to use any unused configuration
		available for a specific size */
 	"biddingPartners"    : __HB_BIDDING_PARTNERS__,

	/* timeout for bid responses in miliseconds. */
 	"prebidTimeout"      : __HB_PREBID_TIMEOUT__,

	/* should DFP be hooked and all its ad units be targeted? */
 	"targetAllDFP"       : __HB_TARGET_ALL_DFP__,

	/* feedback URL where reporting data is sent */
 	"e3FeedbackUrl"		   : __HB_FEEDBACK_URL__,

	/* key-value pairs for bid partner name and the adjustment factor. Eg,
		if it's { adpushup: .98 }, the bid would be multiplied by 0.98 before
		being evaluated. */
 	"bidCpmAdjustments"  : __HB_BID_CPM_ADJUSTMENTS__,

	/* which ad units need GPT slot be created. Eg,
		['*'] -> will create GPT slot for every ADP ad slot defined.
		['ADP_300x600'] -> will target only specific ad unit. */
 	"dfpAdUnitTargeting" : __HB_AD_UNIT_TARGETING__,

	/* key-value pairs of ad unit name and base64-encoded passback */
 	"postbidPassbacks"	 : __HB_POSTBID_PASSBACKS__
 };