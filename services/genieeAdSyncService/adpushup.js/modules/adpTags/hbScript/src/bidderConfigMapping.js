const CONSTANTS = {
	CONTEXT: 'outstream',
	MIMES: ['video/mp4', 'video/webm'], // JW Player v8 has in-built support for mp4 and webm
	PROTOCOLS: [3], // VAST 3.0
	API: [2], // VPAID 2.0
	MINDURATION: 0, // in seconds
	MAXDURATION: 300, // in seconds
	LINEARITY: 1, // Linear/In-Stream
	PLAYBACKMETHOD: 2, // Auto-play sound off
	PLACEMENT: 2, // In-Banner
	SKIP: 1 // show skip option
};

const mediaTypesConfig = {
	banner: {
		sizes: [] // will be replaced later with actual sizes
	},
	video: {
		context: CONSTANTS.CONTEXT,
		playerSize: [], // will be replaced later with actual size
		mimes: CONSTANTS.MIMES,
		protocols: CONSTANTS.PROTOCOLS,
		api: CONSTANTS.API,
		maxduration: CONSTANTS.MAXDURATION,
		linearity: CONSTANTS.LINEARITY
	},
	native: {
		title: {
			required: true
		},
		body: {
			required: true
		},
		image: {
			required: true
		},
		sponsoredBy: {
			required: true
		}
	}
};

const bidderParamsMapping = {
	conversant: {
		videoParams: { mimes: CONSTANTS.MIMES }
	},
	rubicon: {
		videoParams: {
			video: {}
		}
	},
	pubmatic: {
		videoParams: {
			video: {
				mimes: CONSTANTS.MIMES
			}
		}
	},
	pulsepoint: {
		videoParams: {
			video: {
				mimes: CONSTANTS.MIMES
			}
		}
	},
	criteo: {
		videoParams: {
			video: {
				playbackmethod: CONSTANTS.PLAYBACKMETHOD,
				placement: CONSTANTS.PLACEMENT,
				skip: CONSTANTS.SKIP
			}
		}
	},
	ix: {
		videoParams: {
			video: {
				mimes: CONSTANTS.MIMES,
				minduration: CONSTANTS.MINDURATION,
				maxduration: CONSTANTS.MAXDURATION,
				protocols: CONSTANTS.PROTOCOLS
			}
		}
	}
};

module.exports = { mediaTypesConfig, bidderParamsMapping };
