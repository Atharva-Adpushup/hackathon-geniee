const networks = ['adsense', 'adpTags', 'custom', 'medianet'];
const defaultPriceFloorKey = 'FP_S_A';
const partners = {
	geniee: {
		name: 'geniee',
		networks: {
			disabled: ['adpTags', 'medianet']
		}
	},
	list: ['geniee']
};
const priceFloorKeys = ['FP_S_A', 'FP_B_A', 'FP_S', 'FP_A', 'FP_B'];
const iabSizes = {
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
	MULTIPLE_AD_SIZES_SUPPORTED_NETWORKS: ['adpTags'],
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
const refreshIntervals = [30, 60, 90, 120, 180, 240, 300, 360];
const supportedAdSizes = [
	{
		layoutType: 'SQUARE',
		sizes: [
			{ width: 300, height: 250 },
			{ width: 250, height: 250 },
			{ width: 200, height: 200 },
			{ width: 336, height: 280 }
		]
	},
	{
		layoutType: 'HORIZONTAL',
		sizes: [
			{ width: 728, height: 90 },
			{ width: 468, height: 60 },
			{ width: 900, height: 90 },
			{ width: 970, height: 250 }
		]
	},
	{
		layoutType: 'VERTICAL',
		sizes: [
			{ width: 300, height: 600 },
			{ width: 160, height: 600 },
			{ width: 120, height: 600 },
			{ width: 300, height: 1050 }
		]
	},
	{
		layoutType: 'MOBILE',
		sizes: [
			{ width: 320, height: 50 },
			{ width: 300, height: 250 },
			{ width: 250, height: 250 },
			{ width: 200, height: 200 },
			{ width: 320, height: 100 }
		]
	}
];
const commonSupportedSizes = [
	{
		layoutType: 'SQUARE',
		sizes: [
			{ width: 300, height: 250 },
			{ width: 250, height: 250 },
			{ width: 200, height: 200 },
			{ width: 336, height: 280 }
		]
	},
	{
		layoutType: 'HORIZONTAL',
		sizes: [{ width: 728, height: 90 }, { width: 468, height: 60 }]
	},
	{
		layoutType: 'VERTICAL',
		sizes: [{ width: 300, height: 600 }, { width: 160, height: 600 }, { width: 120, height: 600 }]
	},
	{
		layoutType: 'MOBILE',
		sizes: [
			{ width: 320, height: 50 },
			{ width: 300, height: 250 },
			{ width: 250, height: 250 },
			{ width: 200, height: 200 },
			{ width: 320, height: 100 }
		]
	},
	{
		layoutType: 'RESPONSIVE',
		sizes: [{ width: 'responsive', height: 'responsive' }]
	}
];

export {
	networks,
	defaultPriceFloorKey,
	partners,
	priceFloorKeys,
	iabSizes,
	refreshIntervals,
	supportedAdSizes,
	commonSupportedSizes
};
