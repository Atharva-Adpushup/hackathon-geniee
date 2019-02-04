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
		description: 'A simple way to get ads on your page. Select size, generate code and you are good to go'
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
const adActions = {
	CREATE_AD: 'CREATE_AD',
	UPDATE_ADS_LIST: 'UPDATE_ADS_LIST',
	REPLACE_ADS_LIST: 'REPLACE_ADS_LIST',
	DELETE_AD: 'DELETE_AD',
	UPDATE_AD: 'UPDATE_AD'
};
const uiActions = {
	SET_CREATE_AD_ERROR: 'SET_CREATE_AD_ERROR',
	SET_CREATE_AD_LOADER: 'SET_CREATE_AD_LOADER',
	SET_FETCH_ADS_ERROR: 'SET_FETCH_ADS_ERROR'
};
const globalActions = {
	SET_CURRENT_AD: 'SET_CURRENT_AD',
	SET_META: 'SET_META',
	UPDATE_META: 'UPDATE_META',
	UPDATE_AD_TRACKING_LOGS: 'UPDATE_AD_TRACKING_LOGS',
	SET_AD_TRACKING_LOGS: 'SET_AD_TRACKING_LOGS'
};
const displayAdMessage = `<ol style="font-size: 15px;">
	<li style="margin-bottom: 10px;">AdPushup head code needs to be inserted in the global head of your website.</li>
	<li style="margin-bottom: 10px;">Ads.txt  is mandatory. It needs to be updated incase you already have one. Else please follow the instructions provided here: https://support.google.com/admanager/answer/7441288?hl=en. AdPushup's ads.txt should be appended alongside your existing partners.</li>
	<li style="margin-bottom: 10px; color: red; font-weight: bold; color: #eb575c">Please wait for 24-48 working hours for our operations team to review and approve the website. You'll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com<li>
</ol>
`;
const interactiveAdMessage =
	'Ad has been created. AdPushup will automatically insert ad on your site on the runtime. <div style="margin: 10px 0px; font-size: 16px; color: red; font-weight: bold; color: #eb575c">If you are creating the ads for the first time, please wait for 24-48 hours for our operations team to review and approve the website. You\'ll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</div>';
const adCode = `<div id="__AD_ID__" class="_ap_apex_ad">
	<script>
		var adpushup = adpushup || {};
		adpushup.que = adpushup.que || [];
		adpushup.que.push(function() {
			adpushup.triggerAd("__AD_ID__");
		});
	</script>
</div>`;
const adCodeVideo = `<div id="#adp_video___AD_ID__"></div>`;
const adsTxtData = `#AdX
google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0
#DMX and OpenX
openx.com, 539848768, RESELLER 
districtm.io, 101143, DIRECT
appnexus.com, 1908, RESELLER
appnexus.com, 7944, RESELLER
google.com, pub-9685734445476814, RESELLER, f08c47fec0942fa0
#C1X
c1exchange.com, 14924, RESELLER
#Pulsepoint
contextweb.com,560684,RESELLER,89ff185a4c4e857c
#BrainJuiceMedia
appnexus.com, 3911, RESELLER, f5ab79cb980f11d1
#OFT
appnexus.com, 3153, RESELLER, f5ab79cb980f11d1
districtm.io, 100750, DIRECT
adtech.com, 11095, Reseller
coxmt.com, 2000067907202, Reseller
Openx.com, 537143344, Reseller
indexexchange.com, 175407, Reseller
#Media.net
media.net, 8CUPEPKI9, DIRECT	
sonobi.com, 83729e979b, RESELLER	
coxmt.com, 2000068030802, RESELLER	
districtm.io, 100600, RESELLER	
appnexus.com, 1908, RESELLER, f5ab79cb980f11d1
media.net, 8CUZU1Z30, DIRECT
google.com, pub-7439041255533808, RESELLER, f08c47fec0942fa0
openx.com, 537100188, RESELLER, 6a698e2ec38604c6
altitude-arena.com, EELLLBP86H2PDAQQLSK385CM5G, RESELLER
altitude-arena.com, EELLLBP86H2PDAQQLSK385CM5G, DIRECT
indexexchange.com, 182961, RESELLER
pubmatic.com, 93915, RESELLER, 5d62403b186f2ace
spotxchange.com, 152198, RESELLER, 7842df1d2fe2db34
openx.com, 537141219, RESELLER, 6a698e2ec38604c6
rubiconproject.com, 14410, RESELLER, 0bfd66d529a55807
spotxchange.com, 211156, RESELLER, 7842df1d2fe2db34
spotx.tv, 211156, RESELLER, 7842df1d2fe2db34
#DMXDirect
districtm.io, 101642,DIRECT 
appnexus.com, 1908, RESELLER, f5ab79cb980f11d1 
google.com, pub-9685734445476814, RESELLER, f08c47fec0942fa0 
# 33Across
33across.com,0010b00002AQUQFAA5, DIRECT 
google.com, pub-9557089510405422, RESELLER, f08c47fec0942fa0 
appnexus.com, 1001, RESELLER 
appnexus.com, 3135, RESELLER 
openx.com, 537120563, RESELLER, 6a698e2ec38604c6 
rubiconproject.com, 16414, RESELLER, 0bfd66d529a55807 
pubmatic.com, 156423, RESELLER, 5d62403b186f2ace 
amazon.com, 3411, RESELLER 
criteo.com, 3450, RESELLER
indexexchange.com, 185506, RESELLER
adtech.com, 9993, RESELLER 
aolcloud.net, 9993, RESELLER
openx.com, 539266264, RESELLER, 6a698e2ec38604c6  
appnexus.com, 1356, RESELLER, f5ab79cb980f11d1  
emxdgt.com, 326, RESELLER, 1e1d41537f7cad7f  
google.com, pub-5995202563537249, RESELLER, f08c47fec0942fa0`;
const initCode = `<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/__SITE_ID__/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>`;
const COMPONENT_TITLES = {
	2: 'Create Ad Unit',
	3: 'Ads List',
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
const API_PATHS = {
	FETCH_ADS: '/innovativeAdsManager/data/fetchAds',
	CREATE_AD: '/innovativeAdsManager/data/createAd',
	DELETE_AD: '/innovativeAdsManager/data/deleteAd',
	MODIFY_AD: '/innovativeAdsManager/data/modifyAd',
	MASTER_SAVE: '/innovativeAdsManager/data/masterSave'
};
const USER_AD_LIST_HEADERS = ['Id', 'Name', 'Platform', 'Format', 'Size', 'Traffic', 'Status', 'Actions'];
const OPS_AD_LIST_HEADERS = ['Id', 'Name', 'Platform', 'Format', 'Size', 'Network', 'Traffic', 'Status', 'Actions'];
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
		iconClass: 'btn-icn-copy'
	},
	edit: {
		tooltipText: 'Edit',
		iconClass: 'btn-icn-edit'
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
	adActions,
	uiActions,
	globalActions,
	displayAdMessage,
	interactiveAdMessage,
	adCode,
	adCodeVideo,
	interactiveAdEvents,
	adsTxtData,
	initCode,
	COMPONENT_TITLES,
	AD_OPERATIONS,
	TYPE_OF_ADS,
	INTERACTIVE_ADS_TYPES,
	API_PATHS,
	USER_AD_LIST_HEADERS,
	OPS_AD_LIST_HEADERS,
	USER_AD_LIST_ACTIONS,
	OPS_AD_LIST_ACTIONS,
	AD_LIST_ACTIONS,
	NOOP,
	STATUS_FILTER_OPTIONS,
	FORMAT_FILTER_OPTIONS
};
