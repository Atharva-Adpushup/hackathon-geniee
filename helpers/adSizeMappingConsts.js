module.exports = {
	// [w, h]: 'w' is width & 'h' is height dimension in ad size array
	IAB_SIZES: {
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
			[970, 250]
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
			'970,250': [[300, 250], [728, 90], [728, 250], [900, 90], [970, 90], [970, 250]]
		},
		BLACK_LIST: [[120, 600], [160, 600], [300, 600]]
	}
};
