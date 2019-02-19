const EVENTS = {
	SCRIPT_LOADED: 'scriptLoaded',
	SCROLL: 'scroll'
};
const PLATFORMS = [
	{
		name: 'Desktop',
		image: '/assets/images/interactiveAdsManager/devices/desktop.png',
		key: 'desktop'
	},
	{
		name: 'Mobile',
		image: '/assets/images/interactiveAdsManager/devices/smartphone.png',
		key: 'mobile'
	}
	// {
	// 	name: 'Tablet',
	// 	image: '/assets/images/interactiveAdsManager/devices/tablet.png',
	// 	key: 'tablet'
	// }
];
const FORMATS = {
	DESKTOP: [
		{
			name: 'Sticky Top',
			image: '/assets/images/interactiveAdsManager/formats/desktop/sticky-top.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/sticky-top-disabled.jpg',
			key: 'stickyTop'
		},
		{
			name: 'Sticky Left',
			image: '/assets/images/interactiveAdsManager/formats/desktop/sticky-left.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/sticky-left-disabled.jpg',
			key: 'stickyLeft'
		},
		{
			name: 'Sticky Right',
			image: '/assets/images/interactiveAdsManager/formats/desktop/sticky-right.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/sticky-right-disabled.jpg',
			key: 'stickyRight'
		},
		{
			name: 'Sticky Bottom',
			image: '/assets/images/interactiveAdsManager/formats/desktop/sticky-bottom.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/sticky-bottom-disabled.jpg',
			key: 'stickyBottom'
		},
		{
			name: 'In View',
			image: '/assets/images/interactiveAdsManager/formats/desktop/in-view.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/in-view-disabled.jpg',
			key: 'inView'
		},
		{
			name: 'Docked',
			image: '/assets/images/interactiveAdsManager/formats/desktop/docked.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/docked-disabled.jpg',
			key: 'docked'
		}
	],
	MOBILE: [
		{
			name: 'Sticky Top',
			image: '/assets/images/interactiveAdsManager/formats/mobile/sticky-top.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/mobile/sticky-top-disabled.jpg',
			key: 'stickyTop'
		},
		{
			name: 'Sticky Bottom',
			image: '/assets/images/interactiveAdsManager/formats/mobile/sticky-bottom.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/mobile/sticky-bottom-disabled.jpg',
			key: 'stickyBottom'
		},
		{
			name: 'In View',
			image: '/assets/images/interactiveAdsManager/formats/mobile/in-view.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/mobile/in-view-disabled.jpg',
			key: 'inView'
		}
	]
};
const TYPES = [
	{
		name: 'Display (Text / Image)',
		image: '/assets/images/interactiveAdsManager/display.png',
		key: 'display',
		description:
			'A simple way to get ads on your page. Select size, generate code and you are good to go'
	},
	{
		name: 'Native',
		image: '/assets/images/interactiveAdsManager/native.png',
		key: 'native',
		description:
			'Ads that flow seamlessly inside a list of articles or products on your site, offering a great user experience'
	},
	{
		name: 'Links',
		image: '/assets/images/interactiveAdsManager/links.png',
		key: 'links',
		description: 'Link units display a list of topics that are relevant to the content of your page'
	},
	{
		name: 'AMP Ad',
		image: '/assets/images/interactiveAdsManager/amp.png',
		key: 'amp',
		description: 'AMPHTML ads are a faster, lighter and more secure way to advertise on the web'
	}
];
const SIZES = {
	DESKTOP: {
		DOCKED: ['336x280', '300x250', '250x250', '200x200', '300x600', '160x600', '120x600'],
		INVIEW: ['336x280', '300x250', '250x250', '200x200', '728x90', '468x60', '900x90'],
		STICKYTOP: ['900x90', '728x90'],
		STICKYBOTTOM: ['900x90', '728x90'],
		STICKYLEFT: ['160x600', '300x600', '120x600'],
		STICKYRIGHT: ['160x600', '300x600', '120x600']
	},
	MOBILE: {
		STICKYTOP: ['320x100', '300x100', '320x50', '300x50'],
		STICKYBOTTOM: ['320x100', '300x100', '320x50', '300x50'],
		INVIEW: ['336x280', '300x250', '250x250', '200x200', '320x100', '300x100', '320x50', '300x50']
	}
};
const interactiveAdEvents = ['DOMContentLoaded', 'scriptLoaded']; // load', 'scroll', 'onMills',
const displayAdMessage = `<ol style="font-size: 15px;">
	<li style="margin-bottom: 10px;">AdPushup head code needs to be inserted in the global head of your website.</li>
	<li style="margin-bottom: 10px;">Ads.txt  is mandatory. It needs to be updated incase you already have one. Else please follow the instructions provided here: <a href="https://support.google.com/admanager/answer/7441288?hl=en">https://support.google.com/admanager/answer/7441288?hl=en</a>. AdPushup's ads.txt should be appended alongside your existing partners.</li>
	<li style="margin-bottom: 10px;" class="u-text-red u-text-bold">Please wait for 24-48 working hours for our operations team to review and approve the website. You'll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</li>
</ol>
`;
const interactiveAdMessage =
	'Ad has been created. AdPushup will automatically insert ad on your site on the runtime. <div style="margin: 10px 0px; font-size: 16px; color: red; font-weight: bold; color: #eb575c">If you are creating the ads for the first time, please wait for 24-48 hours for our operations team to review and approve the website. You\'ll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</div>';
const COMPONENT_TITLES = {
	2: 'AdCode Generation',
	3: 'Manage Ads',
	4: 'Ads Txt Config',
	1: 'AdPushup Header Code'
};
const AD_OPERATIONS = ['APPEND', 'PREPEND', 'INSERTAFTER', 'INSERTBEFORE'];
const TYPE_OF_ADS = {
	STRUCTURAL: 1,
	IN_CONTENT: 2,
	INTERACTIVE_AD: 3,
	DOCKED_STRUCTURAL: 4,
	EXTERNAL_TRIGGER_AD: 5,
	LAZYLOAD_STRUCTURAL: 6
};
const INTERACTIVE_ADS_TYPES = {
	VERTICAL: ['stickyLeft', 'stickyRight', 'docked'],
	HORIZONTAL: ['stickyTop', 'stickyBottom'],
	OTHER: ['inView']
};

const USER_AD_LIST_HEADERS = [
	'Id',
	'Name',
	'Platform',
	'Format',
	'Size',
	'Traffic',
	'Status',
	'Actions'
];
const OPS_AD_LIST_HEADERS = [
	'Id',
	'Name',
	'Platform',
	'Format',
	'Size',
	'Network',
	'Traffic',
	'Status',
	'Actions'
];
const USER_AD_LIST_ACTIONS = [
	{ displayText: 'Archive', key: 'archive' },
	{ displayText: 'Format Options', key: 'formatEdit' }
];
const OPS_AD_LIST_ACTIONS = [
	{ displayText: 'Network Options', key: 'networkEdit' },
	{ displayText: 'Archive', key: 'archive' },
	{ displayText: 'Format Options', key: 'formatEdit' }
];
const AD_LIST_ACTIONS = {
	copy: {
		tooltipText: 'Copy',
		iconClass: 'copy'
	},
	edit: {
		tooltipText: 'Edit',
		iconClass: 'edit'
	}
};
const NOOP = () => {};
const STATUS_FILTER_OPTIONS = [
	{
		name: 'Active',
		value: true
	},
	{
		name: 'Archived',
		value: false
	}
];
const FORMAT_FILTER_OPTIONS = [
	{
		name: 'Sticky Top',
		value: 'stickyTop'
	},
	{
		name: 'Sticky Bottom',
		value: 'stickyBottom'
	},
	{
		name: 'Sticky Left',
		value: 'stickyLeft'
	},
	{
		name: 'Sticky Right',
		value: 'stickyRight'
	},
	{
		name: 'Docked',
		value: 'docked'
	},
	{
		name: 'In View',
		value: 'inView'
	}
];

export {
	EVENTS,
	PLATFORMS,
	FORMATS,
	TYPES,
	SIZES,
	displayAdMessage,
	interactiveAdMessage,
	interactiveAdEvents,
	COMPONENT_TITLES,
	AD_OPERATIONS,
	TYPE_OF_ADS,
	INTERACTIVE_ADS_TYPES,
	USER_AD_LIST_HEADERS,
	OPS_AD_LIST_HEADERS,
	USER_AD_LIST_ACTIONS,
	OPS_AD_LIST_ACTIONS,
	AD_LIST_ACTIONS,
	NOOP,
	STATUS_FILTER_OPTIONS,
	FORMAT_FILTER_OPTIONS
};
