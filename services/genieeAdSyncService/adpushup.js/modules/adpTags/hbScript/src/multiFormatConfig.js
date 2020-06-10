const CONSTANTS = {
	VIDEO: {
		RENDERER_URL: 'https://cdn.jwplayer.com/libraries/AQP5aIG2.js',
		JW_PLAYER_CONFIG: {
			autostart: 'true',
			stretching: 'uniform',
			mute: true,
			advertising: {
				dismissible: false,
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
		videoParams: {
			// required
			mimes: CONSTANTS.VIDEO.MIMES,
			// optional
			maxduration: CONSTANTS.VIDEO.MAXDURATION,
			api: CONSTANTS.VIDEO.API,
			protocols: CONSTANTS.VIDEO.PROTOCOLS
		}
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
				// Required params according to the pubmatic documentation and
				// is available in prebid pubmatic video params list
				// Link: https://community.pubmatic.com/display/SSP/Recommended+Video+Parameter+Values
				mimes: CONSTANTS.VIDEO.MIMES,
				minduration: CONSTANTS.VIDEO.MINDURATION,
				maxduration: CONSTANTS.VIDEO.MAXDURATION,
				protocols: CONSTANTS.VIDEO.PROTOCOLS,
				// Recomended params according to the pubmatic documentation and
				// is available in prebid pubmatic video params list
				api: CONSTANTS.VIDEO.API,
				playbackmethod: CONSTANTS.VIDEO.PLAYBACKMETHOD,
				linearity: CONSTANTS.VIDEO.LINEARITY,
				placement: CONSTANTS.VIDEO.PLACEMENT,
				skippable: CONSTANTS.VIDEO.SKIP
			}
		}
	},
	pulsepoint: {
		videoParams: {
			video: {
				// required
				mimes: CONSTANTS.VIDEO.MIMES,
				// optional
				minduration: CONSTANTS.VIDEO.MINDURATION,
				maxduration: CONSTANTS.VIDEO.MAXDURATION,
				protocols: CONSTANTS.VIDEO.PROTOCOLS,
				skip: CONSTANTS.VIDEO.SKIP,
				api: CONSTANTS.VIDEO.API
			}
		}
	},
	criteo: {
		videoParams: {
			video: {
				// required
				playbackmethod: CONSTANTS.VIDEO.PLAYBACKMETHOD,
				placement: CONSTANTS.VIDEO.PLACEMENT,
				skip: CONSTANTS.VIDEO.SKIP,
				// optional
				minduration: CONSTANTS.VIDEO.MINDURATION
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
	},
	openx: {
		videoParams: {
			// openx supported video params are mentioned here
			// https://docs.openx.com/Content/developers/containers/prebid-video-adapter.html
			video: {
				mimes: CONSTANTS.VIDEO.MIMES,
				minduration: CONSTANTS.VIDEO.MINDURATION,
				maxduration: CONSTANTS.VIDEO.MAXDURATION,
				protocols: CONSTANTS.VIDEO.PROTOCOLS,
				api: CONSTANTS.VIDEO.API,
				playbackmethod: CONSTANTS.VIDEO.PLAYBACKMETHOD,
				linearity: CONSTANTS.VIDEO.LINEARITY
			}
		}
	},
	appnexus: {
		/**
		 * AppNexus has different video properties than openRTB standards.
		 * That's why using custom properties here.
		 */
		videoParams: {
			video: {
				mimes: CONSTANTS.VIDEO.MIMES,
				minduration: CONSTANTS.VIDEO.MINDURATION,
				maxduration: CONSTANTS.VIDEO.MAXDURATION,
				skippable: true,
				playback_method: ['auto_play_sound_off'],
				frameworks: [1] // VPAID 2.0
			}
		}
	},
	spotx: {
		videoParams: {
			outstream_function: function() {
				/**
				 * This is just a place holder renderer function as preference
				 * will be given to global renderer function and this won't be called.
				 * Without `outstream_function` property, spotx won't send video bids.
				 */
			}
		}
	}
};

module.exports = { multiFormatConstants: CONSTANTS, mediaTypesConfig, bidderParamsMapping };
