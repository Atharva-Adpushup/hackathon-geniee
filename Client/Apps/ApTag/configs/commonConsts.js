const PLATFORMS = [
	{
		name: 'Desktop',
		image: '/assets/images/tagManager/devices/desktop.png',
		key: 'desktop'
	},
	{
		name: 'Mobile',
		image: '/assets/images/tagManager/devices/smartphone.png',
		key: 'mobile'
	}
];
const TYPES = [
	{
		name: 'Display (Text / Image)',
		image: '/assets/images/tagManager/display.png',
		key: 'display',
		description:
			'A simple way to get ads on your page. Select size, generate code and you are good to go'
	},
	{
		name: 'Native',
		image: '/assets/images/tagManager/native.png',
		key: 'native',
		description:
			'Ads that flow seamlessly inside a list of articles or products on your site, offering a great user experience'
	},
	{
		name: 'Links',
		image: '/assets/images/tagManager/links.png',
		key: 'links',
		description: 'Link units display a list of topics that are relevant to the content of your page'
	},
	{
		name: 'AMP Ad',
		image: '/assets/images/tagManager/amp.png',
		key: 'amp',
		description: 'AMPHTML ads are a faster, lighter and more secure way to advertise on the web'
	}
];
const SIZES = {
	DISPLAY: {
		ALLOWED: ['responsive', 'desktop', 'mobile'],
		DESKTOP: [
			'970x250',
			'970x90',
			'728x250',
			'728x90',
			'468x60',
			'336x280',
			'320x50',
			'300x600',
			'300x100',
			'250x250',
			'240x240',
			'234x60',
			'200x200',
			'180x150',
			'160x600',
			'120x600',
			'120x240',
			'300x250'
		],
		MOBILE: ['320x50', '300x250', '250x250', '200x200', '320x100', '336x280']
	},
	NATIVE: {
		ALLOWED: ['desktop', 'mobile'],
		DESKTOP: [
			'970x250',
			'970x90',
			'728x250',
			'728x90',
			'468x60',
			'336x280',
			'320x50',
			'300x600',
			'300x100',
			'250x250',
			'240x240',
			'234x60',
			'200x200',
			'180x150',
			'160x600',
			'120x600',
			'120x240',
			'300x250'
		],
		MOBILE: ['320x50', '300x250', '250x250', '200x200', '320x100', '336x280']
	},
	LINKS: {
		ALLOWED: ['responsive', 'desktop', 'mobile'],
		DESKTOP: ['336x280', '120x600', '1070x250', '320x100', '336x280', '300x250', '468x60'],
		MOBILE: ['320x100', '336x280', '300x250', '468x60']
	},
	AMP: {
		ALLOWED: ['mobile'],
		DESKTOP: [
			'970x250',
			'970x90',
			'728x250',
			'728x90',
			'468x60',
			'336x280',
			'320x50',
			'300x600',
			'300x100',
			'250x250',
			'240x240',
			'234x60',
			'200x200',
			'180x150',
			'160x600',
			'120x600',
			'120x240',
			'300x250'
		],
		MOBILE: ['320x50', '300x250', '250x250', '200x200', '320x100', '336x280']
	}
};
const DISPLAY_AD_MESSAGE =
	'You need to copy and paste the above adcode on your site where you wish to show the ad. <div style="margin: 10px 0px; font-size: 16px; color: red; font-weight: bold; color: #eb575c">If you are creating the ads for the first time, please wait for 24-48 hours for our operations team to review and approve the website. You\'ll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</div>';
const AMP_MESSAGE =
	'AMP adcode will be sent to your registered e-mail address by your account manager';
const ADCODE = `<div id="__AD_ID__" class="_ap_apex_ad">
	<script>
		var adpushup = adpushup || {};
		adpushup.que = adpushup.que || [];
		adpushup.que.push(function() {
			adpushup.triggerAd("__AD_ID__");
		});
	</script>
</div>`;
const ADS_TXT_DATA = `#AdX
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
const INIT_CODE = `<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/__SITE_ID__/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>`;
const COMPONENT_TITLES = {
	1: 'Create Ad Unit',
	2: 'Ads List'
	// 4: 'Ads Txt Config',
	// 1: 'AdPushup Header Code'
};
const NETWORKS = ['adsense', 'adpTags', 'custom', 'geniee', 'medianet'];
const PRICE_FLOOR_KEYS = ['FP_S_A', 'FP_B_A', 'FP_S', 'FP_A', 'FP_B'];
const DEFAULT_PRICE_FLOOR_KEY = 'FP_S_A';
const PARTNERS = {
	geniee: {
		name: 'geniee',
		networks: {
			disabled: ['adpTags', 'medianet']
		}
	},
	list: ['geniee']
};
const IAB_SIZES = {
	ALL: [
		[120, 600],
		[160, 600],
		[200, 200],
		[240, 400],
		[250, 250],
		[300, 50],
		[300, 100],
		[300, 250],
		[300, 600],
		[320, 50],
		[320, 100],
		[320, 480],
		[336, 280],
		[468, 60],
		[480, 320],
		[720, 300],
		[728, 90],
		[728, 250],
		[728, 280],
		[900, 90],
		[970, 90],
		[970, 250],
		['responsive', 'responsive']
	],
	MULTIPLE_AD_SIZES_WIDTHS_MAPPING: {
		'300': [[300, 50], [300, 100], [300, 250], [300, 600]],
		'320': [[320, 50], [320, 100], [320, 480]],
		'728': [[728, 90], [728, 250], [728, 280]],
		'970': [[970, 90], [970, 250]]
	},
	// The backward compatible size array for every ad size contains itself as well
	BACKWARD_COMPATIBLE_MAPPING: {
		// MOBILE sizes
		'120,600': [[120, 600]],
		'160,600': [[120, 600], [160, 600]],
		'200,200': [[200, 200]],
		'240,400': [[200, 200], [240, 400]],
		'250,250': [[200, 200], [250, 250]],
		'300,50': [[300, 50]],
		'300,100': [[300, 50], [300, 100]],
		'300,250': [[300, 250]],
		'300,600': [[160, 600], [300, 250], [300, 600]],
		'320,50': [[320, 50]],
		'320,100': [[320, 50], [320, 100]],
		'320,480': [[300, 250], [320, 50], [320, 100], [320, 480]],
		'336,280': [[300, 250], [336, 280]],
		// TABLET sizes
		'468,60': [[468, 60]],
		'480,320': [[250, 250], [300, 250], [320, 50], [320, 100], [336, 280], [468, 60], [480, 320]],
		// DESKTOP sizes
		'720,300': [[300, 250], [336, 280], [720, 300]],
		'728,90': [[728, 90]],
		'728,250': [[300, 250], [728, 90], [728, 250]],
		'728,280': [[300, 250], [336, 280], [728, 90], [728, 250], [728, 280]],
		'900,90': [[728, 90], [900, 90]],
		'970,90': [[728, 90], [900, 90], [970, 90]],
		'970,250': [[300, 250], [728, 90], [728, 250], [900, 90], [970, 90], [970, 250]],
		// RESPONSIVE size
		'responsive,responsive': [
			[120, 600],
			[160, 600],
			[200, 200],
			[240, 400],
			[250, 250],
			[300, 50],
			[300, 100],
			[300, 250],
			[300, 600],
			[320, 50],
			[320, 100],
			[320, 480],
			[336, 280],
			[468, 60],
			[480, 320],
			[720, 300],
			[728, 90],
			[728, 250],
			[728, 280],
			[900, 90],
			[970, 90],
			[970, 250]
		]
	}
};

export {
	PLATFORMS,
	TYPES,
	SIZES,
	DISPLAY_AD_MESSAGE,
	ADCODE,
	ADS_TXT_DATA,
	INIT_CODE,
	AMP_MESSAGE,
	COMPONENT_TITLES,
	NETWORKS,
	PRICE_FLOOR_KEYS,
	DEFAULT_PRICE_FLOOR_KEY,
	PARTNERS,
	IAB_SIZES
};
