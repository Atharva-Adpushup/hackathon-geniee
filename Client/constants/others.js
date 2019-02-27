// 1: Inapp | 2: Outward | 3: No click
const APPS = [
	{
		name: 'Layout Editor',
		link: 1,
		icon: '/assets/images/manageSites/layout-optimization.png',
		description:
			'Our visual ad manager allows point-and-click creation of new ad units and layouts, while our machine learning based layout optimizer drives sustainable revenue growth using continuous automated A/B testing.'
	},
	{
		name: 'AdRecover',
		type: 2,
		icon: '/assets/images/manageSites/adrecover.png',
		description:
			'Our ad-reinsertion technology helps web publishers recover the money that they are losing due to ad blocking software. The ads we run adhere to the highest UX standards as laid out by the Acceptable Ads Committee.'
	},
	{
		name: 'Innovative Ads',
		link: 1,
		icon: '/assets/images/manageSites/innovative-ads.png',
		description:
			'In addition to standard IAB units, we offer sticky ads, docked ads, in-image ads, and native ads. We fill these ads with premium demand via our partner ad networks and exchanges to maximise publisher revenue.'
	},
	{
		name: 'AP Tag',
		link: 1,
		icon: '/assets/images/manageSites/innovative-ads.png',
		description:
			'In addition to standard IAB units, we offer sticky ads, docked ads, in-image ads, and native ads. We fill these ads with premium demand via our partner ad networks and exchanges to maximise publisher revenue.'
	},
	{
		name: 'Mediation',
		link: 3,
		icon: '/assets/images/manageSites/ad-mediation.png',
		description:
			"AdPushup's Ad mediation helps optimize ad revenue between closed networks. Our smart bid comparison engine uses 15+ parameters to decide which network is awarded each impression, without knowing their bids."
	},
	{
		name: 'AMP',
		link: 3,
		icon: '/assets/images/manageSites/amp.png',
		description:
			'We provide custom implementation of Google’s Accelerated Mobile Pages (AMP) for web publishers. Our focus is on decreasing page load times, maintaining the uniformity of design, and increasing ad yield.'
	},
	{
		name: 'Header Bidding',
		link: 3,
		icon: '/assets/images/manageSites/header-bidding.png',
		description:
			'Open up your ad inventory for bidding by multiple demand sources in real-time. Our system automatically selects the optimal number of demand partners, so that you get the best yield for every single impression.'
	},
	{
		name: 'Manage Ads.txt',
		link: 1,
		icon: '/assets/images/manageSites/header-bidding.png',
		description:
			'Our ad-reinsertion technology helps web publishers recover the money that they are losing due to ad blocking software. The ads we run adhere to the highest UX standards as laid out by the Acceptable Ads Committee.'
	}
];

const STATUSES = {
	danger: {
		type: 'danger',
		icon: 'exclamation-triangle'
	},
	warning: {
		type: 'warning',
		icon: 'exclamation-circle'
	},
	success: {
		type: 'success',
		icon: 'check-circle'
	}
};

export { APPS, STATUSES };
