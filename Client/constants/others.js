const LINK_TYPE = {
	INAPP: 'INAPP',
	OUTWARD: 'OUTWARD',
	NOOP: 'NOOP'
};
const TYPE = {
	LINK: 'LINK',
	TEXT: 'TEXT'
};
const DEFAULT_ITEM = {
	type: TYPE.TEXT,
	text: 'Status: __STATUS__'
};
const APPS = [
	{
		name: 'Layout Editor',
		key: 1,
		image: '/assets/images/manageSites/layout-optimization.png',
		description:
			'Our visual ad manager allows point-and-click creation of new ad units and layouts, while our machine learning based layout optimizer drives sustainable revenue growth using continuous automated A/B testing.',
		left: {
			type: TYPE.LINK,
			text: 'View Reports',
			link: LINK_TYPE.INAPP,
			destination: '/reporting/__SITE_ID__',
			icon: 'chart-area'
		},
		right: {
			type: TYPE.LINK,
			text: 'Manage App',
			link: LINK_TYPE.INAPP,
			destination: '/ap-layout/__SITE_ID__',
			icon: 'cog'
		}
	},
	{
		name: 'AdRecover',
		key: 7,
		type: 2,
		image: '/assets/images/manageSites/adrecover.png',
		description:
			'Our ad-reinsertion technology helps web publishers recover the money that they are losing due to ad blocking software. The ads we run adhere to the highest UX standards as laid out by the Acceptable Ads Committee.',
		left: {
			type: TYPE.LINK,
			text: 'View Reports',
			link: LINK_TYPE.INAPP,
			destination: '/reporting/__SITE_ID__',
			icon: 'chart-area'
		},
		right: {
			type: TYPE.LINK,
			text: 'Manage App',
			link: LINK_TYPE.OUTWARD,
			destination: 'https://app.adrecover.com/login',
			icon: 'external-link-alt'
		}
	},
	{
		name: 'Innovative Ads',
		key: 5,
		link: 1,
		image: '/assets/images/manageSites/innovative-ads.png',
		description:
			'In addition to standard IAB units, we offer sticky ads, docked ads, in-image ads, and native ads. We fill these ads with premium demand via our partner ad networks and exchanges to maximise publisher revenue.',
		left: {
			type: TYPE.LINK,
			text: 'View Reports',
			link: LINK_TYPE.INAPP,
			destination: '/reporting/__SITE_ID__',
			icon: 'chart-area'
		},
		right: {
			type: TYPE.LINK,
			text: 'Manage App',
			link: LINK_TYPE.INAPP,
			destination: '/innovative-ads/__SITE_ID__',
			icon: 'cog'
		}
	},
	{
		name: 'AP Tag',
		key: 2,
		link: 1,
		image: '/assets/images/manageSites/innovative-ads.png',
		description:
			'In addition to standard IAB units, we offer sticky ads, docked ads, in-image ads, and native ads. We fill these ads with premium demand via our partner ad networks and exchanges to maximise publisher revenue.',
		left: {
			type: TYPE.LINK,
			text: 'View Reports',
			link: LINK_TYPE.INAPP,
			destination: '/reporting/__SITE_ID__',
			icon: 'chart-area'
		},
		right: {
			type: TYPE.LINK,
			text: 'Manage App',
			link: LINK_TYPE.INAPP,
			destination: '/ap-tag/__SITE_ID__',
			icon: 'cog'
		}
	},
	{
		name: 'Mediation',
		key: 4,
		link: 3,
		image: '/assets/images/manageSites/ad-mediation.png',
		description:
			"AdPushup's Ad mediation helps optimize ad revenue between closed networks. Our smart bid comparison engine uses 15+ parameters to decide which network is awarded each impression, without knowing their bids.",
		full: {
			type: TYPE.TEXT,
			text: 'Status: __STATUS__'
		}
	},
	{
		name: 'AMP',
		key: 6,
		link: 3,
		image: '/assets/images/manageSites/amp.png',
		description:
			'We provide custom implementation of Google’s Accelerated Mobile Pages (AMP) for web publishers. Our focus is on decreasing page load times, maintaining the uniformity of design, and increasing ad yield.',
		full: {
			type: TYPE.TEXT,
			text: 'Status: __STATUS__'
		}
	},
	{
		name: 'Header Bidding',
		key: 3,
		link: 3,
		image: '/assets/images/manageSites/header-bidding.png',
		description:
			'Open up your ad inventory for bidding by multiple demand sources in real-time. Our system automatically selects the optimal number of demand partners, so that you get the best yield for every single impression.',
		full: {
			type: TYPE.TEXT,
			text: 'Status: __STATUS__'
		}
	},
	{
		name: 'Manage Ads.txt',
		key: 8,
		link: 1,
		image: '/assets/images/manageSites/header-bidding.png',
		description:
			'Our ad-reinsertion technology helps web publishers recover the money that they are losing due to ad blocking software. The ads we run adhere to the highest UX standards as laid out by the Acceptable Ads Committee.',
		left: {
			type: TYPE.TEXT,
			text: 'Status: __STATUS__'
		},
		right: {
			type: TYPE.LINK,
			text: 'Manage App',
			link: LINK_TYPE.OUTWARD,
			destination: 'https://console.manageadstxt.com',
			icon: 'external-link-alt'
		}
	}
];

const STATUSES = {
	INACTIVE: {
		type: 'danger',
		icon: 'exclamation-triangle'
	},
	ACTIVE: {
		type: 'success',
		icon: 'check-circle'
	}
};

export { APPS, STATUSES, LINK_TYPE, TYPE, DEFAULT_ITEM };
