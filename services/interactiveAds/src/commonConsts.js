// Common constants

const commonConsts = {
	EVENTS: {
		DOM_LOAD: 'DOMContentLoaded',
		SCRIPT_LOAD: 'scriptLoaded'
	},
	DEFAULT_CLASSNAME: 'adp_interactive_ad',
	IMA_MODULES_CDN: '//cdn.adpushup.com/videojs-ima/',
	FORMATS: {
		STICKY: {
			NAME: 'sticky',
			BASE_STYLES: {
				position: 'fixed'
			},
			PLACEMENT_CSS: {
				BOTTOM: {
					bottom: 0,
					marginLeft: 'auto',
					marginRight: 'auto',
					left: 0,
					right: 0
				},
				LEFT: {
					left: 0,
					bottom: 0
				},
				RIGHT: {
					right: 0,
					bottom: 0
				}
			}
		},
		VIDEO: {
			NAME: 'video',
			AD_MODULES: {
				CSS: ['video-js.min.css', 'video-js-ads.min.css', 'video-js-ima.min.css'],
				JS: ['video-js-ads.min.js', 'video-js-ima.min.js'],
				IMA_SDK: '//imasdk.googleapis.com/js/sdkloader/ima3.js' 
			}
		}
	}
};

export default commonConsts;
