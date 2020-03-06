const CONSTANTS = {
	VIDEO: {
		RENDERER_URL: 'https://cdn.jwplayer.com/libraries/AQP5aIG2.js',
		RENDERER_CONFIG: {
			dismissible: true,
			displayHeading: true,
			endstate: 'suspended'
		},
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
	}
};

const mediaTypesConfig = {
	banner: {
		sizes: [] // will be replaced later with actual sizes
	},
	video: {
		context: CONSTANTS.VIDEO.CONTEXT,
		playerSize: [], // will be replaced later with actual size
		mimes: CONSTANTS.VIDEO.MIMES,
		protocols: CONSTANTS.VIDEO.PROTOCOLS,
		api: CONSTANTS.VIDEO.API,
		maxduration: CONSTANTS.VIDEO.MAXDURATION,
		linearity: CONSTANTS.VIDEO.LINEARITY
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
		videoParams: { mimes: CONSTANTS.VIDEO.MIMES }
	},
	rubicon: {
		videoParams: {
			video: {}
		}
	},
	pubmatic: {
		videoParams: {
			video: {
				mimes: CONSTANTS.VIDEO.MIMES
			}
		}
	},
	pulsepoint: {
		videoParams: {
			video: {
				mimes: CONSTANTS.VIDEO.MIMES
			}
		}
	},
	criteo: {
		videoParams: {
			video: {
				playbackmethod: CONSTANTS.VIDEO.PLAYBACKMETHOD,
				placement: CONSTANTS.VIDEO.PLACEMENT,
				skip: CONSTANTS.VIDEO.SKIP
			}
		}
	},
	ix: {
		videoParams: {
			video: {
				mimes: CONSTANTS.VIDEO.MIMES,
				minduration: CONSTANTS.VIDEO.MINDURATION,
				maxduration: CONSTANTS.VIDEO.MAXDURATION,
				protocols: CONSTANTS.VIDEO.PROTOCOLS
			}
		}
	}
};

module.exports = { multiFormatConstants: CONSTANTS, mediaTypesConfig, bidderParamsMapping };
