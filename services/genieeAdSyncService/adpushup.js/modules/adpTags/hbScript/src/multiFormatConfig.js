const CONSTANTS = {
	VIDEO: {
		RENDERER_URL: 'https://cdn.jwplayer.com/libraries/AQP5aIG2.js',
		JW_PLAYER_CONFIG: {
			autostart: 'viewable',
			stretching: 'uniform',
			mute: true,
			advertising: {
				dismissible: true,
				displayHeading: true,
				endstate: 'suspended'
			}
		},
		CONTEXT: 'outstream',
		MIMES: ['video/mp4', 'video/webm'], // JW Player v8 has in-built support for mp4 and webm
		PROTOCOLS: [2, 3, 5, 6], // VAST 2.0, VAST 3.0, VAST 2.0 Wrapper, VAST 3.0 Wrapper
		API: [2], // VPAID 2.0
		MINDURATION: 0, // in seconds
		MAXDURATION: 300, // in seconds (5 min)
		LINEARITY: 1, // Linear/In-Stream
		PLAYBACKMETHOD: 6, // Entering Viewport with Sound Off by Default
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
		maxduration: CONSTANTS.VIDEO.MAXDURATION
		// linearity: CONSTANTS.VIDEO.LINEARITY // ### Rubicon Specific ###
	},
	native: {
		title: {
			required: true,
			sendId: true
		},
		body: {
			required: true,
			sendId: true
		},
		image: {
			required: true,
			sendId: true
		},
		clickUrl: {
			required: true,
			sendId: true
		}
	}
};

const bidderParamsMapping = {
	conversant: {
		videoParams: { mimes: CONSTANTS.VIDEO.MIMES }
	},
	// Disabled video format on Rubicon
	// rubicon: {
	// 	videoParams: {
	// 		video: {}
	// 	}
	// },
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
